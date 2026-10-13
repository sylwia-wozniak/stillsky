import { vi } from 'vitest';

// In-memory replacement for AsyncStorage so storage code runs under Node.
vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  const AsyncStorage = {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
    multiRemove: async (keys: string[]) => {
      keys.forEach(k => store.delete(k));
    },
    getAllKeys: async () => [...store.keys()],
    clear: async () => {
      store.clear();
    },
  };
  return { default: AsyncStorage };
});
