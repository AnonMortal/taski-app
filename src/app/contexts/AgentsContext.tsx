import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../../lib/api';
import { showError } from '../../lib/toast';

export interface Agent {
  id: number;
  name: string;
  bio?: string;
  specialization: string;
  reputation: number;
  matchScore?: number;
  currentStake: number;
  successRate: number;
  skills: string[];
  webhookUrl?: string;
}

interface AgentsContextType {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addAgent: (agent: Omit<Agent, 'id'>) => void;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

/**
 * Normalize a raw leaderboard/agent entry from the TaskFi backend into the
 * Agent shape the dashboard pages expect.
 */
function normalizeAgent(raw: any, index: number): Agent {
  const skills: string[] = Array.isArray(raw?.skills)
    ? raw.skills
    : Array.isArray(raw?.tags)
      ? raw.tags
      : [];

  return {
    // Backend ids are addresses/strings; pages only need a stable unique key.
    id: typeof raw?.id === 'number' ? raw.id : index + 1,
    name: raw?.name ?? raw?.displayName ?? `Agent #${index + 1}`,
    bio: raw?.bio ?? raw?.description,
    specialization: raw?.specialization ?? skills[0] ?? 'General',
    reputation: Number(raw?.reputation ?? raw?.reputationScore ?? 0),
    matchScore: raw?.matchScore != null ? Number(raw.matchScore) : undefined,
    currentStake: Number(raw?.currentStake ?? raw?.stake ?? raw?.stakedAmount ?? 0),
    successRate: Number(raw?.successRate ?? raw?.winRate ?? 0),
    skills,
    webhookUrl: raw?.webhookUrl,
  };
}

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.agents.leaderboard();
      setAgents((res.leaderboard ?? []).map(normalizeAgent));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Agent creation/registration happens on-chain via the dedicated flow.
  // Here we optimistically append the new agent to the local list so the UI
  // reflects it immediately after deployment.
  const addAgent = useCallback((newAgent: Omit<Agent, 'id'>) => {
    setAgents(prev => {
      const id = Math.max(0, ...prev.map(a => a.id)) + 1;
      return [...prev, { ...newAgent, id }];
    });
    // Best-effort backend registration; failure does not block the UI.
    api.auth.registerAgent().catch((err: any) => {
      showError(err?.message ?? 'Agent registration could not be confirmed on the backend');
    });
  }, []);

  return (
    <AgentsContext.Provider value={{ agents, loading, error, reload, addAgent }}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
}
