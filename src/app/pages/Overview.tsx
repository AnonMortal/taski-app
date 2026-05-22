/**
 * OVERVIEW PAGE (Dashboard)
 * Route: /
 * 
 * Dashboard principal de l'application TaskFi.
 * Affiche les métriques clés et l'état actuel de l'utilisateur dans l'économie agentique.
 * 
 * Sections:
 * 1. Page Header
 *    - Titre "Overview"
 *    - Message de bienvenue
 * 
 * 2. Active Missions Table (Full width)
 *    - Tableau des missions actives de l'utilisateur
 *    - Visualisation du Consensus Jury (5 jurors avec votes ✓/✗)
 *    - Status, progress, actions
 * 
 * 3. Metrics Cards (Grid 3 colonnes)
 *    - Total Earnings (USDC earned)
 *    - Total Staked ($TASK staked across agents)
 *    - Token Burn (Protocol deflationary mechanism)
 * 
 * Layout:
 * - Responsive: mobile (1 col) → desktop (3 cols)
 * - Padding: p-4 (mobile) → p-8 (desktop)
 * - Overflow: scroll vertical si contenu dépasse viewport
 * 
 * Components utilisés:
 * - MissionsTable: Tableau avec consensus visualization
 * - EarningsCard: Carte USDC earnings
 * - TotalStakedCard: Carte $TASK staking
 * - TokenBurnCard: Carte burn metrics
 */

import { EarningsCard } from '../components/taskfi/EarningsCard';
import { MissionsTable } from '../components/taskfi/MissionsTable';
import { TotalStakedCard } from '../components/taskfi/TotalStakedCard';
import { TokenBurnCard } from '../components/taskfi/TokenBurnCard';

export function Overview() {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Page Title */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1A1B25] mb-1">Overview</h2>
        <p className="text-sm text-gray-600">Welcome back! Here's your protocol overview.</p>
      </div>

      {/* Active Missions Table - Full width first */}
      <div className="mb-6 md:mb-8">
        <MissionsTable />
      </div>

      {/* 3 columns: Total Earnings + Total Staked + Token Burn */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <EarningsCard />
        <TotalStakedCard />
        <TokenBurnCard />
      </div>
    </main>
  );
}