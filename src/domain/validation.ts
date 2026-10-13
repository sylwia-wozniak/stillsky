export const NAME_MAX_LENGTH = 20;

export type NameResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateName(raw: string): NameResult {
  const value = raw.trim();
  // Count code points so an emoji counts as one character, like the user sees it.
  const length = Array.from(value).length;
  if (length === 0) {
    return { ok: false, error: 'Please enter a name' };
  }
  if (length > NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Name must be at most ${NAME_MAX_LENGTH} characters`,
    };
  }
  return { ok: true, value };
}

const RELEASE_DURATIONS = Array.from({ length: 23 }, (_, i) => 10 + i * 5);

export function durationOptions(dev: boolean): number[] {
  return dev ? [1, ...RELEASE_DURATIONS] : [...RELEASE_DURATIONS];
}

export function isValidDuration(min: number, dev: boolean): boolean {
  return durationOptions(dev).includes(min);
}
