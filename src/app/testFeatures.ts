/**
 * Helpers for testing: the 1-minute focus duration and "Seed demo data".
 * On in debug builds and in the Android `e2e` build, a release build (JavaScript bundled in, no
 * Metro) that the E2E suites run against.
 */
let enabled = __DEV__;

export function testFeaturesEnabled(): boolean {
  return enabled;
}

/** Called at startup when the native side passes the `e2e` launch prop. */
export function enableTestFeatures(): void {
  enabled = true;
}
