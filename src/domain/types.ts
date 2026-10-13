export type Tag = 'work' | 'study' | 'reading' | 'other';

export const TAGS: { id: Tag; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'study', label: 'Study' },
  { id: 'reading', label: 'Reading' },
  { id: 'other', label: 'Other' },
];

export interface User {
  name: string;
  createdAt: string;
}

export interface Settings {
  defaultDurationMin: number;
  sound: boolean;
  keepAwake: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultDurationMin: 25,
  sound: true,
  keepAwake: true,
};

export type SessionStatus = 'completed' | 'failed';

export interface Session {
  id: string;
  startedAt: string;
  endedAt: string;
  plannedMin: number;
  tag: Tag;
  status: SessionStatus;
}

export interface ActiveSession {
  startedAt: string;
  plannedMin: number;
  tag: Tag;
}
