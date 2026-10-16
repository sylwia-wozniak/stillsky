# E2E benchmarks

How long the end-to-end suites take, per tool and platform, so Maestro, Appium and Mobilewright
can be compared on the same scenarios.

**When to update this file:** when the number of flows changes, when a tool covers the same
scenarios for the first time, or when the platform setup changes (Xcode, simulator, emulator
image). Replace the old numbers instead of adding rows, and don't update it for ordinary re-runs.

## Summary

| Platform | Tool | Version | Device | Flows | Passed | Total time | Avg / flow | Date |
|----------|------|---------|--------|------:|-------:|-----------:|-----------:|------|
| iOS 27.0 | Maestro¹ | 2.11.0 | iPhone 18 Pro (simulator) | 8 | 8 | 8m 4s | 1m 1s | 2026-10-16 |
| iOS 27.0 | Mobilewright | 0.0.66 | iPhone 18 Pro (simulator) | 8 | 8 | 9.3m | 1m 10s | 2026-10-16 |
| iOS 27.0 | Appium² | 3.8.0 | iPhone 18 Pro (simulator) | 8 | 8 | **6m 57s** | 52s | 2026-10-16 |
| Android 17 | Maestro¹ | 2.11.0 | Pixel 9 (emulator, API 37) | 8 | 8 | 9m 21s | 1m 10s | 2026-10-16 |
| Android 17 | Mobilewright³ | 0.0.66 | Pixel 9 (emulator, API 37) | 8 | 8 | **7.3m** | 55s | 2026-10-16 |
| Android 17 | Appium² | 3.8.0 | Pixel 9 (emulator, API 37) | 8 | 8 | 7m 32s | 57s | 2026-10-16 |

¹ Every `tapOn` sets `waitToSettleTimeoutMs: 500`, so a tap waits at most 0.5 s for the screen to
stop changing (see [COMPARISON.md](COMPARISON.md#why-maestro-is-slower-on-android)). On iOS, the
keyboard is closed with its Done key before tapping a button below a text field
(`common/hide-keyboard-ios.yaml`, see [COMPARISON.md](COMPARISON.md#maestro)).

² WebdriverIO 10 + Mocha, UiAutomator2 driver 8.7.0, XCUITest driver 12.18.1. Totals are whole
runs and include starting an Appium session for every spec (about 4 s on Android, 5 s on iOS);
per-scenario times below are the test bodies only.

³ Two earlier runs on the same setup failed one and two tests: Mobilewright read an empty
screen (`no XML content found in uiautomator dump`, or no matching element) while the emulator was
busy drawing in software (see Run conditions). The third run passed 8 of 8; its times are shown.

## Per scenario

Times are wall-clock per flow. The **fixed wait** column is real time the scenario has to wait
regardless of tool (a 1-minute focus session, or 70 s with the app killed). Subtract it to compare
tool overhead.

### iOS 27 (iPhone 18 Pro simulator)

| # | Scenario | Fixed wait | Maestro | Mobilewright | Appium |
|---|----------|-----------:|--------:|-------------:|-------:|
| 01 | Onboarding validates the name and is skipped on relaunch | — | 26s | 33.2s | 14.2s |
| 02 | Giving up asks for confirmation and makes the star fall | — | 31s | 34.7s | 13.6s |
| 03 | Completing a 1-minute session lights the first star | ~60s | 1m 25s | 1.6m | 1m 13s |
| 04 | Stats count completed and fallen stars per period | ~60s | 1m 37s | 1.9m | 1m 19s |
| 05 | Settings persist across relaunch and Reset needs exact confirmation | — | 50s | 1.1m | 30.7s |
| 06 | Seeded demo data fills Sky and Stats | — | 22s | 31.8s | 12.2s |
| 07 | A session that ended while the app was killed counts as completed | ~70s | 1m 34s | 1.6m | 1m 24s |
| 08 | A Give-up dialog left open when the session completes does not reappear | ~60s | 1m 20s | 1.4m | 1m 11s |
| | **Total** | **~4m 10s** | **8m 4s** | **9.3m** | **6m 57s** |

### Android 17 (Pixel 9 emulator)

| # | Scenario | Fixed wait | Maestro | Mobilewright | Appium |
|---|----------|-----------:|--------:|-------------:|-------:|
| 01 | Onboarding validates the name and is skipped on relaunch | — | 32s | 19.9s | 20.7s |
| 02 | Giving up asks for confirmation and makes the star fall | — | 42s | 25.8s | 24.6s |
| 03 | Completing a 1-minute session lights the first star | ~60s | 1m 34s | 1.3m | 1m 19s |
| 04 | Stats count completed and fallen stars per period | ~60s | 1m 52s | 1.5m | 1m 27s |
| 05 | Settings persist across relaunch and Reset needs exact confirmation | — | 1m 1s | 35.5s | 32.5s |
| 06 | Seeded demo data fills Sky and Stats | — | 29s | 17.7s | 17.0s |
| 07 | A session that ended while the app was killed counts as completed | ~70s | 1m 42s | 1.5m | 1m 31s |
| 08 | A Give-up dialog left open when the session completes does not reappear | ~60s | 1m 29s | 1.3m | 1m 17s |
| | **Total** | **~4m 10s** | **9m 21s** | **7.3m** | **7m 32s** |

Mobilewright reports times over a minute in tenths of a minute (1.6m ≈ 1m 36s).

## Notes: Maestro vs Mobilewright vs Appium

- **Speed:** Appium was fastest on iOS (6m 57s), and Mobilewright on Android (7.3m, just ahead of
  Appium's 7m 32s). Excluding the ~4m 10s of fixed waiting, the tool overhead is roughly:
  - iOS: Maestro 3m 54s, Mobilewright 5m 8s, Appium 2m 47s.
  - Android: Maestro 5m 11s, Mobilewright 3m 8s, Appium 3m 22s.
- **Why Appium is fast:** it taps as soon as an element exists, without Maestro's screen-settle
  wait or Mobilewright's element-stability check.
- **Why Mobilewright is slow on iOS:** every action reads the screen at least twice (~0.77 s per
  read), so a tap costs ~2 s. See [COMPARISON.md](COMPARISON.md#why-mobilewright-is-slower-on-ios).
- **Writing tests:** Mobilewright and Appium are TypeScript, so tests import the app's
  `src/testIds.ts` directly, and helpers are plain functions. Maestro YAML is shorter to read but
  IDs are copied by hand.
- **Horizontal lists:** Maestro's element `swipe` worked as is, and Appium's native drag commands
  worked first time. Mobilewright needed a custom helper: `scrollIntoViewIfNeeded()` is vertical
  only, `locator.swipe()` flings too far, and visibility of scroll-view items differs between iOS
  and Android.
- **Keyboard:** the Mobilewright run found a real bug (first chip tap only closed the Android
  keyboard) that the Maestro flow hid with `hideKeyboard`. On iOS 27, Maestro needs the keyboard
  closed before tapping a button below a text field.
- **Setup:** Mobilewright needs a one-time agent install on each iOS simulator
  (`npx mobilewright install`) and nothing on Android. Its `mobilecli` process can keep the
  Android emulator's automation busy afterwards, so stop it before running Maestro on the same
  emulator.

## Run conditions

Keep these the same when re-measuring, or note what differs.

- **Machine:** Mac with Apple M1 Max (10 cores, 64 GB), Xcode 27.0, Android emulator 37.2.12.
- **Devices:** iPhone 18 Pro simulator on iOS 27.0; Pixel 9 AVD on Android 17 (API 37, Google
  Play image). The API 37 image forces software rendering (SwiftShader), so the emulator draws on
  the CPU and gets slower while the app animates.
- **Build:** debug build with Metro running (needed for the 1-minute duration and Seed demo data).
- **State:** every flow starts from cleared app data.
- **One suite at a time, on a fresh setup:** before each tool/platform run, Metro is restarted with
  `--reset-cache`, leftover tool processes are stopped (Appium server, `mobilecli`), and only one
  device runs: the simulator for iOS, or a freshly booted emulator for Android, waited on until it
  settles. The run starts only when the Mac's CPU is at least 70% idle.
- **Commands:**
  ```bash
  maestro --device <ios-simulator-udid> test e2e/maestro
  maestro --device emulator-5554 test e2e/maestro
  cd e2e/appium && npm run test:ios                              # or test:android
  cd e2e/mobilewright && npx mobilewright test --project ios   # or --project android
  ```
  Set `MAESTRO_DRIVER_STARTUP_TIMEOUT=240000` on a freshly booted device, where Maestro's driver
  can take longer than its default to start.
- **What skewed earlier attempts:** right after a macOS update, Spotlight and Photos media
  analysis re-index for many hours; an emulator left running for hours (or one that had been
  force-killed) got slower until Appium's `adb shell dumpsys` calls hung, which wiping its data
  fixed; and a fresh iOS 27 simulator boot starts ~270 processes and keeps the disk busy for a
  long time. Measure only after these settle.
