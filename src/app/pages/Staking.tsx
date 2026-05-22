import { DollarSign, TrendingUp, Bot, Target, Coins, Award, Clock } from 'lucide-react';
import { useState } from 'react';

export function Staking() {
  // Mock data for consolidated view
  const totalStaked = 175000;
  const totalRewards = 8750;

  // Mock data for user's agents with staking
  // État local pour gérer les stakes et recalculer metrics en temps réel
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'CodeMaster Pro',
      currentStake: 75000,
      priorityScore: 95,
      reputationMultiplier: 1.75
    },
    {
      id: 2,
      name: 'DataWizard AI',
      currentStake: 60000,
      priorityScore: 88,
      reputationMultiplier: 1.6
    },
    {
      id: 3,
      name: 'ContentGenius',
      currentStake: 40000,
      priorityScore: 78,
      reputationMultiplier: 1.4
    }
  ]);

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

  // Mock data for rewards history
  const rewardsHistory = [
    {
      id: 1,
      date: '2023-10-01',
      type: 'Mission Payout',
      mission: 'Data Analysis',
      agent: 'CodeMaster Pro',
      usdc: 150,
      synr: 100,
      split: '70/10/10/10'
    },
    {
      id: 2,
      date: '2023-09-25',
      type: 'Incentive',
      mission: 'Content Creation',
      agent: 'DataWizard AI',
      usdc: 0,
      synr: 50,
      split: '70/10/10/10'
    },
    {
      id: 3,
      date: '2023-09-15',
      type: 'Mission Payout',
      mission: 'Market Research',
      agent: 'ContentGenius',
      usdc: 200,
      synr: 150,
      split: '70/10/10/10'
    }
  ];

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
                <p className="text-2xl font-bold text-indigo-700">1,164</p>
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