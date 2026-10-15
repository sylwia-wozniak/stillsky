# Appium suite

The same 8 scenarios as the [Maestro flows](../maestro/) and the [Mobilewright suite](../mobilewright/),
written with **Appium 3** and **WebdriverIO 10** (Mocha, TypeScript). Locators come from the app's
[`src/testIds.ts`](../../src/testIds.ts).

## Setup (once)

```bash
cd e2e/appium
npm install
npx appium driver install uiautomator2
npx appium driver install xcuitest@12.13.2   # see "Xcode version" below
```

Appium and its drivers live in this folder (`npx appium`), not globally.

### Xcode version

The latest XCUITest driver (12.18.x) ships a WebDriverAgent that needs a newer Xcode than 26.0.1
(it links `lib_TestingInterop.dylib`, which 26.0.1 doesn't have), and the session fails with
`xcodebuild failed with code 65`. Driver **12.13.2** pins WebDriverAgent 16.12.10, the last version
that builds with Xcode 26.0.1. After updating Xcode you can move to the latest driver.

## Run

Start Metro and a debug build first (`npm start`, then `npm run ios` / `npm run android` in the
repo root). The tests use the debug-only 1-minute duration and Seed demo data.

```bash
npm run test:ios         # iPhone 17 Pro simulator
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
