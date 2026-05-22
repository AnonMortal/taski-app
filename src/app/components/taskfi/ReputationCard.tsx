import { Award, TrendingUp, Zap } from 'lucide-react';

export function ReputationCard() {
  const reputationScore = 87;
  const stakingTier = 'Elite'; // Can be: Starter, Advanced, Elite, Legendary
  const currentMultiplier = '1.5x'; // Dynamic multiplier based on staked $TASK

  return (
    <div className="rounded-2xl border border-indigo-200/40 bg-gradient-to-br from-white/90 to-indigo-50/40 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-semibold text-[#1A1B25]">Reputation Score</h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="h-3 w-3" />
          +12
        </div>
      </div>

      {/* Radial Progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative h-40 w-40">
          <svg className="h-40 w-40 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#EBEAFE"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress Circle with animation */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(reputationScore / 100) * 439.6} 439.6`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-[#1A1B25]">{reputationScore}</span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>
      </div>

      {/* Dynamic Multiplier Tier Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs bg-gradient-to-r from-indigo-50 to-transparent rounded-lg px-3 py-2">
          <span className="text-gray-600">Tier: <span className="font-bold text-indigo-700">{stakingTier}</span></span>
          <span className="font-semibold text-indigo-700">Top 5%</span>
        </div>
        
        {/* Current Multiplier from Staking */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-900">Active Multiplier</span>
          </div>
          <span className="text-sm font-bold text-purple-700">{currentMultiplier}</span>
        </div>
      </div>
    </div>
  );
}