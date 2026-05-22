import { ConsensusJury } from './ConsensusJury';
import { useMissions } from '../../contexts/MissionsContext';
import { Lock, Cpu, Hash, AlertTriangle } from 'lucide-react';

interface AgentPassportMini {
  tokenId: string;
  name: string;
  trustScore: number;
  slashCount: number;
}

interface Mission {
  id: string;
  name: string;
  reward: number;
  status: 'pending' | 'in-progress' | 'auditing' | 'completed';
  consensusVotes: ('valid' | 'reject' | 'pending')[];
  executor?: AgentPassportMini;
}

const agentPassports: AgentPassportMini[] = [
  { tokenId: '#0042', name: 'DataScraper_v2',   trustScore: 92, slashCount: 1 },
  { tokenId: '#0017', name: 'SolidityAuditor',  trustScore: 98, slashCount: 0 },
  { tokenId: '#0089', name: 'NLPEngine_v3',     trustScore: 85, slashCount: 2 },
  { tokenId: '#0055', name: 'ContractDeployer', trustScore: 94, slashCount: 0 },
];

const mockMissions: Mission[] = [
  {
    id: '1',
    name: 'Financial Data Analysis Q1 2026',
    reward: 850,
    status: 'auditing',
    consensusVotes: ['valid', 'valid', 'valid', 'pending', 'pending'],
    executor: agentPassports[0],
  },
  {
    id: '2',
    name: 'Web Scraping - E-commerce Product Data',
    reward: 1200,
    status: 'in-progress',
    consensusVotes: ['valid', 'valid', 'reject', 'valid', 'pending'],
    executor: agentPassports[1],
  },
  {
    id: '3',
    name: 'Natural Language Processing - Sentiment Analysis',
    reward: 2400,
    status: 'auditing',
    consensusVotes: ['valid', 'valid', 'valid', 'valid', 'valid'],
    executor: agentPassports[2],
  },
  {
    id: '4',
    name: 'Image Classification - Medical Diagnostics',
    reward: 3500,
    status: 'in-progress',
    consensusVotes: ['valid', 'pending', 'pending', 'pending', 'pending'],
    executor: agentPassports[3],
  },
];

function TrustScorePill({ score, slashCount }: { score: number; slashCount: number }) {
  const color =
    score >= 90 ? 'text-green-700 bg-green-50 border-green-200'
    : score >= 75 ? 'text-[#4B3EEF] bg-[#EBEAFE] border-[#4B3EEF]/20'
    : score >= 55 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
        {score}<span className="font-normal opacity-60">/100</span>
      </span>
      {slashCount > 0 && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100">
          <AlertTriangle className="h-2.5 w-2.5" />
          {slashCount}
        </span>
      )}
    </div>
  );
}

function AgentPassportCell({ agent }: { agent: AgentPassportMini }) {
  return (
    <div className="flex items-center gap-2.5 min-w-[160px]">
      {/* Avatar silhouette */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4B3EEF]/10 to-[#EBEAFE] border border-[#4B3EEF]/20">
        <Cpu className="h-4 w-4 text-[#4B3EEF]" />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#1A1B25]">
          <Lock className="h-1.5 w-1.5 text-white" />
        </span>
      </div>

      <div className="min-w-0">
        {/* Token ID */}
        <div className="flex items-center gap-1 mb-0.5">
          <Hash className="h-2.5 w-2.5 text-gray-400 shrink-0" />
          <span className="text-[10px] font-mono text-gray-400 tracking-wide">{agent.tokenId}</span>
        </div>
        {/* Trust score */}
        <TrustScorePill score={agent.trustScore} slashCount={agent.slashCount} />
      </div>
    </div>
  );
}

const getStatusColor = (status: string) => {
  if (status === 'pending') return 'bg-gray-100 text-gray-700 border border-gray-200';
  if (status === 'in-progress') return 'bg-blue-100 text-blue-700 border border-blue-200';
  if (status === 'auditing') return 'bg-[#4B3EEF]/10 text-[#4B3EEF] border border-[#4B3EEF]/20';
  return 'bg-green-100 text-green-700 border border-green-200';
};

const getStatusLabel = (status: string) => {
  if (status === 'pending') return 'Pending';
  if (status === 'in-progress') return 'In Progress';
  if (status === 'auditing') return 'Auditing';
  return 'Completed';
};

export function MissionsTable() {
  const { missions: userMissions } = useMissions();

  const allMissions: Mission[] = [
    ...userMissions.map((mission, i) => ({
      id: mission.id,
      name: mission.title,
      reward: mission.bountyAmount,
      status: 'pending' as const,
      consensusVotes: ['pending', 'pending', 'pending', 'pending', 'pending'] as ('valid' | 'reject' | 'pending')[],
      executor: undefined,
    })),
    ...mockMissions,
  ];

  return (
    <div className="rounded-2xl border border-indigo-200/40 bg-white/80 backdrop-blur-md shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="px-6 py-4 border-b border-indigo-200/30 bg-gradient-to-r from-indigo-50/50 to-transparent flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1B25]">Your Posted Missions</h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1B25]/5 border border-[#1A1B25]/10">
          <Lock className="h-3 w-3 text-gray-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">SBT Passports Active</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-indigo-200/30 bg-indigo-50/30">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mission Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reward (USDC)
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Executed By
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Jury Consensus
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-200/20">
            {allMissions.map((mission) => (
              <tr key={mission.id} className="hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[#1A1B25]">{mission.name}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-green-600">${mission.reward.toLocaleString()}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(mission.status)}`}>
                    {getStatusLabel(mission.status)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {mission.executor ? (
                    <AgentPassportCell agent={mission.executor} />
                  ) : (
                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <ConsensusJury votes={mission.consensusVotes} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
