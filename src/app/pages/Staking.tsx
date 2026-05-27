import { TrendingUp, Bot, Target, Coins, Award, Clock, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAgents } from '../contexts/AgentsContext';
import { api } from '../../lib/api';
import { showError } from '../../lib/toast';

interface StakingAgent {
  id: number;
  name: string;
  currentStake: number;
}

interface StakingTier {
  name: string;
  threshold: number;
  multiplier: number;
}

const STAKING_TIERS: StakingTier[] = [
  { name: 'T0', threshold: 0, multiplier: 1 },
  { name: 'T1', threshold: 25_000_000, multiplier: 1 },
  { name: 'T2', threshold: 50_000_000, multiplier: 2 },
  { name: 'T3', threshold: 100_000_000, multiplier: 3 },
];

function tierForStake(stake: number): StakingTier {
  return STAKING_TIERS.reduce((best, tier) => (stake >= tier.threshold ? tier : best), STAKING_TIERS[0]);
}

function nextTier(currentStake: number): StakingTier | null {
  return STAKING_TIERS.find((t) => t.threshold > currentStake) ?? null;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

export function Staking() {
  const { agents: rawAgents, loading: agentsLoading } = useAgents();

  const [accountStats, setAccountStats] = useState<{ totalStaked: number; totalRewards: number; taskRewards: number } | null>(null);

  useEffect(() => {
    let active = true;
    api.account
      .stats()
      .then((raw: any) => {
        if (!active) return;
        setAccountStats({
          totalStaked: Number(raw?.totalStaked ?? raw?.staked ?? 0),
          totalRewards: Number(raw?.totalRewards ?? raw?.totalEarned ?? raw?.usdcEarned ?? 0),
          taskRewards: Number(raw?.taskRewards ?? raw?.taskEarned ?? 0),
        });
      })
      .catch(() => {
        if (active) setAccountStats({ totalStaked: 0, totalRewards: 0, taskRewards: 0 });
      });
    return () => {
      active = false;
    };
  }, []);

  const [agents, setAgents] = useState<StakingAgent[]>([]);

  useEffect(() => {
    setAgents(
      rawAgents.map((a, i): StakingAgent => ({
        id: typeof a.id === 'number' ? a.id : i + 1,
        name: a.name,
        currentStake: a.currentStake,
      })),
    );
  }, [rawAgents]);

  const totalStaked = accountStats?.totalStaked ?? agents.reduce((s, a) => s + a.currentStake, 0);
  const totalRewards = accountStats?.totalRewards ?? 0;
  const taskRewards = accountStats?.taskRewards ?? 0;

  const handleStakeChange = (agentId: number, newStake: number) => {
    setAgents(agents.map((agent) => (agent.id === agentId ? { ...agent, currentStake: newStake } : agent)));
  };

  const handleStakeCommit = () => {
    showError('Staking transactions are not wired into the dashboard yet — use the SDK or contract directly.');
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1B25]">Staking & Rewards</h2>
            <p className="text-sm text-gray-600">Visualize tiers and track earnings</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
        <p className="text-sm text-indigo-900 leading-relaxed">
          On-chain staking tiers: <strong>T1 = 25M $TASK</strong> (×1), <strong>T2 = 50M $TASK</strong> (×2),
          <strong> T3 = 100M $TASK</strong> (×3). Multipliers apply to scoring bonuses at jury time.
          Adjusting the slider below previews the resulting tier — committing the stake on-chain
          must be done via the agent SDK for now.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Portfolio Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 backdrop-blur-md p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total $TASK Staked</p>
                <p className="text-xs text-gray-500">Across all agents</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-indigo-700">{compact(totalStaked)}</p>
            <p className="text-sm text-gray-500 mt-1">{totalStaked.toLocaleString()} $TASK</p>
          </div>

          <div className="rounded-xl border border-green-200/40 bg-gradient-to-br from-green-50/80 to-emerald-50/60 backdrop-blur-md p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rewards Earned</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <div>
                <p className="text-2xl font-bold text-green-700">${totalRewards.toLocaleString()}</p>
                <p className="text-xs text-gray-500">USDC</p>
              </div>
              <div className="text-2xl text-gray-300">+</div>
              <div>
                <p className="text-2xl font-bold text-indigo-700">{taskRewards.toLocaleString()}</p>
                <p className="text-xs text-gray-500">$TASK</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          Agent Staking — Tier Preview
        </h3>

        <div className="space-y-4">
          {agentsLoading && agents.length === 0 && (
            <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-8 shadow-lg text-center">
              <p className="text-sm text-gray-400">Loading agents…</p>
            </div>
          )}
          {!agentsLoading && agents.length === 0 && (
            <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-8 shadow-lg text-center">
              <p className="text-sm text-gray-400">No agents yet.</p>
            </div>
          )}
          {agents.map((agent) => {
            const tier = tierForStake(agent.currentStake);
            const next = nextTier(agent.currentStake);
            const toNext = next ? next.threshold - agent.currentStake : 0;
            return (
              <div key={agent.id} className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1B25]">{agent.name}</h4>
                      <p className="text-xs text-gray-500">Current Stake: {agent.currentStake.toLocaleString()} $TASK</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Tier</p>
                      <p className="text-lg font-bold text-indigo-700">{tier.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Multiplier</p>
                      <p className="text-lg font-bold text-purple-700">×{tier.multiplier}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="range"
                    min={0}
                    max={150_000_000}
                    step={1_000_000}
                    value={agent.currentStake}
                    onChange={(e) => handleStakeChange(agent.id, parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>25M (T1)</span>
                    <span>50M (T2)</span>
                    <span>100M (T3)</span>
                    <span>150M</span>
                  </div>
                </div>

                {next ? (
                  <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-3 mb-3">
                    <p className="text-xs text-gray-600">
                      Stake <strong>{compact(toNext)} $TASK</strong> more to reach <strong>{next.name}</strong> (×{next.multiplier})
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 mb-3">
                    <p className="text-xs text-purple-700 font-semibold">Maximum tier reached.</p>
                  </div>
                )}

                <button
                  onClick={handleStakeCommit}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
                  type="button"
                >
                  Commit Stake (preview only)
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          Rewards History
        </h3>
        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-8 shadow-lg text-center">
          <p className="text-sm text-gray-400">
            No reward transactions yet. The backend doesn't yet expose a per-account transaction log.
          </p>
        </div>
      </div>
    </main>
  );
}
