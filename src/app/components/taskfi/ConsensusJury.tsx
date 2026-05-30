import { useTranslation } from 'react-i18next';

interface ConsensusJuryProps {
  votes: ('valid' | 'reject' | 'pending')[];
}

export function ConsensusJury({ votes }: ConsensusJuryProps) {
  const { t } = useTranslation();

  const getColor = (vote: 'valid' | 'reject' | 'pending') => {
    if (vote === 'valid') return 'bg-green-500 border-green-600';
    if (vote === 'reject') return 'bg-red-500 border-red-600';
    return 'bg-gray-300 border-gray-400';
  };

  const getGlow = (vote: 'valid' | 'reject' | 'pending') => {
    if (vote === 'valid') return 'shadow-[0_0_10px_rgba(34,197,94,0.6)]';
    if (vote === 'reject') return 'shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    return '';
  };

  // Calculate consensus stats
  const validCount = votes.filter(v => v === 'valid').length;
  const rejectCount = votes.filter(v => v === 'reject').length;
  const pendingCount = votes.filter(v => v === 'pending').length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {votes.map((vote, index) => (
          <div
            key={index}
            className={`h-3 w-3 rounded-full border ${getColor(vote)} ${getGlow(vote)} transition-all hover:scale-125 cursor-pointer`}
            title={t('Judge {{number}}: {{vote}}', { number: index + 1, vote })}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs">
        {validCount > 0 && (
          <span className="flex items-center gap-1 text-green-600 font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {t('{{count}} Valid', { count: validCount })}
          </span>
        )}
        {rejectCount > 0 && (
          <span className="flex items-center gap-1 text-red-600 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {t('{{count}} Reject', { count: rejectCount })}
          </span>
        )}
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-gray-500">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            {t('{{count}} Pending', { count: pendingCount })}
          </span>
        )}
      </div>
    </div>
  );
}