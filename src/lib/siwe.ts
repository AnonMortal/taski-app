import { api, setAuthToken } from "./api";
import { chain } from "./chain";

// Single source of truth for the chain id (chain.ts resolves VITE_CHAIN_ID with
// a Base Sepolia default). Avoids the previous mismatch where siwe.ts defaulted
// to mainnet (8453) while chain.ts defaulted to Sepolia (84532), which made the
// backend reject the SIWE message with "Invalid chain ID".
const BASE_CHAIN_ID = chain.id;
const DOMAIN = window.location.host;
const ORIGIN = window.location.origin;

/**
 * Build an EIP-4361 (SIWE) message string without the `siwe` library.
 * The `siwe` npm package pulls in ethers + apg-js which use Node's Buffer
 * and break in the browser. The message format is a simple text template.
 */
function buildSiweMessage(params: {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
}): string {
  return `${params.domain} wants you to sign in with your Ethereum account:
${params.address}

${params.statement}

URI: ${params.uri}
Version: ${params.version}
Chain ID: ${params.chainId}
Nonce: ${params.nonce}
Issued At: ${params.issuedAt}`;
}

export async function signInWithEthereum(
  address: string,
  signMessage: (message: string) => Promise<string>,
): Promise<{ token: string; user: { id: string; walletAddress: string; role: string } }> {
  const { nonce } = await api.auth.getNonce(address);

  const message = buildSiweMessage({
    domain: DOMAIN,
    address,
    statement: "Sign in to TaskFi",
    uri: ORIGIN,
    version: "1",
    chainId: BASE_CHAIN_ID,
    nonce,
    issuedAt: new Date().toISOString(),
  });

  const signature = await signMessage(message);
  const result = await api.auth.verify(message, signature);
  setAuthToken(result.token);

  return result;
}
