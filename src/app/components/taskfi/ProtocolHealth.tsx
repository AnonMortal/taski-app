import { Flame, AlertTriangle, TrendingDown, Activity } from 'lucide-react';

interface ProtocolEvent {
  id: string;
  type: 'buyback' | 'slashing';
  title: string;
  description: string;
  amount: string;
  timestamp: string;
}

const mockProtocolEvents: ProtocolEvent[] = [
  {
    id: '1',
    type: 'buyback',
    title: 'Buyback & Burn',
    description: 'Protocol fee revenue converted to $TASK and burned',
    amount: '2,450 $TASK',
    timestamp: '12 min ago',
  },
  {
    id: '2',
    type: 'slashing',
    title: 'Slashing Event',
    description: 'Agent failed consensus validation - stake burned',
    amount: '380 $TASK',
    timestamp: '45 min ago',
  },
  {
    id: '3',
    type: 'buyback',
    title: 'Buyback & Burn',
    description: 'Protocol fee revenue converted to $TASK and burned',
    amount: '1,890 $TASK',
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    type: 'slashing',
    title: 'Slashing Event',
    description: 'Mission rejected by jury - reputation penalty applied',
    amount: '125 $TASK',
    timestamp: '3 hours ago',
  },
  {
    id: '5',
    type: 'buyback',
    title: 'Buyback & Burn',
    description: 'Protocol fee revenue converted to $TASK and burned',
    amount: '3,200 $TASK',
    timestamp: '5 hours ago',
  },
];

export function ProtocolHealth() {
  const getIcon = (type: 'buyback' | 'slashing') => {
    if (type === 'buyback') return <Flame className="h-4 w-4 text-[#4B3EEF]" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getBgColor = (type: 'buyback' | 'slashing') => {
    if (type === 'buyback') return 'bg-gradient-to-r from-[#4B3EEF]/20 to-[#4B3EEF]/10';
    return 'bg-gradient-to-r from-red-100 to-red-50';
  };

  const getBorderColor = (type: 'buyback' | 'slashing') => {
    if (type === 'buyback') return 'border-[#4B3EEF]/30';
    return 'border-red-300';
  };

  const getAmountColor = (type: 'buyback' | 'slashing') => {
    if (type === 'buyback') return 'text-[#4B3EEF] font-bold';
    return 'text-red-700 font-bold';
  };

  // Calculate total burned today
  const totalBurnedToday = '7,540 $TASK';
  const totalSlashedToday = '505 $TASK';

  return (
    <div className="rounded-2xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-semibold text-[#1A1B25]">Protocol Health</h3>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-gradient-to-br from-[#4B3EEF]/10 to-transparent border border-[#4B3EEF]/30 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-3 w-3 text-[#4B3EEF]" />
            <span className="text-xs text-gray-600">Burned Today</span>
          </div>
          <p className="text-sm font-bold text-[#4B3EEF]">{totalBurnedToday}</p>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-red-50 to-transparent border border-red-200/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-3 w-3 text-red-600" />
            <span className="text-xs text-gray-600">Slashed Today</span>
          </div>
          <p className="text-sm font-bold text-red-700">{totalSlashedToday}</p>
        </div>
      </div>

      {/* Live Event Feed */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {mockProtocolEvents.map((event, index) => (
          <div
            key={event.id}
            className={`rounded-xl border ${getBorderColor(event.type)} ${getBgColor(event.type)} p-3 transition-all hover:scale-[1.02] cursor-pointer opacity-0 animate-in fade-in slide-in-from-right-2`}
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${event.type === 'buyback' ? 'bg-[#4B3EEF]/20' : 'bg-red-100'}`}>
                {getIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#1A1B25]">{event.title}</p>
                  <span className={`text-xs ${getAmountColor(event.type)}`}>-{event.amount}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{event.description}</p>
                <span className="text-xs text-gray-400">{event.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
