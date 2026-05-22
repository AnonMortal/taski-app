/**
 * ROOT LAYOUT COMPONENT
 *
 * Layout principal qui encapsule toutes les pages de l'application.
 * Définit la structure globale avec Header + Sidebar + Content area.
 *
 * Wallet gate:
 * - Pas de wallet (ou setup en cours) -> <WalletSetup />
 * - Wallet verrouillé          -> <UnlockScreen />
 * - Wallet déverrouillé        -> SIWE sign-in puis l'app
 *
 * Structure:
 * - Background: Frosted White (#F4F5FF)
 * - Sidebar: Navigation principale (caché sur mobile)
 * - TopHeader: Search bar + Wallet + Token price
 * - Outlet: Zone de rendu des pages enfants (React Router)
 *
 * Note: <Outlet /> est le point d'injection des pages définies dans routes.ts
 */

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { AgentsProvider } from '../../contexts/AgentsContext';
import { MissionsProvider } from '../../contexts/MissionsContext';
import { useWallet } from '../../../lib/wallet-context';
import { WalletSetup } from '../../pages/WalletSetup';
import { UnlockScreen } from './UnlockScreen';
import { signInWithEthereum } from '../../../lib/siwe';
import { showError } from '../../../lib/toast';

/**
 * Rendered once the wallet is unlocked. Performs the SIWE sign-in so the
 * backend auth token is set before the data contexts start fetching.
 */
function AuthenticatedApp() {
  const { address, signMessage } = useWallet();
  const [authState, setAuthState] = useState<'pending' | 'ready'>('pending');

  useEffect(() => {
    let cancelled = false;
    if (!address) return;
    (async () => {
      try {
        await signInWithEthereum(address, signMessage);
      } catch (err: any) {
        // Sign-in failure is non-blocking: the dashboard still renders and
        // public endpoints keep working. Authenticated calls will simply 401.
        showError(err?.message ?? 'Sign-in failed — some data may be unavailable');
      } finally {
        if (!cancelled) setAuthState('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, signMessage]);

  if (authState === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5FF]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#493FEE]/20 border-t-[#493FEE]" />
          <p className="text-sm text-gray-500">Signing in to TaskFi…</p>
        </div>
      </div>
    );
  }

  return (
    <AgentsProvider>
      <MissionsProvider>
        <div className="min-h-screen bg-[#F4F5FF]">
          {/* Layout Container - Flexbox responsive */}
          <div className="flex h-screen flex-col lg:flex-row">
            {/* Sidebar Navigation - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Header avec search, wallet, token price */}
              <TopHeader />

              {/* Page Content - Les pages sont rendues ici via React Router */}
              <Outlet />
            </div>
          </div>
        </div>
      </MissionsProvider>
    </AgentsProvider>
  );
}

export function RootLayout() {
  const { hasWallet, isUnlocked, pendingSetup } = useWallet();

  // Wallet gate.
  if (!hasWallet || pendingSetup) return <WalletSetup />;
  if (!isUnlocked) return <UnlockScreen />;

  return <AuthenticatedApp />;
}
