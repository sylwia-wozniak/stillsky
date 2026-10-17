# Appium suite

The same 8 scenarios as the [Maestro flows](../maestro/) and the [Mobilewright suite](../mobilewright/),
written with **Appium 3** and **WebdriverIO 10** (Mocha, TypeScript). Locators come from the app's
[`src/testIds.ts`](../../src/testIds.ts).

## Setup (once)

```bash
cd e2e/appium
npm install
```

Appium and both drivers (UiAutomator2, XCUITest) are npm dependencies of this folder, so
`npm install` installs them; there's no global install and no `appium driver install` step.
Check with `npx appium driver list --installed`.

### Xcode version

The suite runs on Xcode 27.0 with the iOS 27.0 simulator runtime and XCUITest driver 12.18.1.
Create the simulator once if you don't have it:

```bash
xcrun simctl create "iPhone 18 Pro" com.apple.CoreSimulator.SimDeviceType.iPhone-18-Pro \
  com.apple.CoreSimulator.SimRuntime.iOS-27-0
```

On Xcode 26.0.1, driver 12.18.x fails with `xcodebuild failed with code 65`: its WebDriverAgent
links `lib_TestingInterop.dylib`, which 26.0.1 doesn't have. Pin driver **12.13.2** (WebDriverAgent
16.12.10) there instead: `npm install -D appium-xcuitest-driver@12.13.2`.

## Run

Start Metro and a debug build first (`npm start`, then `npm run ios` / `npm run android` in the
repo root). The tests use the debug-only 1-minute duration and Seed demo data.

```bash
npm run test:ios         # iPhone 18 Pro simulator (iOS 27)
npm run test:android     # emulator-5554 (Pixel 9)
npx wdio run ./wdio.ios.conf.ts --spec ./test/specs/05-settings.ts   # one spec
```

From the repo root: `npm run e2e:appium:ios`, `npm run e2e:appium:android`. The WebdriverIO
Appium service starts and stops the Appium server; its log goes to `logs/`.

## How it's set up

- `wdio.shared.conf.ts` holds the common settings; `wdio.ios.conf.ts` and `wdio.android.conf.ts`
  add the capabilities. One session per spec file.
- [`test/helpers.ts`](test/helpers.ts):
  - `el(testId)` picks the right selector per platform. iOS exposes a testID as the accessibility
    id (`~id`). On Android `~` matches the accessibility label, and the testID is the resource-id,
    so it uses `android=new UiSelector().resourceId("…")`.
  - `freshStart()` resets app data before each test: `mobile: clearApp` on Android (plus
    re-granting the debug local-network permission), and emptying the app's data folder with
    `xcrun simctl` on iOS, because Appium has no "clear data" command for iOS simulators.
  - `swipeUntilVisible()` drags the horizontal duration picker with short, slow drags
    (`mobile: dragGesture` / `mobile: dragFromToForDuration`) until an item is fully on screen.
  - `isSwitchOn()` reads a switch: Android reports `checked`, iOS reports the value `1`/`0`.
