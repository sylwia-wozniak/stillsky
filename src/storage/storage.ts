import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_SETTINGS,
  INTENTIONS,
  type ActiveSession,
  type Session,
  type Settings,
  type User,
} from '../domain/types';

const SCHEMA_VERSION = 1;

export const KEYS = {
  user: 'user',
  settings: 'settings',
  sessions: 'sessions',
  activeSession: 'activeSession',
} as const;

type Key = (typeof KEYS)[keyof typeof KEYS];

const isObject = (d: unknown): d is Record<string, unknown> =>
  typeof d === 'object' && d !== null;
const isString = (v: unknown): v is string => typeof v === 'string';
const isIntention = (v: unknown) => INTENTIONS.some(t => t.id === v);

const isUser = (d: unknown): d is User =>
  isObject(d) && isString(d.name) && isString(d.createdAt);

const isActiveSession = (d: unknown): d is ActiveSession =>
  isObject(d) &&
  isString(d.startedAt) &&
  typeof d.plannedMin === 'number' &&
  isIntention(d.intention);

/** Sessions saved before the Tag → Intention rename stored the field as `tag`. */
function migrateLegacyTag(d: unknown): unknown {
  if (isObject(d) && d.intention === undefined && d.tag !== undefined) {
    const { tag, ...rest } = d;
    return { ...rest, intention: tag };
  }
  return d;
}

const isSession = (d: unknown): d is Session =>
  isActiveSession(d) &&
  isObject(d) &&
  isString(d.id) &&
  isString(d.endedAt) &&
  (d.status === 'completed' || d.status === 'failed');

/** Reads a versioned value. Never throws: bad data is logged and treated as missing. */
async function read(key: Key): Promise<unknown | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed) || parsed.schemaVersion !== SCHEMA_VERSION) {
      console.warn(`[storage] ignoring "${key}": unknown schema`);
      return null;
    }
    return parsed.data ?? null;
  } catch (e) {
    console.warn(`[storage] ignoring "${key}": unreadable`, e);
    return null;
  }
}

function write(key: Key, data: unknown): Promise<void> {
  return AsyncStorage.setItem(
    key,
    JSON.stringify({ schemaVersion: SCHEMA_VERSION, data }),
  );
}

export async function loadUser(): Promise<User | null> {
  const d = await read(KEYS.user);
  return isUser(d) ? d : null;
}

export function saveUser(u: User): Promise<void> {
  return write(KEYS.user, u);
}

export async function loadSettings(): Promise<Settings> {
  const d = await read(KEYS.settings);
  if (!isObject(d)) return { ...DEFAULT_SETTINGS };
  return {
    defaultDurationMin:
      typeof d.defaultDurationMin === 'number'
        ? d.defaultDurationMin
        : DEFAULT_SETTINGS.defaultDurationMin,
    sound: typeof d.sound === 'boolean' ? d.sound : DEFAULT_SETTINGS.sound,
    keepAwake:
      typeof d.keepAwake === 'boolean'
        ? d.keepAwake
        : DEFAULT_SETTINGS.keepAwake,
  };
}

export function saveSettings(s: Settings): Promise<void> {
  return write(KEYS.settings, s);
}

export async function loadSessions(): Promise<Session[]> {
  const d = await read(KEYS.sessions);
  if (!Array.isArray(d)) return [];
  const valid = d.map(migrateLegacyTag).filter(isSession);
  if (valid.length !== d.length) {
    console.warn(
      `[storage] dropped ${d.length - valid.length} invalid session(s)`,
    );
  }
  return valid;
}

export function saveSessions(s: Session[]): Promise<void> {
  return write(KEYS.sessions, s);
}

export async function loadActiveSession(): Promise<ActiveSession | null> {
  const d = migrateLegacyTag(await read(KEYS.activeSession));
  return isActiveSession(d) ? d : null;
}

export function saveActiveSession(a: ActiveSession | null): Promise<void> {
  return a === null
    ? AsyncStorage.removeItem(KEYS.activeSession)
    : write(KEYS.activeSession, a);
}

export function clearAll(): Promise<void> {
  return AsyncStorage.removeMany(Object.values(KEYS));
}
