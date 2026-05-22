import { DollarSign, TrendingUp, Bot, Target, Coins, Award, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAgents } from '../contexts/AgentsContext';
import { api } from '../../lib/api';

interface StakingAgent {
  id: number;
  name: string;
  currentStake: number;
  priorityScore: number;
  reputationMultiplier: number;
}

// Derive a priority score (50-95) from a stake amount on the 25K-100K range.
const priorityFromStake = (stake: number) =>
  Math.max(50, Math.min(95, 50 + Math.floor(((stake - 25000) / 75000) * 45)));
// Derive a reputation multiplier (1.25x-2.0x) from a stake amount.
const multiplierFromStake = (stake: number) =>
  Math.round((1.25 + Math.max(0, Math.min(1, (stake - 25000) / 75000)) * 0.75) * 100) / 100;

export function Staking() {
  const { agents: rawAgents, loading: agentsLoading } = useAgents();

  // Portfolio totals come from the (auth-gated) account stats endpoint. On
  // failure the page shows zeros instead of crashing.
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

  // Agent staking list comes from the backend leaderboard (AgentsContext).
  // Local state mirrors it so the stake slider can recompute metrics live.
  const [agents, setAgents] = useState<StakingAgent[]>([]);

  useEffect(() => {
    setAgents(
      rawAgents.map((a, i): StakingAgent => {
        const stake = a.currentStake > 0 ? a.currentStake : 25000;
        return {
          id: typeof a.id === 'number' ? a.id : i + 1,
          name: a.name,
          currentStake: stake,
          priorityScore: priorityFromStake(stake),
          reputationMultiplier: multiplierFromStake(stake),
        };
      }),
    );
  }, [rawAgents]);

  const totalStaked = accountStats?.totalStaked ?? agents.reduce((s, a) => s + a.currentStake, 0);
  const totalRewards = accountStats?.totalRewards ?? 0;
  const taskRewards = accountStats?.taskRewards ?? 0;

  // Handler pour recalculer Priority Score et Reputation Multiplier quand le stake change
  const handleStakeChange = (agentId: number, newStake: number) => {
    setAgents(agents.map(agent => {
      if (agent.id === agentId) {
        // Calculate new priority score and reputation multiplier based on stake
        // Priority score: 50 to 95 based on stake from 25K to 100K
        const priorityScore = Math.min(95, 50 + Math.floor(((newStake - 25000) / 75000) * 45));
        // Reputation multiplier: 1.25x to 2.0x based on stake from 25K to 100K
        const reputationMultiplier = 1.25 + ((newStake - 25000) / 75000) * 0.75;
        return {
          ...agent,
          currentStake: newStake,
          priorityScore,
          reputationMultiplier: Math.round(reputationMultiplier * 100) / 100
        };
      }
      return agent;
    }));
  };

  // Rewards history: there is no dedicated transaction-log endpoint on the
  // backend, so this list stays empty and the table shows an empty state.
  const rewardsHistory: {
    id: number;
    date: string;
    type: string;
    mission: string;
    agent: string;
    usdc: number;
    synr: number;
    split: string;
  }[] = [];

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1B25]">Staking & Rewards</h2>
            <p className="text-sm text-gray-600">Manage your $TASK stakes and track earnings</p>
          </div>
        </div>
      </div>

      {/* Consolidated View */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Portfolio Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Staked */}
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
            <p className="text-4xl font-bold text-indigo-700">{totalStaked.toLocaleString()}</p>
            <p className="text-sm text-indigo-600 mt-1">≈ ${(totalStaked * 1.45).toLocaleString()} USD</p>
          </div>

          {/* Total Rewards */}
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

      {/* Staking Interface */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          Agent Staking Management
        </h3>
        <p className="text-sm text-gray-600 mb-4">Adjust stake amounts to boost Priority Score and Reputation Multiplier</p>
        
        <div className="space-y-4">
          {agentsLoading && agents.length === 0 && (
            <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-8 shadow-lg text-center">
              <p className="text-sm text-gray-400">Loading agents…</p>
            </div>
          )}
          {!agentsLoading && agents.length === 0 && (
            <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-8 shadow-lg text-center">
              <p className="text-sm text-gray-400">No staked agents yet.</p>
            </div>
          )}
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg"
            >
              {/* Agent Header */}
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
                    <p className="text-xs text-gray-500">Priority Score</p>
                    <p className="text-lg font-bold text-indigo-700">{agent.priorityScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Rep. Multiplier</p>
                    <p className="text-lg font-bold text-purple-700">{agent.reputationMultiplier}x</p>
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="mb-4">
                <input
                  type="range"
                  min="25000"
                  max="100000"
                  step="5000"
                  value={agent.currentStake}
                  onChange={(e) => handleStakeChange(agent.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>25,000 $TASK</span>
                  <span>100,000 $TASK</span>
                </div>
              </div>

              {/* Impact Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-600">Priority Impact</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {agent.priorityScore >= 90 ? 'Maximum Priority' : 
                     agent.priorityScore >= 80 ? 'High Priority' : 
                     agent.priorityScore >= 70 ? 'Medium Priority' : 'Standard Priority'}
                  </p>
                </div>
                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600">Earnings Boost</span>
                  </div>
                  <p className="text-sm text-purple-700 font-bold">
                    +{Math.round((agent.reputationMultiplier - 1) * 100)}% bonus
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards History */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          Rewards History
        </h3>
        <p className="text-sm text-gray-600 mb-4">Transaction log of all USDC payouts and $TASK incentives (70/10/10/10 split)</p>

        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mission</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">USDC</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">$TASK</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Split</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {rewardsHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                      No reward transactions yet.
                    </td>
                  </tr>
                )}
                {rewardsHistory.map((reward) => (
                  <tr key={reward.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3.5 w-3.5" />
                        {reward.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        reward.type === 'Mission Payout'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {reward.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#1A1B25]">{reward.mission}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reward.agent}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reward.usdc > 0 ? (
                        <span className="text-sm font-bold text-green-700">${reward.usdc}</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-indigo-700">{reward.synr}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{reward.split}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}