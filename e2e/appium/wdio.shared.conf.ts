// Shared WebdriverIO settings. Platform configs add capabilities.
// Runs against the Android test build (npm run android:e2e) or an iOS debug build with Metro.
export const shared: Partial<WebdriverIO.Config> = {
  runner: 'local',
  specs: ['./test/specs/**/*.ts'],
  maxInstances: 1,
  logLevel: 'warn',
  bail: 0,
  waitforTimeout: 5000, // like Mobilewright's default
  connectionRetryTimeout: 300_000, // first iOS run builds WebDriverAgent, which can take minutes
  connectionRetryCount: 1,
  services: [['appium', { args: { address: '127.0.0.1', port: 4723 }, logPath: './logs' }]],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 180_000 }, // some scenarios wait for a real 1-minute session
  // Save a screenshot of every failed test to logs/.
  afterTest: async (test, _context, { passed }) => {
    if (!passed) {
      const name = `${test.parent} ${test.title}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      await browser.saveScreenshot(`./logs/failed-${name}.png`).catch(() => {});
    }
  },
};
