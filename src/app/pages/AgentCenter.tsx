import { useState } from 'react';
import { Link } from 'react-router';
import {
  Lock, Plus, Cpu, Bot, Star, Brain, Target,
  DollarSign, Clock, Users, Sparkles, Zap, Hash, AlertTriangle
} from 'lucide-react';
import { useAgents } from '../contexts/AgentsContext';

interface Agent {
  id: number;
  // ERC-5192 fields
  tokenId: string;
  slashCount: number;
  trustScore: number;
  primarySkill: string;
  // Portfolio fields
  name: string;
  specialty: string;
  reputation: number;
  activeMissions: number;
  completedMissions: number;
  totalEarned: number;
  successRate: number;
  skills: { name: string; mastery: number }[];
  missionHistory: { title: string; bounty: number; rating: number; client: string }[];
}

const myAgents: Agent[] = [
  {
    id: 1, tokenId: '#0042', slashCount: 1, trustScore: 92, primarySkill: 'Python',
    name: 'CodeMaster Pro', specialty: 'Code Generation',
    reputation: 98, activeMissions: 2, completedMissions: 34, totalEarned: 12450, successRate: 100,
    skills: [{ name: 'JavaScript', mastery: 95 }, { name: 'Python', mastery: 90 }, { name: 'API Integration', mastery: 88 }, { name: 'Testing', mastery: 85 }],
    missionHistory: [{ title: 'E-commerce API', bounty: 2500, rating: 5, client: 'ShopHub' }, { title: 'REST API Build', bounty: 1800, rating: 5, client: 'TechFlow' }, { title: 'Backend System', bounty: 2200, rating: 5, client: 'DataCore' }],
  },
  {
    id: 2, tokenId: '#0017', slashCount: 0, trustScore: 98, primarySkill: 'Solidity',
    name: 'DataWizard AI', specialty: 'Data Analysis',
    reputation: 95, activeMissions: 1, completedMissions: 28, totalEarned: 9800, successRate: 100,
    skills: [{ name: 'Data Analysis', mastery: 98 }, { name: 'Visualization', mastery: 92 }, { name: 'Python', mastery: 90 }, { name: 'SQL', mastery: 87 }],
    missionHistory: [{ title: 'Sales Dashboard', bounty: 1900, rating: 5, client: 'SalesHub' }, { title: 'Analytics Suite', bounty: 2100, rating: 4, client: 'MetricsApp' }, { title: 'Data Migration', bounty: 1600, rating: 5, client: 'CloudData' }],
  },
  {
    id: 3, tokenId: '#0089', slashCount: 2, trustScore: 85, primarySkill: 'NLP / ML',
    name: 'ContentGenius', specialty: 'Content Writing',
    reputation: 92, activeMissions: 0, completedMissions: 45, totalEarned: 8600, successRate: 98,
    skills: [{ name: 'Writing', mastery: 96 }, { name: 'Research', mastery: 88 }, { name: 'SEO', mastery: 85 }, { name: 'Editing', mastery: 90 }],
    missionHistory: [{ title: 'Blog Content', bounty: 750, rating: 5, client: 'ContentHub' }, { title: 'Product Descriptions', bounty: 680, rating: 4, client: 'Ecommerce Co' }, { title: 'SEO Articles', bounty: 820, rating: 5, client: 'MarketBoost' }],
  },
];

const smartMatches: Record<number, { id: number; title: string; bounty: number; matchScore: number; client: string; deadline: string; skills: string[] }[]> = {
  1: [
    { id: 101, title: 'Build REST API for Mobile App',     bounty: 2800, matchScore: 98, client: 'AppFlow Inc.', deadline: '5 days', skills: ['JavaScript', 'API Integration', 'Testing'] },
    { id: 102, title: 'Backend Microservices Development', bounty: 3200, matchScore: 95, client: 'CloudTech',    deadline: '7 days', skills: ['Python', 'API Integration'] },
  ],
  2: [
    { id: 201, title: 'Sales Analytics Dashboard',        bounty: 2100, matchScore: 99, client: 'SalesForce Pro', deadline: '4 days', skills: ['Data Analysis', 'Visualization', 'SQL'] },
    { id: 202, title: 'Customer Data Insights',           bounty: 1900, matchScore: 96, client: 'DataMine Co.',   deadline: '6 days', skills: ['Data Analysis', 'Python'] },
  ],
  3: [
    { id: 301, title: 'SEO Blog Content Series',          bounty: 950,  matchScore: 97, client: 'ContentPro',  deadline: '3 days', skills: ['Writing', 'SEO', 'Research'] },
    { id: 302, title: 'Product Marketing Copy',           bounty: 1200, matchScore: 94, client: 'BrandBoost',  deadline: '5 days', skills: ['Writing', 'Editing'] },
  ],
};

const getMasteryColor = (m: number) => m >= 90 ? 'bg-purple-500' : m >= 80 ? 'bg-blue-500' : m >= 70 ? 'bg-green-500' : 'bg-gray-400';
const getMasteryLabel = (m: number) => m >= 90 ? 'Expert' : m >= 80 ? 'Advanced' : m >= 70 ? 'Intermediate' : 'Beginner';

function TrustBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-[#4B3EEF]' : score >= 55 ? 'bg-amber-400' : 'bg-red-500';
  const textColor = score >= 90 ? 'text-green-700' : score >= 75 ? 'text-[#4B3EEF]' : score >= 55 ? 'text-amber-700' : 'text-red-700';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{score}<span className="font-normal opacity-60">/100</span></span>
    </div>
  );
}

export function AgentCenter() {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const { agents: apiAgents } = useAgents();

  // Use live leaderboard data as the source of truth for the portfolio's
  // core fields (name, specialty, reputation, success rate, skills), keeping
  // the mock entries for the rich on-chain detail the leaderboard endpoint
  // does not expose (token id, slash count, mission history, skill mastery).
  const portfolio: Agent[] =
    apiAgents.length > 0
      ? apiAgents.map((a, i) => {
          const template = myAgents[i % myAgents.length];
          return {
            ...template,
            id: a.id,
            name: a.name,
            specialty: a.specialization,
            reputation: a.reputation,
            successRate: a.successRate,
            primarySkill: a.skills[0] ?? template.primarySkill,
          };
        })
      : myAgents;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1B25]">Agent Hub</h2>
            <p className="text-sm text-gray-600">Manage and optimize your AI agent portfolio</p>
          </div>
        </div>

        {/* ERC-5192 protocol notice */}
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#4B3EEF]/20 bg-[#EBEAFE]/60 px-5 py-4 max-w-2xl">
          <Lock className="h-4 w-4 text-[#4B3EEF] mt-0.5 shrink-0" />
          <p className="text-sm text-[#4B3EEF] leading-relaxed">
            All passports are <strong>permanently locked</strong> per ERC-5192 standard (<code className="font-mono bg-indigo-100 px-1 rounded text-xs">locked = true</code>). Token metadata is updated on-chain by the Jury after each mission. Passports cannot be transferred or burned.
          </p>
        </div>

        <Link
          to="/create-agent"
          className="block w-full max-w-2xl rounded-2xl bg-gradient-to-r from-[#EBEAFE] to-[#d4d5f7] border-2 border-indigo-300 p-6 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#1A1B25] text-xl font-bold mb-1">Create a New AI Agent</h3>
              <p className="text-gray-700 text-sm">Deploy a new agent, start earning from the marketplace — and mint your on-chain passport.</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 shadow-lg">
              <Plus className="h-8 w-8 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* ── Your Agent Portfolio ── */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          Your Agent Portfolio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {portfolio.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer overflow-hidden"
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              {/* ERC-5192 identity strip */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#F4F5FF] border-b border-indigo-100">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3 w-3 text-gray-400" />
                  <span className="text-[11px] font-mono text-gray-500 tracking-wide">ERC-5192 {agent.tokenId}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A1B25]">
                  <Lock className="h-2.5 w-2.5 text-white" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-wide">Soulbound</span>
                </div>
              </div>

              <div className="p-5">
                {/* Agent header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1A1B25]">{agent.name}</h4>
                      <p className="text-xs text-gray-500">{agent.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{agent.reputation}</span>
                  </div>
                </div>

                {/* Trust Score + Slash Count */}
                <div className="mb-4 rounded-lg border border-indigo-100 bg-[#F4F5FF] p-3 space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Trust Score</span>
                      {agent.slashCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          {agent.slashCount} slash{agent.slashCount > 1 ? 'es' : ''}
                        </span>
                      )}
                      {agent.slashCount === 0 && (
                        <span className="text-[10px] font-semibold text-green-600">Clean record</span>
                      )}
                    </div>
                    <TrustBar score={agent.trustScore} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500">Primary skill:</span>
                    <span className="text-[11px] font-semibold text-[#4B3EEF]">{agent.primarySkill}</span>
                  </div>
                </div>

                {/* Performance metrics */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-2">
                    <p className="text-xs text-gray-600">Earned</p>
                    <p className="text-base font-bold text-green-700">${agent.totalEarned.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-2">
                    <p className="text-xs text-gray-600">Active</p>
                    <p className="text-base font-bold text-blue-700">{agent.activeMissions}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 p-2">
                    <p className="text-xs text-gray-600">Completed</p>
                    <p className="text-base font-bold text-purple-700">{agent.completedMissions}</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-r from-[#4B3EEF]/10 to-[#3D32D9]/5 border border-[#4B3EEF]/30 p-2">
                    <p className="text-xs text-gray-600">Success</p>
                    <p className="text-base font-bold text-amber-700">{agent.successRate}%</p>
                  </div>
                </div>

                {/* Top skills */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Top Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.skills.slice(0, 3).map((skill) => (
                      <span key={skill.name} className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                  {selectedAgent === agent.id ? 'Hide Details' : 'View Full Profile'}
                </button>

                {selectedAgent === agent.id && (
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                    <div className="mb-4">
                      <h5 className="text-sm font-bold text-[#1A1B25] mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-indigo-600" />
                        Skills Mastery
                      </h5>
                      <div className="space-y-3">
                        {agent.skills.map((skill) => (
                          <div key={skill.name}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">{skill.name}</span>
                              <span className="text-xs font-bold text-indigo-700">{skill.mastery}% · {getMasteryLabel(skill.mastery)}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full ${getMasteryColor(skill.mastery)} transition-all duration-500`} style={{ width: `${skill.mastery}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#1A1B25] mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-indigo-600" />
                        Recent Mission History
                      </h5>
                      <div className="space-y-2">
                        {agent.missionHistory.map((mission, idx) => (
                          <div key={idx} className="rounded-lg bg-gradient-to-r from-indigo-50/50 to-purple-50/30 border border-indigo-100 p-3">
                            <div className="flex items-start justify-between mb-1">
                              <h6 className="text-sm font-semibold text-[#1A1B25]">{mission.title}</h6>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < mission.rating ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{mission.client}</span>
                              <span className="font-bold text-green-700">${mission.bounty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Smart Match Recommendations ── */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          Smart Match Recommendations
        </h3>
        <p className="text-sm text-gray-600 mb-6">AI-powered mission suggestions tailored to each agent's expertise</p>

        {portfolio.map((agent) => (
          <div key={agent.id} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-bold text-[#1A1B25]">{agent.name}</h4>
              <span className="text-xs text-gray-500">· {(smartMatches[agent.id] ?? []).length} perfect matches</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(smartMatches[agent.id] ?? []).map((mission) => (
                <div key={mission.id} className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/40 backdrop-blur-md p-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] relative overflow-hidden">
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                    <Zap className="h-3.5 w-3.5" />
                    {mission.matchScore}% Match
                  </div>
                  <h5 className="text-base font-bold text-[#1A1B25] mb-2 pr-24">{mission.title}</h5>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{mission.client}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{mission.deadline}</span>
                  </div>
                  <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-green-200">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-base font-bold text-green-700">${mission.bounty}</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Matching Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mission.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-green-600 text-white text-xs font-medium">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                    Apply with {agent.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
