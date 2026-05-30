import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, X, CheckCircle, ShieldCheck, Loader2, Fuel, ShieldAlert, Mail } from 'lucide-react';
import type { Address } from 'viem';
import {
  ONRAMP_PROVIDER,
  requestGasGrant,
  openCoinbaseOnramp,
  waitForFunds,
  checkOnrampEligibility,
  type OnrampEligibility,
} from '../../../lib/onramp';

type ModalStep = 'form' | 'processing' | 'success' | 'error';

interface OnrampModalProps {
  open: boolean;
  amountUsdc: number;
  address: Address | null;
  usdc: Address | null;
  /** Ensures a SIWE auth token exists before hitting the gas-grant endpoint. */
  ensureAuth: () => Promise<void>;
  onFunded: () => void;
  onClose: () => void;
}

/**
 * Card-to-USDC funding modal. Lets a web2 company top up its in-app wallet by
 * card so it can fund a mission, without ever touching crypto or gas:
 *   1. card payment delivers USDC to the user's own wallet,
 *   2. the project gas dispenser tops the wallet up with a little ETH,
 *   3. we poll the chain until both have landed, then resume.
 * In dev (mock provider) steps 1+2 are simulated by the backend dev-faucet.
 */
export function OnrampModal({
  open,
  amountUsdc,
  address,
  usdc,
  ensureAuth,
  onFunded,
  onClose,
}: OnrampModalProps) {
  const [step, setStep] = useState<ModalStep>('form');
  const [message, setMessage] = useState('');
  const [eligibility, setEligibility] = useState<OnrampEligibility | null>(null);

  const isCoinbase = ONRAMP_PROVIDER === 'coinbase';

  // On open, reset state and check whether this company (wallet) is whitelisted
  // to pay by card. Non-whitelisted companies see a request-access message.
  useEffect(() => {
    if (!open) return;
    setStep('form');
    setMessage('');
    setEligibility(null);
    if (!address) return;
    let cancelled = false;
    checkOnrampEligibility(address).then((e) => {
      if (!cancelled) setEligibility(e);
    });
    return () => {
      cancelled = true;
    };
  }, [open, address]);

  const checking = step === 'form' && eligibility === null;
  const notWhitelisted = step === 'form' && eligibility !== null && !eligibility.whitelisted;
  const showAmount = !checking && !notWhitelisted;

  const runPurchase = async () => {
    if (!address || !usdc) {
      setStep('error');
      setMessage('Wallet or USDC config not ready. Reload and try again.');
      return;
    }
    setStep('processing');
    try {
      // Make sure the backend will accept the gas-grant call.
      setMessage('Authenticating your wallet…');
      await ensureAuth();

      // 1) Card payment → USDC delivery.
      if (isCoinbase) {
        setMessage('Complete your card payment in the Coinbase window…');
        await openCoinbaseOnramp({ amountUsdc });
      }

      // 2) Project gas grant (+ test USDC delivery in dev mock mode).
      setMessage('Adding funds to your wallet…');
      await requestGasGrant(amountUsdc);

      // 3) Wait for both assets to settle on-chain.
      setMessage('Confirming funds on Base…');
      const funded = await waitForFunds({ address, usdc, amountUsdc });
      if (!funded) {
        setStep('error');
        setMessage(
          'Funds did not arrive in time. If your card payment went through, wait a moment and retry.',
        );
        return;
      }

      setStep('success');
      setMessage('Funds received — finishing your mission…');
      setTimeout(onFunded, 900);
    } catch (err) {
      setStep('error');
      setMessage(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // don't allow closing mid-payment
    setStep('form');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1B25]/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-indigo-200/40 bg-white/95 backdrop-blur-md shadow-2xl"
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4B3EEF] to-[#3D32D9] shadow-lg">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A1B25]">Pay by card</h3>
                  <p className="text-xs text-gray-500">Fund your mission with USDC on Base</p>
                </div>
              </div>
              {step !== 'processing' && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Eligibility gate: checking → loading; not whitelisted → message. */}
              {checking && (
                <div className="py-8 flex flex-col items-center text-center">
                  <Loader2 className="h-8 w-8 text-[#4B3EEF] animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Checking access…</p>
                </div>
              )}

              {notWhitelisted && (
                <div className="py-4 flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4B3EEF]/10 mb-4">
                    <ShieldAlert className="h-6 w-6 text-[#4B3EEF]" />
                  </div>
                  <h4 className="text-base font-bold text-[#1A1B25] mb-1">Card payment requires approval</h4>
                  <p className="text-sm text-gray-600 mb-5">
                    Paying by card is reserved for verified enterprises. Your company isn't
                    whitelisted yet — request access and we'll review it.
                  </p>
                  <a
                    href={`mailto:${eligibility?.requestAccessEmail ?? 'access@taskfi.xyz'}?subject=${encodeURIComponent('Card payment access request')}&body=${encodeURIComponent(`Please whitelist my company for card payments.\nWallet: ${address ?? ''}`)}`}
                    className="w-full font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#4B3EEF] to-[#3D32D9] text-white hover:shadow-lg transition-all"
                  >
                    <Mail className="h-5 w-5" /> Request access
                  </a>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              )}

              {/* Amount summary (shown once eligible / during processing). */}
              {showAmount && (
                <div className="rounded-xl bg-gradient-to-br from-indigo-50/80 to-[#4B3EEF]/5 border border-indigo-200 p-4 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">You pay</span>
                    <span className="text-xl font-bold text-[#1A1B25]">
                      ${amountUsdc.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> {amountUsdc.toFixed(2)} USDC to your wallet
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Fuel className="h-3.5 w-3.5 text-[#4B3EEF]" /> gas covered
                    </span>
                  </div>
                </div>
              )}

              {step === 'form' && eligibility?.whitelisted && (
                <>
                  {isCoinbase ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        You'll complete your card payment securely with Coinbase. The USDC
                        lands directly in your wallet — we cover the network gas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        Dev sandbox — no real charge. Test card is pre-filled.
                      </p>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Card number</label>
                        <input
                          readOnly
                          value="4242 4242 4242 4242"
                          className="w-full px-3 py-2.5 rounded-lg border border-indigo-200 bg-white/70 text-sm text-gray-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
                          <input
                            readOnly
                            value="12 / 34"
                            className="w-full px-3 py-2.5 rounded-lg border border-indigo-200 bg-white/70 text-sm text-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">CVC</label>
                          <input
                            readOnly
                            value="123"
                            className="w-full px-3 py-2.5 rounded-lg border border-indigo-200 bg-white/70 text-sm text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={runPurchase}
                    className="mt-5 w-full font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-[#4B3EEF] to-[#3D32D9] text-white hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <CreditCard className="h-5 w-5" />
                    {isCoinbase ? 'Continue to Coinbase' : `Pay $${amountUsdc.toFixed(2)}`}
                  </button>
                </>
              )}

              {step === 'processing' && (
                <div className="py-8 flex flex-col items-center text-center">
                  <Loader2 className="h-10 w-10 text-[#4B3EEF] animate-spin mb-4" />
                  <p className="text-sm text-gray-700 font-medium">{message}</p>
                  <p className="text-xs text-gray-400 mt-2">Please keep this window open.</p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-8 flex flex-col items-center text-center">
                  <CheckCircle className="h-10 w-10 text-green-600 mb-4" />
                  <p className="text-sm text-gray-700 font-medium">{message}</p>
                </div>
              )}

              {step === 'error' && (
                <div className="py-4 flex flex-col items-center text-center">
                  <p className="text-sm text-red-600 mb-4">{message}</p>
                  <button
                    type="button"
                    onClick={runPurchase}
                    className="w-full font-bold py-3 px-6 rounded-xl bg-gradient-to-r from-[#4B3EEF] to-[#3D32D9] text-white hover:shadow-lg transition-all"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
