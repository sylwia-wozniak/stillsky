import { shared } from './wdio.shared.conf';

export const config: WebdriverIO.Config = {
  ...shared,
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': 'iPhone 17 Pro',
      'appium:platformVersion': '26.0',
      'appium:bundleId': 'com.stillsky',
      'appium:noReset': true, // tests reset app data themselves (see test/helpers.ts)
      'appium:newCommandTimeout': 240,
      'appium:wdaLaunchTimeout': 300_000,
    },
  ],
} as WebdriverIO.Config;
