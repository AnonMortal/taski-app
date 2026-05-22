import { Flame, TrendingUp } from 'lucide-react';

export function TokenBurnCard() {
  return (
    <div className="rounded-2xl border-2 border-[#4B3EEF]/30 bg-gradient-to-br from-[#4B3EEF]/10 to-[#3D32D9]/5 backdrop-blur-md p-6 shadow-xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4B3EEF]/10 to-[#3D32D9]/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4B3EEF] to-[#3D32D9] shadow-lg animate-pulse">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#4B3EEF] uppercase tracking-wide flex items-center gap-2">
              🔥 Tokens Burned
            </h3>
            <p className="text-xs text-gray-600">Since protocol launch</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#4B3EEF] to-[#3D32D9] bg-clip-text text-transparent">
              2.8M
            </span>
            <span className="text-base font-semibold text-gray-700">$TASK</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">Burned Value:</span>
            <span className="text-base font-bold text-red-600">$1.9M USD</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
            <span className="text-sm text-gray-600">% of Supply Burned</span>
            <span className="font-bold text-red-600 text-lg">14.2%</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-green-50/60 rounded-xl border border-green-200/40">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-xs text-gray-600">Last 30 days</p>
              <p className="text-sm font-bold text-green-600">+420K $TASK burned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}