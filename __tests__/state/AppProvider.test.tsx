import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, type Session } from '../../src/domain/types';
import {
  AppProvider,
  useApp,
  type AppContextValue,
} from '../../src/state/AppProvider';
import * as storage from '../../src/storage/storage';

// The provider only needs React Native for its Toast: plain host components are enough here.
vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: <T,>(s: T) => s },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const NOW = new Date('2026-10-16T10:00:00.000Z');
const realSession: Session = {
  id: 'real-1',
  startedAt: '2026-10-15T09:00:00.000Z',
  endedAt: '2026-10-15T09:25:00.000Z',
  plannedMin: 25,
  intention: 'work',
  status: 'completed',
};

let app: AppContextValue;
let renderer: TestRenderer.ReactTestRenderer;

function Capture() {
  app = useApp();
  return null;
}

async function mount() {
  await act(async () => {
    renderer = TestRenderer.create(
      <AppProvider>
        <Capture />
      </AppProvider>,
    );
  });
  expect(app.ready).toBe(true);
}

const toastText = () =>
  renderer.root
    .findAll(n => (n.type as unknown) === 'Text')
    .map(n => n.props.children);

beforeEach(async () => {
  await AsyncStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  act(() => renderer?.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('AppProvider', () => {
  it('counts a session that ended while the app was closed', async () => {
    await storage.saveActiveSession({
      startedAt: '2026-10-16T09:00:00.000Z',
      plannedMin: 25,
      intention: 'study',
    });
    await mount();

    expect(app.activeSession).toBeNull();
    expect(app.sessions).toHaveLength(1);
    expect(app.sessions[0]).toMatchObject({
      status: 'completed',
      endedAt: '2026-10-16T09:25:00.000Z',
    });
    expect(await storage.loadSessions()).toHaveLength(1);
    expect(await storage.loadActiveSession()).toBeNull();
  });

  it('keeps a session that is still running after a relaunch', async () => {
    const active = { startedAt: '2026-10-16T09:50:00.000Z', plannedMin: 25, intention: 'work' as const };
    await storage.saveActiveSession(active);
    await mount();

    expect(app.activeSession).toEqual(active);
    expect(app.sessions).toHaveLength(0);
  });

  it('records one session when the session ends and Give up happen at the same moment', async () => {
    await mount();
    await act(() => app.startSession(1, 'work'));
    vi.setSystemTime(new Date(NOW.getTime() + 61_000));

    await act(async () => {
      await Promise.all([app.finishIfDue(new Date()), app.giveUp()]);
    });

    expect(app.sessions).toHaveLength(1);
    expect(app.sessions[0].status).toBe('completed');
    expect(app.activeSession).toBeNull();
    expect(await storage.loadSessions()).toHaveLength(1);
  });

  it('does not finish a session early', async () => {
    await mount();
    await act(() => app.startSession(1, 'work'));
    vi.setSystemTime(new Date(NOW.getTime() + 30_000));

    let done: Session | null = null;
    await act(async () => {
      done = await app.finishIfDue(new Date());
    });

    expect(done).toBeNull();
    expect(app.activeSession).not.toBeNull();
  });

  it('keeps both of two settings changes made before a re-render', async () => {
    await mount();
    await act(async () => {
      await Promise.all([
        app.updateSettings({ sound: false }),
        app.updateSettings({ keepAwake: false }),
      ]);
    });

    const expected = { ...DEFAULT_SETTINGS, sound: false, keepAwake: false };
    expect(app.settings).toEqual(expected);
    expect(await storage.loadSettings()).toEqual(expected);
  });

  it('seeding demo data keeps real sessions and replaces an earlier seed', async () => {
    await storage.saveSessions([realSession]);
    await mount();

    await act(() => app.seedDemoData());
    const firstSeed = app.sessions.length;
    await act(() => app.seedDemoData());

    expect(app.sessions).toContainEqual(realSession);
    expect(app.sessions.filter(s => s.id === realSession.id)).toHaveLength(1);
    expect(new Set(app.sessions.map(s => s.id)).size).toBe(app.sessions.length);
    expect(firstSeed).toBeGreaterThan(1);
    expect(await storage.loadSessions()).toEqual(app.sessions);
  });

  it('reset forgets everything once storage is cleared', async () => {
    await mount();
    await act(() => app.createUser('Ada'));
    await act(() => app.startSession(25, 'work'));

    await act(() => app.resetAll());

    expect(app.user).toBeNull();
    expect(app.activeSession).toBeNull();
    expect(app.sessions).toEqual([]);
    expect(await storage.loadUser()).toBeNull();
  });

  it('reset keeps the data and shows an error when storage cannot be cleared', async () => {
    await mount();
    await act(() => app.createUser('Ada'));
    vi.spyOn(AsyncStorage, 'removeMany').mockRejectedValueOnce(new Error('disk full'));

    await act(() => app.resetAll());

    expect(app.user?.name).toBe('Ada');
    expect(toastText()).toContain("Couldn't save, please try again");
  });

  it('shows an error but keeps the change in memory when saving fails', async () => {
    await mount();
    await act(() => app.createUser('Ada'));
    vi.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));

    await act(() => app.renameUser('Grace'));

    expect(app.user?.name).toBe('Grace');
    expect(toastText()).toContain("Couldn't save, please try again");
  });
});
