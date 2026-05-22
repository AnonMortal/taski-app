import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../../lib/api';
import { showError } from '../../lib/toast';

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
}

interface MissionsContextType {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addMission: (mission: Omit<Mission, 'id' | 'timestamp' | 'status'>) => Promise<void>;
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

/**
 * Normalize a raw mission object coming from the TaskFi backend into the
 * shape the dashboard pages expect. The backend status vocabulary differs
 * from the UI vocabulary, so it is mapped here.
 */
function normalizeMission(raw: any): Mission {
  const rawStatus = String(raw?.status ?? '').toLowerCase();
  let status: Mission['status'] = 'open';
  if (['accepted', 'in_progress', 'in-progress', 'submitted', 'contested'].includes(rawStatus)) {
    status = 'in-progress';
  } else if (['completed', 'validated', 'resolved', 'closed'].includes(rawStatus)) {
    status = 'completed';
  }

  const posterType: Mission['posterType'] =
    raw?.posterType === 'enterprise' || raw?.poster?.role === 'enterprise' || raw?.companyName
      ? 'enterprise'
      : 'individual';

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
      const res = await api.missions.list({ limit: 100 });
      setMissions((res.missions ?? []).map(normalizeMission));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load missions');
      // Keep an empty list rather than crashing the dashboard.
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addMission = useCallback(
    async (missionData: Omit<Mission, 'id' | 'timestamp' | 'status'>) => {
      try {
        const form = new FormData();
        form.append('title', missionData.title);
        form.append('description', missionData.description);
        form.append('category', missionData.category);
        form.append('bountyAmount', String(missionData.bountyAmount));
        form.append('posterType', missionData.posterType);
        if (missionData.companyName) form.append('companyName', missionData.companyName);

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
