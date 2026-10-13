import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, type Session } from '../../src/domain/types';
import {
  clearAll,
  loadActiveSession,
  loadSessions,
  loadSettings,
  loadUser,
  saveActiveSession,
  saveSessions,
  saveSettings,
  saveUser,
} from '../../src/storage/storage';

const user = { name: 'Ada', createdAt: '2026-10-13T10:00:00.000Z' };
const validSession: Session = {
  id: 'a',
  startedAt: '2026-10-13T10:00:00.000Z',
  endedAt: '2026-10-13T10:25:00.000Z',
  plannedMin: 25,
  intention: 'work',
  status: 'completed',
};

beforeEach(async () => {
  await AsyncStorage.clear();
  vi.restoreAllMocks();
});

describe('user', () => {
  it('round-trips and stores a versioned envelope', async () => {
    await saveUser(user);
    expect(await loadUser()).toEqual(user);
    expect(JSON.parse((await AsyncStorage.getItem('user'))!)).toEqual({ schemaVersion: 1, data: user });
  });
  it('is null when missing', async () => {
    expect(await loadUser()).toBeNull();
  });
  it('ignores an unknown schema version', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem('user', JSON.stringify({ schemaVersion: 99, data: { name: 'x' } }));
    expect(await loadUser()).toBeNull();
  });
});

describe('settings', () => {
  it('defaults when missing', async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
  it('fills in missing fields from defaults', async () => {
    await AsyncStorage.setItem('settings', JSON.stringify({ schemaVersion: 1, data: { sound: false } }));
    expect(await loadSettings()).toEqual({ ...DEFAULT_SETTINGS, sound: false });
  });
  it('round-trips', async () => {
    const s = { defaultDurationMin: 40, sound: false, keepAwake: false };
    await saveSettings(s);
    expect(await loadSettings()).toEqual(s);
  });
});

describe('sessions', () => {
  it('returns [] and warns on corrupt JSON', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem('sessions', '{not json');
    expect(await loadSessions()).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });
  it('drops invalid entries and keeps valid ones', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(
      'sessions',
      JSON.stringify({ schemaVersion: 1, data: [validSession, { foo: 1 }] }),
    );
    expect(await loadSessions()).toEqual([validSession]);
  });
  it('round-trips', async () => {
    await saveSessions([validSession]);
    expect(await loadSessions()).toEqual([validSession]);
  });
});

describe('active session', () => {
  it('round-trips and is removed when saved as null', async () => {
    const a = { startedAt: '2026-10-13T10:00:00.000Z', plannedMin: 25, intention: 'work' as const };
    await saveActiveSession(a);
    expect(await loadActiveSession()).toEqual(a);
    await saveActiveSession(null);
    expect(await AsyncStorage.getItem('activeSession')).toBeNull();
    expect(await loadActiveSession()).toBeNull();
  });
});

describe('clearAll', () => {
  it('removes every key', async () => {
    await saveUser(user);
    await saveSettings(DEFAULT_SETTINGS);
    await saveSessions([validSession]);
    await saveActiveSession({ startedAt: validSession.startedAt, plannedMin: 25, intention: 'work' });
    await clearAll();
    for (const key of ['user', 'settings', 'sessions', 'activeSession']) {
      expect(await AsyncStorage.getItem(key)).toBeNull();
    }
  });
});

describe('legacy data', () => {
  it('migrates sessions stored with the old "tag" field to "intention"', async () => {
    const { intention, ...rest } = validSession;
    await AsyncStorage.setItem(
      'sessions',
      JSON.stringify({ schemaVersion: 1, data: [{ ...rest, tag: intention }] }),
    );
    expect(await loadSessions()).toEqual([validSession]);
  });
  it('migrates an active session stored with the old "tag" field', async () => {
    await AsyncStorage.setItem(
      'activeSession',
      JSON.stringify({ schemaVersion: 1, data: { startedAt: validSession.startedAt, plannedMin: 25, tag: 'study' } }),
    );
    expect(await loadActiveSession()).toEqual({
      startedAt: validSession.startedAt,
      plannedMin: 25,
      intention: 'study',
    });
  });
});
