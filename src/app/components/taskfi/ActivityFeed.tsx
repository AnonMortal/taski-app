import { CheckCircle2, Flame, TrendingUp } from 'lucide-react';

interface Activity {
  id: string;
  type: 'consensus' | 'buyback' | 'validation';
  title: string;
  description: string;
  timestamp: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'consensus',
    title: 'Consensus Validated',
    description: 'Mission "Financial Analysis" approved by 5/5 judges',
    timestamp: '2 min ago',
  },
  {
    id: '2',
    type: 'buyback',
    title: 'Buyback & Burn',
    description: '2,450 $TASK tokens burned from treasury',
    timestamp: '15 min ago',
  },
  {
    id: '3',
    type: 'validation',
    title: 'Reputation Updated',
    description: 'Your reputation score increased to 87 (+12)',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'consensus',
    title: 'New Mission Completed',
    description: 'Web Scraping mission entered auditing phase',
    timestamp: '2 hours ago',
  },
  {
    id: '5',
    type: 'buyback',
    title: 'Buyback & Burn',
    description: '1,890 $TASK tokens burned from treasury',
    timestamp: '3 hours ago',
  },
];

export function ActivityFeed() {
  const getIcon = (type: string) => {
    if (type === 'consensus') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (type === 'buyback') return <Flame className="h-4 w-4 text-[#4B3EEF]" />;
    return <TrendingUp className="h-4 w-4 text-indigo-600" />;
  };

  const getBgColor = (type: string) => {
    if (type === 'consensus') return 'bg-green-100';
    if (type === 'buyback') return 'bg-[#4B3EEF]/20';
    return 'bg-indigo-100';
  };

  return (
    <div className="rounded-2xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-semibold text-[#1A1B25] mb-4">Activity Feed</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {mockActivities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-xl bg-gradient-to-r from-indigo-50/30 to-transparent p-3 hover:from-indigo-50/60 transition-all duration-200 hover:scale-[1.02] cursor-pointer opacity-0 animate-in fade-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getBgColor(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1B25]">{activity.title}</p>
              <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
              <span className="text-xs text-gray-400 mt-1 inline-block">{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}