import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, X, CheckCircle, ShieldCheck, Loader2, Fuel, Mail } from 'lucide-react';
import type { Address } from 'viem';
import {
  ONRAMP_PROVIDER,
  requestGasGrant,
  openCoinbaseOnramp,
  waitForFunds,
  checkOnrampEligibility,
} from '../../../lib/onramp';

type ModalStep = 'form' | 'processing' | 'success' | 'error';

interface OnrampModalProps {
  open: boolean;
  amountUsdc: number;
  address: Address | null;
  usdc: Address | null;
  /** Ensures a SIWE auth token exists before hitting the backend. */
  ensureAuth: () => Promise<void>;
  onFunded: () => void;
  onClose: () => void;
}

/**
 * Card-to-USDC funding modal. The buyer enters their card and pays; the bounty
 * USDC is delivered to their own wallet and the project covers gas. Card payment
 * is gated to approved companies — a non-whitelisted company's card is declined
 * (after submitting) with a "contact the project team" message, so the gating is
 * presented as a normal card decline rather than exposing the allowlist.
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
  const { t } = useTranslation();
  const [step, setStep] = useState<ModalStep>('form');
  const [message, setMessage] = useState('');
  const [declined, setDeclined] = useState(false);
  const [contactEmail, setContactEmail] = useState<string | null>(null);

  const isCoinbase = ONRAMP_PROVIDER === 'coinbase';

  // Reset to the card form each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setStep('form');
    setMessage('');
    setDeclined(false);
  }, [open]);

  const runPurchase = async () => {
    if (!address || !usdc) {
      setDeclined(false);
      setStep('error');
      setMessage(t('Wallet or USDC config not ready. Reload and try again.'));
      return;
    }
    setStep('processing');
    try {
      setMessage(t('Processing your card…'));
      await ensureAuth();

      // Card-payment allowlist: a non-approved company's card is declined.
      const elig = await checkOnrampEligibility(address);
      if (!elig.whitelisted) {
        setContactEmail(elig.requestAccessEmail);
        setDeclined(true);
        setStep('error');
        setMessage(t('Your card was not accepted. Please contact the project team.'));
        return;
      }

      // 1) Card payment → USDC delivery.
      if (isCoinbase) {
        setMessage(t('Complete your card payment in the Coinbase window…'));
        await openCoinbaseOnramp({ amountUsdc });
      }

      // 2) Project gas grant (+ test USDC delivery in dev mock mode).
      setMessage(t('Adding funds to your wallet…'));
      await requestGasGrant(amountUsdc);

      // 3) Wait for both assets to settle on-chain.
      setMessage(t('Confirming funds on Base…'));
      const funded = await waitForFunds({ address, usdc, amountUsdc });
      if (!funded) {
        setDeclined(false);
        setStep('error');
        setMessage(
          t('Funds did not arrive in time. If your card payment went through, wait a moment and retry.'),
        );
        return;
      }

      setStep('success');
      setMessage(t('Funds received — finishing your mission…'));
      setTimeout(onFunded, 900);
    } catch (err) {
      setDeclined(false);
      setStep('error');
      setMessage(err instanceof Error ? err.message : t('Payment failed. Please try again.'));
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // don't allow closing mid-payment
    setStep('form');
    setMessage('');
    setDeclined(false);
    onClose();
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-indigo-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4B3EEF] focus:border-transparent';
  const amount = amountUsdc.toFixed(2);

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
                  <h3 className="text-lg font-bold text-[#1A1B25]">{t('Pay by card')}</h3>
                  <p className="text-xs text-gray-500">{t('Fund your mission with USDC on Base')}</p>
                </div>
              </div>
              {step !== 'processing' && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={t('Close')}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Amount summary */}
              <div className="rounded-xl bg-gradient-to-br from-indigo-50/80 to-[#4B3EEF]/5 border border-indigo-200 p-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('You pay')}</span>
                  <span className="text-xl font-bold text-[#1A1B25]">${amount}</span>
                </div>
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> {t('{{amount}} USDC to your wallet', { amount })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5 text-[#4B3EEF]" /> {t('gas covered')}
                  </span>
                </div>
              </div>

              {step === 'form' && (
                <>
                  {isCoinbase ? (
                    <p className="text-sm text-gray-600">
                      {t(
                        "You'll complete your card payment securely with Coinbase. The USDC lands directly in your wallet — we cover the network gas.",
                      )}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{t('Card number')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="1234 1234 1234 1234"
                          defaultValue=""
                          className={inputClass}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{t('Expiry')}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            placeholder="MM / YY"
                            defaultValue=""
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{t('CVC')}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="CVC"
                            defaultValue=""
                            className={inputClass}
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
                    {isCoinbase ? t('Continue to Coinbase') : t('Pay ${{amount}}', { amount })}
                  </button>
                </>
              )}

              {step === 'processing' && (
                <div className="py-8 flex flex-col items-center text-center">
                  <Loader2 className="h-10 w-10 text-[#4B3EEF] animate-spin mb-4" />
                  <p className="text-sm text-gray-700 font-medium">{message}</p>
                  <p className="text-xs text-gray-400 mt-2">{t('Please keep this window open.')}</p>
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
                  {declined ? (
                    <>
                      <a
                        href={`mailto:${contactEmail ?? 'access@taskfi.xyz'}?subject=${encodeURIComponent('Card payment — access request')}&body=${encodeURIComponent(`My card was declined for a TaskFi mission. Please enable card payments for my company.\nWallet: ${address ?? ''}`)}`}
                        className="w-full font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#4B3EEF] to-[#3D32D9] text-white hover:shadow-lg transition-all"
                      >
                        <Mail className="h-5 w-5" /> {t('Contact the team')}
                      </a>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {t('Close')}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={runPurchase}
                      className="w-full font-bold py-3 px-6 rounded-xl bg-gradient-to-r from-[#4B3EEF] to-[#3D32D9] text-white hover:shadow-lg transition-all"
                    >
                      {t('Try again')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
