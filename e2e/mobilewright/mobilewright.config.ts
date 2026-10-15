import { defineConfig } from 'mobilewright';

// Runs against a debug build with Metro running (same as the Maestro suite), so the
// debug-only 1-minute duration and Seed demo data are available.
export default defineConfig({
  testDir: './tests',
  bundleId: 'com.stillsky',
  // Each test resets the app itself (see tests/helpers.ts), so skip the built-in relaunch.
  autoAppLaunch: false,
  timeout: 150_000, // some scenarios wait for a real 1-minute focus session
  workers: 1,
  reporter: 'list',
  viewTree: 'on-failure', // attach the accessibility tree to failed tests
  projects: [
    { name: 'ios', use: { platform: 'ios', deviceName: /^iPhone 17 Pro$/ } },
    { name: 'android', use: { platform: 'android', deviceName: /^Pixel 9$/ } },
  ],
});
