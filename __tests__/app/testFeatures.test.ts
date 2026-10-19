import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadWithDev(dev: boolean) {
  vi.stubGlobal('__DEV__', dev);
  vi.resetModules();
  return import('../../src/app/testFeatures');
}

describe('test features', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('are on in debug builds', async () => {
    const { testFeaturesEnabled } = await loadWithDev(true);
    expect(testFeaturesEnabled()).toBe(true);
  });

  it('are off in release builds until the e2e build turns them on', async () => {
    const { enableTestFeatures, testFeaturesEnabled } = await loadWithDev(false);
    expect(testFeaturesEnabled()).toBe(false);
    enableTestFeatures();
    expect(testFeaturesEnabled()).toBe(true);
  });
});
