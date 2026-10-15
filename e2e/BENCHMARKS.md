# E2E benchmarks

How long the end-to-end suites take, per tool and platform, so Maestro, Appium and Mobilewright
can be compared on the same scenarios.

**When to update this file:** only when the number of flows changes, or when a new tool
(Appium, Mobilewright) covers the same scenarios. Don't update it for ordinary re-runs.

## Summary

| Tool | Version | Platform | Device | Flows | Passed | Total time | Avg / flow | Date | Commit |
|------|---------|----------|--------|------:|-------:|-----------:|-----------:|------|--------|
| Maestro | 2.0.10 | iOS 26.0 | iPhone 17 Pro (simulator) | 8 | 8 | 7m 31s | 56s | 2026-10-14 | `5f5e4d3` |
| Maestro | 2.0.10 | Android 17 | Pixel 9 (emulator, API 37) | 8 | 8 | 10m 42s | 1m 20s | 2026-10-14 | `5f5e4d3` |
| Maestro, tuned¹ | 2.0.10 | iOS 26.0 | iPhone 17 Pro (simulator) | 8 | 8 | 7m 32s | 57s | 2026-10-15 | `05d3d15` |
| Maestro, tuned¹ | 2.0.10 | Android 17 | Pixel 9 (emulator, API 37) | 8 | 8 | 9m 14s | 1m 9s | 2026-10-15 | `05d3d15` |
| Appium | — | iOS | — | — | — | — | — | — | — |
| Appium | — | Android | — | — | — | — | — | — | — |
| Mobilewright | 0.0.66 | iOS 26.0 | iPhone 17 Pro (simulator) | 8 | 8 | 8.7m | 1m 5s | 2026-10-15 | `cd46444` |
| Mobilewright | 0.0.66 | Android 17 | Pixel 9 (emulator, API 37) | 8 | 8 | 7.6m | 57s | 2026-10-15 | `b2b3022` |

¹ Every `tapOn` sets `waitToSettleTimeoutMs: 500`, so a tap waits at most 0.5 s for the screen to
stop changing. This is what the flows in `e2e/maestro/` use now. The plain "Maestro" rows were
measured with Maestro's defaults (commit `5f5e4d3`); remove the option to reproduce them. See
[COMPARISON.md](COMPARISON.md#why-maestro-is-slower-on-android) for why it matters on Android.

## Per scenario

Times are wall-clock per flow. The **fixed wait** column is real time the scenario has to wait
regardless of tool (a 1-minute focus session, or 70 s with the app killed). Subtract it to compare
tool overhead.

| # | Scenario | Fixed wait | Maestro iOS | Maestro Android | Appium iOS | Appium Android | Mobilewright iOS | Mobilewright Android |
|---|----------|-----------:|------------:|----------------:|-----------:|---------------:|-----------------:|---------------------:|
| 01 | Onboarding validates the name and is skipped on relaunch | — | 21s | 29s | — | — | 23.8s | 20.6s |
| 02 | Giving up asks for confirmation and makes the star fall | — | 25s | 1m 18s | — | — | 31.7s | 29.6s |
| 03 | Completing a 1-minute session lights the first star | ~60s | 1m 21s | 1m 36s | — | — | 1.5m | 1.4m |
| 04 | Stats count completed and fallen stars per period | ~60s | 1m 33s | 2m 16s | — | — | 1.8m | 1.6m |
| 05 | Settings persist across relaunch and Reset needs exact confirmation | — | 46s | 1m 6s | — | — | 58.2s | 39.1s |
| 06 | Seeded demo data fills Sky and Stats | — | 19s | 33s | — | — | 28.5s | 19.4s |
| 07 | A session that ended while the app was killed counts as completed | ~70s | 1m 30s | 1m 43s | — | — | 1.6m | 1.5m |
| 08 | A Give-up dialog left open when the session completes does not reappear | ~60s | 1m 16s | 1m 41s | — | — | 1.4m | 1.3m |
| | **Total** | **~4m 10s** | **7m 31s** | **10m 42s** | — | — | **8.7m** | **7.6m** |

Mobilewright reports times over a minute in tenths of a minute (1.6m ≈ 1m 36s).

### Maestro: default vs tuned

| # | Scenario | Default iOS | Tuned iOS | Default Android | Tuned Android |
|---|----------|------------:|----------:|----------------:|--------------:|
| 01 | Onboarding | 21s | 20s | 29s | 28s |
| 02 | Give up with confirmation | 25s | 27s | 1m 18s | **41s** |
| 03 | 1-minute session lights a star | 1m 21s | 1m 22s | 1m 36s | 1m 33s |
| 04 | Stats | 1m 33s | 1m 33s | 2m 16s | **1m 53s** |
| 05 | Settings and Reset | 46s | 45s | 1m 6s | 59s |
| 06 | Demo data | 19s | 19s | 33s | 30s |
| 07 | Session ends while app is killed | 1m 30s | 1m 29s | 1m 43s | 1m 41s |
| 08 | Stale Give-up dialog | 1m 16s | 1m 17s | 1m 41s | 1m 29s |
| | **Total** | **7m 31s** | **7m 32s** | **10m 42s** | **9m 14s** |

The tuning only matters where taps happen on a screen that keeps changing (the countdown in 02,
04 and 08). iOS is unchanged because its settle check was already fast.

## Notes: Maestro vs Mobilewright

- **Speed:** Mobilewright was faster on Android (7.6m vs 10m 42s default, 9m 14s tuned) and slower on iOS
  (8.7m vs 7m 31s). Excluding the ~4m 10s of fixed waiting, the tool overhead is roughly
  Maestro 3m 21s / Mobilewright 4m 30s on iOS, and Maestro 6m 32s / Mobilewright 3m 26s on Android.
  On iOS every Mobilewright action reads the screen at least twice (~0.77 s per read), so a tap
  costs ~2 s. See [COMPARISON.md](COMPARISON.md).
- **Writing tests:** Mobilewright is TypeScript, so tests import the app's `src/testIds.ts`
  directly, and helpers are plain functions. Maestro YAML is shorter to read but IDs are copied
  by hand.
- **Horizontal lists:** Maestro's element `swipe` worked as is. Mobilewright needed a custom helper:
  `scrollIntoViewIfNeeded()` is vertical only, `locator.swipe()` flings too far, and visibility of
  scroll-view items differs between iOS and Android.
- **Keyboard:** the Mobilewright run found a real bug (first chip tap only closed the Android
  keyboard) that the Maestro flow hid with `hideKeyboard`.
- **Setup:** Mobilewright needs a one-time agent install on iOS simulators
  (`npx mobilewright install`) and nothing on Android. Its `mobilecli` process can keep the
  Android emulator's automation busy afterwards, so stop it before running Maestro on the same
  emulator.

## Run conditions

Keep these the same when adding a new tool, or note what differs.

- **Machine:** Mac with Apple M1 Max, Xcode 26.0.1, Android Studio emulator.
- **Build:** debug build with Metro running (needed for the 1-minute duration and Seed demo data).
- **State:** every flow starts from cleared app data; the suite runs one platform at a time.
- **Commands:**
  ```bash
  maestro --device <ios-simulator-udid> test e2e/maestro
  maestro --device emulator-5554 test e2e/maestro
  cd e2e/mobilewright && npx mobilewright test --project ios   # or --project android
  ```
- Run while the Mac is otherwise idle. A loaded machine (high load average) makes simulator
  automation slow and flaky, which skews these numbers.
