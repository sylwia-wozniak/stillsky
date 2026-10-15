import { shared } from './wdio.shared.conf';

export const config: WebdriverIO.Config = {
  ...shared,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:udid': 'emulator-5554',
      'appium:appPackage': 'com.stillsky',
      'appium:appActivity': '.MainActivity',
      'appium:noReset': true, // tests reset app data themselves (see test/helpers.ts)
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
    },
  ],
} as WebdriverIO.Config;
