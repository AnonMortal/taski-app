import { parseUnits, decodeEventLog, type Address, type Hash } from 'viem';
import { getPublicClient, USDC_DECIMALS } from './chain';
import { ERC20_ABI, TASK_MANAGER_ABI } from './abis';

const RECEIPT_POLL_INTERVAL_MS = 1500;
const RECEIPT_TIMEOUT_MS = 60_000;

export interface CreateMissionParams {
  client: Address;
  usdc: Address;
  taskManager: Address;
  rewardUsdc: number;
  workWindowSec: number;
  /** Should call `wallet.writeContract(...)` and return the tx hash. */
  writeContract: (params: {
    address: Address;
    abi: readonly unknown[];
    functionName: string;
    args: readonly unknown[];
  }) => Promise<Hash>;
  /** Progress callback for the 3-state UX. */
  onProgress?: (step: 'approving' | 'locking' | 'done', txHash?: Hash) => void;
}

export interface CreateMissionResult {
  taskId: bigint;
  txHash: Hash;
}

/**
 * Lock the bounty on-chain. Steps:
 *   1. (skipped if allowance >= reward) USDC.approve(taskManager, reward)
 *   2. TaskManager.createTask(reward, workWindow) — pulls USDC via transferFrom
 *   3. Decode `TaskCreated` event from the receipt to get the taskId.
 *
 * Pre-flight checks (USDC balance, ETH gas, minWorkWindow, config readiness,
 * input validation, SIWE) must happen at the caller — this helper assumes
 * the inputs are sane and the wallet is ready to sign.
 */
export async function createMissionOnChain(p: CreateMissionParams): Promise<CreateMissionResult> {
  const pub = getPublicClient();
  if (!pub) throw new Error('Public RPC client unavailable');

  const rewardWei = parseUnits(String(p.rewardUsdc), USDC_DECIMALS);

  // Log all on-chain params so a failure is easy to diagnose from DevTools.
  // eslint-disable-next-line no-console
  console.info('[createMissionOnChain] params:', {
    client: p.client,
    usdc: p.usdc,
    taskManager: p.taskManager,
    rewardUsdc: p.rewardUsdc,
    rewardWei: rewardWei.toString(),
    workWindowSec: p.workWindowSec,
  });

  // 1. Read current allowance for visibility (we always approve, see below).
  const allowance = (await pub.readContract({
    address: p.usdc,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [p.client, p.taskManager],
  })) as bigint;
  // eslint-disable-next-line no-console
  console.info(
    `[createMissionOnChain] current allowance = ${allowance} wei, need ${rewardWei}. Approving anyway.`,
  );

  // 2. ALWAYS approve before createTask. The "skip when allowance ≥ reward"
  //    optimization was dropped because RPC caching / stale reads can return
  //    a misleading non-zero value, leading createTask to revert with
  //    "ERC20: transfer amount exceeds allowance". On Base the extra approve
  //    costs ~$0.005 — well worth eliminating that failure mode.
  p.onProgress?.('approving');
  const approveHash = await p.writeContract({
    address: p.usdc,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [p.taskManager, rewardWei],
  });
  // eslint-disable-next-line no-console
  console.info(`[createMissionOnChain] approve tx broadcast: ${approveHash}`);
  const approveReceipt = await pub.waitForTransactionReceipt({
    hash: approveHash,
    pollingInterval: RECEIPT_POLL_INTERVAL_MS,
    timeout: RECEIPT_TIMEOUT_MS,
  });
  // eslint-disable-next-line no-console
  console.info(
    `[createMissionOnChain] approve receipt status = ${approveReceipt.status}, block = ${approveReceipt.blockNumber}`,
  );
  if (approveReceipt.status !== 'success') {
    throw new Error(`USDC approve reverted on-chain (tx ${approveHash}). Allowance unchanged — retry the post.`);
  }

  // Hold for the RPC indexer to propagate the new allowance across all nodes.
  // Without this, a load-balanced QuickNode endpoint can route the next read
  // (and the subsequent createTask broadcast) to a node that still sees the
  // pre-approve state, leading to misleading "exceeds allowance" reverts or
  // -32602 invalid-params errors from a half-synced sequencer.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Defensive re-read: confirm the new allowance is visible BEFORE broadcasting
  // createTask. If the RPC indexer is behind, surface that clearly instead of
  // letting createTask revert with a misleading "exceeds allowance".
  const postApproveAllowance = (await pub.readContract({
    address: p.usdc,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [p.client, p.taskManager],
  })) as bigint;
  // eslint-disable-next-line no-console
  console.info(`[createMissionOnChain] post-approve allowance = ${postApproveAllowance} wei`);
  if (postApproveAllowance < rewardWei) {
    throw new Error(
      `Allowance still ${postApproveAllowance} after approve (expected ≥ ${rewardWei}). The RPC may be lagging — wait a few seconds and retry.`,
    );
  }

  // 2. createTask.
  p.onProgress?.('locking');
  const createHash = await p.writeContract({
    address: p.taskManager,
    abi: TASK_MANAGER_ABI,
    functionName: 'createTask',
    args: [rewardWei, BigInt(p.workWindowSec)],
  });
  const receipt = await pub.waitForTransactionReceipt({
    hash: createHash,
    pollingInterval: RECEIPT_POLL_INTERVAL_MS,
    timeout: RECEIPT_TIMEOUT_MS,
  });
  // Same guard for createTask: if it reverted, the TaskCreated event lookup
  // below would fail with a vague "event not found" message instead of the
  // real revert reason.
  if (receipt.status !== 'success') {
    throw new Error(`TaskManager.createTask reverted on-chain (tx ${createHash}). USDC bounty was not locked.`);
  }

  // 3. Decode the TaskCreated event from the receipt logs.
  let taskId: bigint | null = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== p.taskManager.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: TASK_MANAGER_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === 'TaskCreated') {
        taskId = decoded.args.taskId as bigint;
        break;
      }
    } catch {
      // Not the event we're looking for.
    }
  }
  if (taskId == null) {
    throw new Error('TaskCreated event not found in receipt — task may not have been created');
  }

  p.onProgress?.('done', createHash);
  return { taskId, txHash: createHash };
}

/**
 * Read the USDC balance of an account, in human-readable units.
 */
export async function readUsdcBalance(usdc: Address, account: Address): Promise<number> {
  const pub = getPublicClient();
  if (!pub) return 0;
  const raw = (await pub.readContract({
    address: usdc,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [account],
  })) as bigint;
  return Number(raw) / 10 ** USDC_DECIMALS;
}

/**
 * Read the minimum work window (in seconds) currently enforced by TaskManager.
 */
export async function readMinWorkWindow(taskManager: Address): Promise<number> {
  const pub = getPublicClient();
  if (!pub) return 5 * 60;
  const raw = (await pub.readContract({
    address: taskManager,
    abi: TASK_MANAGER_ABI,
    functionName: 'minWorkWindow',
    args: [],
  })) as bigint;
  return Number(raw);
}

/**
 * Read native ETH balance, in wei.
 */
export async function readEthBalance(account: Address): Promise<bigint> {
  const pub = getPublicClient();
  if (!pub) return 0n;
  return pub.getBalance({ address: account });
}
