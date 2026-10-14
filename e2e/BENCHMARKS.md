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
| Appium | — | iOS | — | — | — | — | — | — | — |
| Appium | — | Android | — | — | — | — | — | — | — |
| Mobilewright | — | iOS | — | — | — | — | — | — | — |
| Mobilewright | — | Android | — | — | — | — | — | — | — |

## Per scenario

Times are wall-clock per flow. The **fixed wait** column is real time the scenario has to wait
regardless of tool (a 1-minute focus session, or 70 s with the app killed). Subtract it to compare
tool overhead.

| # | Scenario | Fixed wait | Maestro iOS | Maestro Android | Appium iOS | Appium Android | Mobilewright iOS | Mobilewright Android |
|---|----------|-----------:|------------:|----------------:|-----------:|---------------:|-----------------:|---------------------:|
| 01 | Onboarding validates the name and is skipped on relaunch | — | 21s | 29s | — | — | — | — |
| 02 | Giving up asks for confirmation and makes the star fall | — | 25s | 1m 18s | — | — | — | — |
| 03 | Completing a 1-minute session lights the first star | ~60s | 1m 21s | 1m 36s | — | — | — | — |
| 04 | Stats count completed and fallen stars per period | ~60s | 1m 33s | 2m 16s | — | — | — | — |
| 05 | Settings persist across relaunch and Reset needs exact confirmation | — | 46s | 1m 6s | — | — | — | — |
| 06 | Seeded demo data fills Sky and Stats | — | 19s | 33s | — | — | — | — |
| 07 | A session that ended while the app was killed counts as completed | ~70s | 1m 30s | 1m 43s | — | — | — | — |
| 08 | A Give-up dialog left open when the session completes does not reappear | ~60s | 1m 16s | 1m 41s | — | — | — | — |
| | **Total** | **~4m 10s** | **7m 31s** | **10m 42s** | — | — | — | — |

## Run conditions

Keep these the same when adding a new tool, or note what differs.

- **Machine:** Mac with Apple M1 Max, Xcode 26.0.1, Android Studio emulator.
- **Build:** debug build with Metro running (needed for the 1-minute duration and Seed demo data).
- **State:** every flow starts from cleared app data; the suite runs one platform at a time.
- **Commands:**
  ```bash
  maestro --device <ios-simulator-udid> test e2e/maestro
  maestro --device emulator-5554 test e2e/maestro
  ```
- Run while the Mac is otherwise idle. A loaded machine (high load average) makes simulator
  automation slow and flaky, which skews these numbers.
