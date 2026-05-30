import type { Address } from 'viem';
import { api } from './api';
import { readEthBalance, readUsdcBalance } from './onchain';

/**
 * Fiat onramp orchestration for the dashboard.
 *
 * Model (non-custodial): a card payment delivers USDC to the user's OWN browser
 * wallet, and the project's gas dispenser tops the wallet up with a little ETH
 * so it can sign approve + createTask itself. Two providers, one flow:
 *   - 'mock'     (dev): no real money — a fake card form, then the backend
 *                 gas-grant (with ONRAMP_DEV_FAUCET_USDC) delivers test USDC +
 *                 ETH on Base Sepolia.
 *   - 'coinbase' (prod): Coinbase Onramp delivers real USDC on Base (0% fee),
 *                 then the gas-grant tops the wallet up with a little ETH.
 * Toggled by VITE_ONRAMP_PROVIDER.
 */

export const ONRAMP_ENABLED = (import.meta.env.VITE_ONRAMP_ENABLED ?? 'false') === 'true';

export type OnrampProviderId = 'mock' | 'coinbase';
export const ONRAMP_PROVIDER: OnrampProviderId =
  (import.meta.env.VITE_ONRAMP_PROVIDER as OnrampProviderId) || 'mock';

// Native-ETH gas gate the PostMission pre-flight enforces (0.0005 ETH). Kept in
// sync with PostMission.tsx and the backend ONRAMP_GAS_GRANT_WEI default.
export const GAS_GATE_WEI = 500_000_000_000_000n;

const USDC_DECIMALS = 6;

/** Convert a human USDC amount to 6-decimals integer units (as a string). */
function toUsdcUnits(amount: number): string {
  return BigInt(Math.ceil(amount * 10 ** USDC_DECIMALS)).toString();
}

/**
 * Ask the backend's project dispenser to top up gas (and, in dev, test USDC).
 * Idempotent server-side (top-up only). Requires a SIWE auth token.
 */
export async function requestGasGrant(usdcAmount?: number): Promise<void> {
  await api.onramp.gasGrant(
    usdcAmount != null ? { usdcAmount: toUsdcUnits(usdcAmount) } : {},
  );
}

export interface OnrampEligibility {
  whitelisted: boolean;
  requestAccessEmail: string | null;
}

/**
 * Whether a company (wallet) is whitelisted to pay by card. Card payment is
 * gated to approved enterprises; non-whitelisted wallets see a request-access
 * message instead of the card form.
 */
export async function checkOnrampEligibility(address: Address): Promise<OnrampEligibility> {
  try {
    return await api.onramp.eligibility(address);
  } catch {
    return { whitelisted: false, requestAccessEmail: null };
  }
}

export interface FundsTarget {
  address: Address;
  usdc: Address;
  amountUsdc: number;
}

/** Whether the wallet currently satisfies both the bounty and the gas gate. */
export async function hasSufficientFunds(
  t: FundsTarget,
): Promise<{ usdcOk: boolean; ethOk: boolean }> {
  const [usdcBalance, ethBalance] = await Promise.all([
    readUsdcBalance(t.usdc, t.address),
    readEthBalance(t.address),
  ]);
  return { usdcOk: usdcBalance >= t.amountUsdc, ethOk: ethBalance >= GAS_GATE_WEI };
}

/**
 * Poll the chain until the wallet holds enough USDC (>= amount) AND enough ETH
 * for gas, or until timeout. Used right after funds are dispatched (onramp
 * delivery + gas grant), since on-chain settlement is not instant.
 */
export async function waitForFunds(
  t: FundsTarget,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<boolean> {
  const timeoutMs = opts.timeoutMs ?? 90_000;
  const intervalMs = opts.intervalMs ?? 2_500;
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const { usdcOk, ethOk } = await hasSufficientFunds(t);
    if (usdcOk && ethOk) return true;
    if (Date.now() >= deadline) return false;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/**
 * Open the Coinbase Onramp hosted flow in a popup and resolve once it closes.
 * Requires a backend session token (CDP secrets stay server-side). Delivery is
 * confirmed by the caller via waitForFunds, not by this function.
 *
 * NOTE: pending real CDP credentials for end-to-end validation; the dev flow
 * uses the mock provider instead.
 */
export async function openCoinbaseOnramp(opts: { amountUsdc: number }): Promise<void> {
  const { token } = await api.onramp.sessionToken();
  const params = new URLSearchParams({
    sessionToken: token,
    defaultAsset: 'USDC',
    defaultNetwork: 'base',
    presetFiatAmount: String(opts.amountUsdc),
    fiatCurrency: 'USD',
  });
  const url = `https://pay.coinbase.com/buy/select-asset?${params.toString()}`;
  const popup = window.open(url, 'coinbase-onramp', 'width=460,height=720');
  if (!popup) throw new Error('Popup blocked — allow popups to buy USDC with card.');
  await new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        resolve();
      }
    }, 800);
  });
}
