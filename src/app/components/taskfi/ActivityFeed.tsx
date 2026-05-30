import { CheckCircle2, Flame, TrendingUp, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMissions } from '../../contexts/MissionsContext';

type TFunc = (key: string, options?: Record<string, unknown>) => string;

interface Activity {
  id: string;
  type: 'consensus' | 'buyback' | 'validation' | 'mission';
  title: string;
  description: string;
  timestamp: string;
}

// Relative-time formatter ("2 min ago", "3 hours ago", ...).
function relativeTime(date: Date, t: TFunc): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('just now');
  if (mins < 60) return t('{{count}} min ago', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('{{count}} hour ago', { count: hours });
  const days = Math.floor(hours / 24);
  return t('{{count}} day ago', { count: days });
}

export function ActivityFeed() {
  const { t } = useTranslation();
  const { missions, loading } = useMissions();

  // There is no dedicated activity endpoint, so the feed is derived from the
  // most recent missions: a "completed" or "created" event per mission.
  const activities: Activity[] = [...missions]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 12)
    .map((m): Activity => {
      if (m.status === 'completed') {
        return {
          id: `m-${m.id}`,
          type: 'consensus',
          title: t('Mission Completed'),
          description: t('"{{title}}" validated by the consensus jury', { title: m.title }),
          timestamp: relativeTime(m.timestamp, t),
        };
      }
      if (m.status === 'in-progress') {
        return {
          id: `m-${m.id}`,
          type: 'validation',
          title: t('Mission In Progress'),
          description: t('"{{title}}" is being executed by an agent', { title: m.title }),
          timestamp: relativeTime(m.timestamp, t),
        };
      }
      return {
        id: `m-${m.id}`,
        type: 'mission',
        title: t('New Mission Posted'),
        description: t('"{{title}}" — {{amount}} USDC bounty', { title: m.title, amount: m.bountyAmount.toLocaleString() }),
        timestamp: relativeTime(m.timestamp, t),
      };
    });

  const getIcon = (type: string) => {
    if (type === 'consensus') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (type === 'buyback') return <Flame className="h-4 w-4 text-[#4B3EEF]" />;
    if (type === 'mission') return <Target className="h-4 w-4 text-indigo-600" />;
    return <TrendingUp className="h-4 w-4 text-indigo-600" />;
  };

  const getBgColor = (type: string) => {
    if (type === 'consensus') return 'bg-green-100';
    if (type === 'buyback') return 'bg-[#4B3EEF]/20';
    return 'bg-indigo-100';
  };

  return (
    <div className="rounded-2xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-sm font-semibold text-[#1A1B25] mb-4">{t('Activity Feed')}</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {loading && activities.length === 0 && (
          <p className="text-xs text-gray-400 py-6 text-center">{t('Loading activity…')}</p>
        )}
        {!loading && activities.length === 0 && (
          <p className="text-xs text-gray-400 py-6 text-center">{t('No recent activity yet.')}</p>
        )}
        {activities.map((activity, index) => (
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
