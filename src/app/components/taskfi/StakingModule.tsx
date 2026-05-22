import { Coins, TrendingUp, Percent } from 'lucide-react';
import { Button } from '../ui/button';

export function StakingModule() {
  return (
    <div className="rounded-2xl border border-indigo-200/40 bg-gradient-to-br from-white/90 to-purple-50/40 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="h-5 w-5 text-purple-600" />
        <h3 className="text-sm font-semibold text-[#1A1B25]">$TASK Staking</h3>
      </div>

      {/* Staking Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 border border-purple-200/30 hover:border-purple-300/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-gray-600">Boost Reputation</span>
          </div>
          <p className="text-2xl font-bold text-[#1A1B25]">+15%</p>
          <p className="text-xs text-gray-500 mt-1">Current multiplier</p>
        </div>

        <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 border border-emerald-200/30 hover:border-emerald-300/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-gray-600">Fee Discount</span>
          </div>
          <p className="text-2xl font-bold text-[#1A1B25]">25%</p>
          <p className="text-xs text-gray-500 mt-1">Protocol fees</p>
        </div>
      </div>

      {/* Staking Input */}
      <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 border border-indigo-200/30 mb-4 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600">Your Balance</span>
          <span className="text-xs font-semibold text-[#1A1B25]">18,423 $TASK</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="0.00"
            className="flex-1 bg-transparent text-2xl font-bold text-[#1A1B25] outline-none placeholder:text-gray-300"
          />
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
            MAX
          </button>
        </div>
      </div>

      {/* APY Display */}
      <div className="flex items-center justify-between mb-4 px-2 py-2 rounded-lg bg-gradient-to-r from-green-50 to-transparent">
        <span className="text-xs text-gray-600">Current APY</span>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-600" />
          <span className="text-sm font-bold text-green-600">32.4%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="bg-gradient-to-r from-[#EBEAFE] to-[#EBEAFE]/80 text-[#1A1B25] hover:from-[#EBEAFE]/90 hover:to-[#EBEAFE]/70 font-semibold hover:scale-105 transition-all">
          Stake
        </Button>
        <Button className="border border-indigo-200 bg-white/60 text-[#1A1B25] hover:bg-white/80 font-semibold hover:scale-105 transition-all">
          Unstake
        </Button>
      </div>
    </div>
  );
}