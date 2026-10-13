import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { generateDemoSessions } from '../domain/demo';
import { makeId } from '../domain/id';
import {
  completeSession,
  failSession,
  remainingMs,
  restoreActiveSession,
} from '../domain/timer';
import {
  DEFAULT_SETTINGS,
  type ActiveSession,
  type Session,
  type Settings,
  type Intention,
  type User,
} from '../domain/types';
import * as storage from '../storage/storage';
import { Toast } from '../components/Toast';

const SAVE_ERROR = "Couldn't save, please try again";

export interface AppContextValue {
  ready: boolean;
  user: User | null;
  settings: Settings;
  sessions: Session[];
  activeSession: ActiveSession | null;
  createUser(name: string): Promise<void>;
  renameUser(name: string): Promise<void>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  startSession(plannedMin: number, intention: Intention): Promise<void>;
  giveUp(): Promise<void>;
  finishIfDue(now: Date): Promise<Session | null>;
  seedDemoData(): Promise<void>;
  resetAll(): Promise<void>;
  showToast(msg: string): void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  // Refs mirror state so async actions never work on a stale snapshot.
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;
  const activeRef = useRef(activeSession);
  activeRef.current = activeSession;

  const showToast = useCallback((msg: string) => setToast(msg), []);
  const hideToast = useCallback(() => setToast(null), []);

  /** Runs a save; on failure shows the toast and keeps in-memory state. */
  const persist = useCallback(
    async (save: () => Promise<void>) => {
      try {
        await save();
      } catch (e) {
        console.warn('[storage] save failed', e);
        showToast(SAVE_ERROR);
      }
    },
    [showToast],
  );

  useEffect(() => {
    (async () => {
      const [u, s, list, active] = await Promise.all([
        storage.loadUser(),
        storage.loadSettings(),
        storage.loadSessions(),
        storage.loadActiveSession(),
      ]);
      const restored = restoreActiveSession(active, new Date(), makeId());
      const allSessions = restored.completed
        ? [...list, restored.completed]
        : list;
      setUser(u);
      setSettings(s);
      setSessions(allSessions);
      setActiveSession(restored.active);
      if (restored.completed) {
        await persist(() => storage.saveSessions(allSessions));
        await persist(() => storage.saveActiveSession(null));
      }
      setReady(true);
    })();
  }, [persist]);

  const addSession = useCallback(
    async (s: Session) => {
      const next = [...sessionsRef.current, s];
      sessionsRef.current = next;
      activeRef.current = null;
      setSessions(next);
      setActiveSession(null);
      await persist(() => storage.saveSessions(next));
      await persist(() => storage.saveActiveSession(null));
    },
    [persist],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      user,
      settings,
      sessions,
      activeSession,
      showToast,
      async createUser(name) {
        const u = { name, createdAt: new Date().toISOString() };
        setUser(u);
        setSettings(DEFAULT_SETTINGS);
        await persist(() => storage.saveSettings(DEFAULT_SETTINGS));
        await persist(() => storage.saveUser(u));
      },
      async renameUser(name) {
        if (!user) return;
        const u = { ...user, name };
        setUser(u);
        await persist(() => storage.saveUser(u));
      },
      async updateSettings(patch) {
        const next = { ...settings, ...patch };
        setSettings(next);
        await persist(() => storage.saveSettings(next));
      },
      async startSession(plannedMin, intention) {
        const a = {
          startedAt: new Date().toISOString(),
          plannedMin,
          intention,
        };
        activeRef.current = a;
        setActiveSession(a);
        await persist(() => storage.saveActiveSession(a));
      },
      async giveUp() {
        const a = activeRef.current;
        if (!a) return;
        await addSession(failSession(a, new Date(), makeId()));
      },
      async finishIfDue(now) {
        const a = activeRef.current;
        if (!a || remainingMs(a, now) > 0) return null;
        const done = completeSession(a, makeId());
        await addSession(done);
        return done;
      },
      async seedDemoData() {
        const demo = generateDemoSessions(new Date());
        sessionsRef.current = demo;
        setSessions(demo);
        await persist(() => storage.saveSessions(demo));
      },
      async resetAll() {
        await persist(() => storage.clearAll());
        sessionsRef.current = [];
        activeRef.current = null;
        setSessions([]);
        setActiveSession(null);
        setSettings(DEFAULT_SETTINGS);
        setUser(null);
      },
    }),
    [
      ready,
      user,
      settings,
      sessions,
      activeSession,
      showToast,
      persist,
      addSession,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toast message={toast} onHide={hideToast} />
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
