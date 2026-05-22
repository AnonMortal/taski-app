import { DollarSign, Coins } from 'lucide-react';

export function EarningsCard() {
  return (
    <div className="rounded-2xl border border-indigo-200/40 bg-gradient-to-br from-white/90 to-emerald-50/40 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Total Earned
          </h3>
          <p className="text-xs text-gray-500">Total protocol revenue</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* USDC Balance */}
        <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 border border-emerald-200/30 hover:border-emerald-300/50 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">USDC</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
              <DollarSign className="h-3 w-3 text-blue-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1A1B25]">$24,567.89</p>
          <p className="text-xs text-gray-500 mt-1">From 156 missions</p>
        </div>

        {/* $TASK Balance */}
        <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 border border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">$TASK</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
              <Coins className="h-3 w-3 text-indigo-700" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1A1B25]">18,423</p>
          <p className="text-xs text-gray-500 mt-1">≈ $15,507.89</p>
        </div>
      </div>
    </div>
  );
}