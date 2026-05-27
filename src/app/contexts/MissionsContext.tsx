import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../../lib/api';
import { showError } from '../../lib/toast';

export type JuryVote = 'valid' | 'reject' | 'pending';

export interface JudgeScore {
  judge: string;
  score: number;
  vote: JuryVote;
}

export interface MissionSubmission {
  id: string;
  agentAddress?: string;
  finalScore: number | null;
  isWinner: boolean;
  judges: JudgeScore[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  bountyAmount: number;
  posterType: 'individual' | 'enterprise';
  companyName?: string;
  timestamp: Date;
  status: 'open' | 'in-progress' | 'completed';
  winnerAddress?: string;
  juryVotes?: JuryVote[];
  submissions?: MissionSubmission[];
}

interface MissionsContextType {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addMission: (mission: Omit<Mission, 'id' | 'timestamp' | 'status'>, files?: File[]) => Promise<void>;
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

/**
 * Normalize a raw mission object coming from the TaskFi backend into the
 * shape the dashboard pages expect. The backend status vocabulary differs
 * from the UI vocabulary, so it is mapped here.
 */
const JUDGE_PASS_THRESHOLD = 60;
const CRITERIA: { key: 'completeness' | 'coherence' | 'richness' | 'format' | 'originality'; label: string }[] = [
  { key: 'completeness', label: 'Completeness' },
  { key: 'coherence', label: 'Coherence' },
  { key: 'richness', label: 'Richness' },
  { key: 'format', label: 'Format' },
  { key: 'originality', label: 'Originality' },
];

function normalizeSubmissions(raw: any): MissionSubmission[] | undefined {
  if (!Array.isArray(raw?.submissions)) return undefined;
  return raw.submissions.map((sub: any): MissionSubmission => {
    const scoring = sub?.scoringLog ?? null;
    const judges: JudgeScore[] = CRITERIA.map(({ key, label }) => {
      const value = scoring?.[key];
      const score = typeof value === 'number' && Number.isFinite(value) ? value : null;
      const vote: JuryVote = score === null ? 'pending' : score >= JUDGE_PASS_THRESHOLD ? 'valid' : 'reject';
      return { judge: label, score: score ?? 0, vote };
    });
    return {
      id: String(sub?.id ?? ''),
      agentAddress: sub?.agent?.walletAddress ?? undefined,
      finalScore: typeof sub?.finalScore === 'number' ? sub.finalScore : null,
      isWinner: Boolean(sub?.isWinner),
      judges,
    };
  });
}

function aggregateJuryVotes(submissions: MissionSubmission[] | undefined, status: Mission['status']): JuryVote[] | undefined {
  if (!submissions || submissions.length === 0) return undefined;
  const winner = submissions.find((s) => s.isWinner);
  const source = winner ?? submissions.slice().sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))[0];
  if (!source || source.judges.length === 0) {
    return status === 'completed' ? Array<JuryVote>(5).fill('valid') : undefined;
  }
  return source.judges.map((j) => j.vote);
}

function normalizeMission(raw: any): Mission {
  const rawStatus = String(raw?.status ?? '').toLowerCase();
  let status: Mission['status'] = 'open';
  if (['active', 'accepted', 'in_progress', 'in-progress', 'submitted', 'scoring', 'review', 'contested'].includes(rawStatus)) {
    status = 'in-progress';
  } else if (['completed', 'validated', 'resolved', 'closed', 'cancelled', 'disputed'].includes(rawStatus)) {
    status = 'completed';
  }

  const posterType: Mission['posterType'] =
    raw?.posterType === 'enterprise' || raw?.poster?.role === 'enterprise' || raw?.companyName
      ? 'enterprise'
      : 'individual';

  const submissions = normalizeSubmissions(raw);
  const winnerSubmission = submissions?.find((s) => s.isWinner);
  const winnerAddress = winnerSubmission?.agentAddress ?? raw?.winner?.walletAddress ?? undefined;
  const juryVotes = aggregateJuryVotes(submissions, status);

  return {
    id: String(raw?.id ?? raw?.missionId ?? ''),
    title: raw?.title ?? 'Untitled mission',
    description: raw?.description ?? '',
    category: raw?.category ?? 'General',
    bountyAmount: Number(raw?.bountyAmount ?? raw?.reward ?? raw?.rewardAmount ?? 0),
    posterType,
    companyName: raw?.companyName ?? raw?.poster?.companyName,
    timestamp: raw?.createdAt ? new Date(raw.createdAt) : new Date(),
    status,
    winnerAddress,
    juryVotes,
    submissions,
  };
}

export function MissionsProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [publicRes, mine] = await Promise.all([
        api.missions.list({ limit: 100 }),
        api.missions.my().catch(() => ({ missions: [] as any[] })),
      ]);
      const merged = new Map<string, any>();
      for (const m of publicRes.missions ?? []) merged.set(String(m.id), m);
      for (const m of mine.missions ?? []) merged.set(String(m.id), m);
      setMissions(Array.from(merged.values()).map(normalizeMission));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load missions');
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addMission = useCallback(
    async (missionData: Omit<Mission, 'id' | 'timestamp' | 'status'>, files?: File[]) => {
      try {
        const form = new FormData();
        form.append('title', missionData.title);
        form.append('description', missionData.description);
        form.append('category', missionData.category.toUpperCase().replace(/[\s&]+/g, '_'));
        form.append('reward', String(missionData.bountyAmount));
        form.append('posterType', missionData.posterType.toUpperCase());
        if (missionData.companyName) form.append('companyName', missionData.companyName);
        for (const file of files ?? []) form.append('files', file, file.name);

        const created = await api.missions.create(form);
        // Prepend the created mission (normalized) so the UI updates instantly.
        setMissions(prev => [normalizeMission(created?.mission ?? created), ...prev]);
      } catch (err: any) {
        showError(err?.message ?? 'Failed to create mission');
        throw err;
      }
    },
    [],
  );

  return (
    <MissionsContext.Provider value={{ missions, loading, error, reload, addMission }}>
      {children}
    </MissionsContext.Provider>
  );
}

export function useMissions() {
  const context = useContext(MissionsContext);
  if (!context) {
    throw new Error('useMissions must be used within a MissionsProvider');
  }
  return context;
}
