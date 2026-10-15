# Maestro vs Mobilewright vs Appium

The same 8 Stillsky scenarios automated with three tools, on an iPhone 17 Pro simulator (iOS 26)
and a Pixel 9 emulator (Android 17). Timings and run conditions are in [BENCHMARKS.md](BENCHMARKS.md).

## At a glance

| | Maestro 2.0.10 | Mobilewright 0.0.66 | Appium 3.8 + WebdriverIO 10 |
|---|---|---|---|
| **Tests are written in** | YAML | TypeScript (Playwright-style API) | TypeScript (any WebDriver language) |
| **Setup** | One CLI install | `npm install`; one-time agent on each iOS simulator | `npm install`, Appium drivers, WebDriverAgent build on first iOS run, capabilities |
| **Locators** | `id:` strings copied into YAML | Imports `src/testIds.ts` | Imports `src/testIds.ts`; selector differs per platform |
| **Suite time, iOS** | 7m 31s | 8.7m | **6m 44s** |
| **Suite time, Android** | 10m 42s (9m 14s tuned) | **7.6m** | **7m 34s** |
| **Time per action, iOS** | ~1 s (estimated) | ~2 s per tap, ~4.7 s per text fill (measured) | ~0.5 s (estimated from test times) |
| **Waits before a tap** | Whole screen to settle | Target element to stop moving | Only for the element to exist |
| **Clean state per test** | `launchApp: clearState: true` | `device.clearAppData()` | `mobile: clearApp` (Android); manual data wipe (iOS) |
| **Permissions** | `permissions: { all: allow }` | Grant yourself | `autoGrantPermissions` + grant after clearing data |
| **Horizontal lists** | `swipe` from an element just works | Needed a custom helper | Native drag commands worked first time |
| **Runner features** | Tags, `runFlow`, `when: platform` | Projects, retries, workers, reports, fixtures | Mocha/Jasmine/Cucumber, retries, many reporters, device clouds |
| **Debugging** | Screenshots and logs per run | Error context, accessibility tree on failure | Appium server log, Appium Inspector, screenshots on failure |
| **Maturity** | Established, large community | Very new (0.0.x), small community | Industry standard, largest community |

All three passed 8 of 8 on both platforms.

## The same step in all three

Give up a running session and confirm the dialog:

```yaml
# Maestro
- tapOn: { id: focus.giveUpButton }
- assertVisible: { id: dialog.message, text: "Your star will fall. Give up?" }
- tapOn: { id: dialog.confirmButton }
- assertVisible: { id: focus.startButton }
```

```ts
// Mobilewright
await screen.getByTestId(TID.focus.giveUpButton).tap();
await expect(screen.getByTestId(TID.dialog.message)).toHaveText('Your star will fall. Give up?');
await screen.getByTestId(TID.dialog.confirmButton).tap();
await expect(screen.getByTestId(TID.focus.startButton)).toBeVisible();
```

```ts
// Appium + WebdriverIO (el() picks the iOS or Android selector)
await el(TID.focus.giveUpButton).click();
await expect(el(TID.dialog.message)).toHaveText('Your star will fall. Give up?');
await el(TID.dialog.confirmButton).click();
await expect(el(TID.focus.startButton)).toBeDisplayed();
```

All equally readable. Maestro needs no programming; Mobilewright and Appium give you types,
autocompletion and shared helpers.

## Why Appium is fastest on iOS

Appium (through WebdriverIO) finds an element and taps it right away. It waits only until the
element exists; it doesn't check that the element has stopped moving (Mobilewright) or that the
whole screen has settled (Maestro). That makes each action cheap: test 01 does about 14 actions
plus an app launch and relaunch in **10 s on iOS**, compared with 21 s for Maestro and 23.8 s for
Mobilewright.

The trade-off is that a tap can land during an animation. That didn't cause any failures in our
runs, but on apps with long transitions you may need explicit waits.

## Why Mobilewright is slower on iOS

Measured on an idle Mac:

| Operation (iOS) | Time |
|---|---:|
| Read the screen once (accessibility tree, 45 elements) | ~0.77 s |
| Tap (reads the screen twice to check the element stopped moving, then taps) | ~2.1 s |
| Fill a text field (tap, clear, type) | ~4.7 s |
| Clear app data / launch app | 0.5 s / 2.6 s |

On Android one screen read takes ~0.2 s, which is why Mobilewright is fast there. The iOS cost is
fixed per read and doesn't depend on screen size. Turning simulator animations off made no
difference. A typical test does 15–25 actions, so iOS pays roughly 30–50 s of overhead per test.

## Why Maestro is slower on Android

Before every tap, Maestro waits for the **whole screen** to stop changing. Stillsky's Focus screen
has a countdown that changes every second, and that's what exposes it.

From the Maestro log of flow 02 on Android:

```
09:12:16.86  Tapping on element: Give up
             (nothing for 10.4 s: waiting for the screen to settle)
09:12:27.24  Refreshed element
09:12:27.24  Tapping at (540, 1769)
09:12:28.79  Something have changed in the UI judging by view hierarchy. Proceed.
```

| Maestro tap, Android | Time | What's on screen |
|---|---:|---|
| Give up | 14.1 s | countdown ticking |
| Start | 12.0 s | countdown starts after the tap |
| Name field | 8.4 s | keyboard sliding in, blinking cursor |
| Cancel in the dialog | 8.2 s | countdown ticking behind it |
| Duration chip | 2.7 s | nothing moving |

The same Give-up tap takes 2.6 s with Maestro on iOS and an estimated 0.9 s with Mobilewright on
Android (two 0.2 s reads plus the tap).

### Why it happens (from Maestro's source)

Both platforms call `waitForAppToSettle` before a tap, but they decide "settled" differently:

- **Android** ([`ScreenshotUtils.waitForAppToSettle`](https://github.com/mobile-dev-inc/maestro/blob/main/maestro-client/src/main/java/maestro/utils/ScreenshotUtils.kt)):
  - It reads the full screen tree (every element and all its text) up to 10 times, 200 ms apart,
    and stops as soon as two reads in a row are identical.
  - The countdown text changes every second, so two reads never match. All 10 attempts run (about
    10 seconds), then it taps anyway.
- **iOS** ([`IsScreenStaticHandler`](https://github.com/mobile-dev-inc/maestro/blob/main/maestro-ios-xctest-runner/maestro-driver-iosUITests/Routes/Handlers/ScreenDiffHandler.swift)):
  - It takes two screenshots right after each other, a few milliseconds apart, and compares their
    hashes.
  - A countdown that changes once a second is almost never caught between two screenshots that
    close together, so the screen counts as "static" within about 0.3 s.
- **Mobilewright** only checks the target element's position, and **Appium** doesn't wait at all,
  so the countdown elsewhere doesn't affect either of them.

This is about Maestro's design, not a bug in the app. Any screen with something constantly
changing (a timer, a progress animation, a video, a spinner) will slow Maestro's taps on Android.
The code links point to Maestro's current source; our runs used 2.0.10, and its logs show the
same ~10 s wait.

### The fix: `waitToSettleTimeoutMs`

`tapOn` accepts a limit on that wait:

```yaml
- tapOn: { id: focus.giveUpButton, waitToSettleTimeoutMs: 500 }
```

With a 500 ms limit on the four taps over the countdown screen, flow 02 on Android went from
**76.8 s to 40.7 s** (Give up: 14.1 s → 2.7 s). All flows in `e2e/maestro/` now use this
setting on every tap. Whole suite, all 8 flows passing:

| | iOS | Android |
|---|---:|---:|
| Maestro, default settings | 7m 31s | 10m 42s |
| Maestro, tuned (`waitToSettleTimeoutMs: 500`) | 7m 32s | **9m 14s** |
| Mobilewright, for reference | 8.7m | 7.6m |
| Appium, for reference | 6m 44s | 7m 34s |

Tuning saves 1m 28s on Android and nothing on iOS, where the settle check was already fast. Maestro
is still the slowest on Android because of its normal per-step cost there: 2.7–2.8 s measured for
a tap on a still screen.

## Challenges we hit

### Maestro

- **Driver gets stuck.** After a run was interrupted, the iOS driver returned HTTP 500 errors until
  the simulator was rebooted or the driver reinstalled.
- **First run on a new simulator** can time out while installing its driver
  (`MAESTRO_DRIVER_STARTUP_TIMEOUT=240000` helps).
- **No plain wait command.** A 70 s wait needs a trick (wait for an element that never appears,
  `optional: true`).
- **`clearState` also revokes permissions.** Android debug builds then show a local-network prompt,
  so every launch needs `permissions: { all: allow }`.
- **Slow taps on screens that keep changing (Android).** Each tap waits up to ~10 s for the
  screen to settle; `waitToSettleTimeoutMs` fixes it (see above).
- **`hideKeyboard` hid a real bug.** The flow closed the keyboard first, so it never noticed that a
  duration chip couldn't be tapped while the keyboard was open.

### Mobilewright

- **Horizontal scrolling needs custom code:**
  - `scrollIntoViewIfNeeded()` only scrolls vertically.
  - `locator.swipe()` is a fast fling that overshoots short lists.
  - iOS reports off-screen list items as "visible", while Android reports a clipped item as a
    thin sliver.
  - The fix, a short slow drag plus comparing positions, works but costs a few seconds per swipe.
    Faster drags were tried and overshoot the target.
- **Slow actions on iOS:** about 2 s per tap (see above).
- **Platform setup is manual:** an agent install on iOS simulators, and re-granting the Android
  permission after clearing data.
- **Leftover process:** its `mobilecli` helper can keep running and block Maestro on the same
  Android emulator (`pkill -f mobilecli`).
- **Young API:** some options are only documented in the type definitions.

### Appium

- **Version matching with Xcode.** The newest XCUITest driver (12.18.x) ships a WebDriverAgent that
  needs a newer Xcode than 26.0.1, and every iOS session failed with `xcodebuild failed with code
  65`. Pinning driver **12.13.2** fixed it. Expect to manage driver ↔ Xcode versions.
- **`~id` means different things per platform.** On iOS it's the testID; on Android it's the
  accessibility label, and the testID is the resource-id. A small `el()` helper picks the right
  selector.
- **No "clear app data" on iOS simulators.** Android has `mobile: clearApp`; on iOS the helper
  empties the app's data folder with `xcrun simctl`.
- **Waits are your job.** After clearing data, the debug app reloads its bundle from Metro and
  needed more than WebdriverIO's 5 s default, so the helper waits up to 30 s for the first screen.
  This made 7 of 8 Android tests fail until fixed.
- **Switch state differs per platform:** Android reports `checked`, iOS reports a value of `1`/`0`.
- **Most moving parts:** Appium server, two drivers, WebDriverAgent on iOS, a WebdriverIO config,
  and capabilities per platform. The WebdriverIO Appium service starts the server for you.

## Which one when

- **Maestro:** quick smoke tests, people who don't code, simple flows. Set
  `waitToSettleTimeoutMs` if your app has live timers or animations.
- **Mobilewright:** TypeScript teams that like Playwright, tests that share code with the app,
  strict "element must be stable" taps, and Android-heavy suites. Young, so expect rough edges.
- **Appium:** the industry standard. Fastest here on iOS and level with Mobilewright on Android,
  works with every device cloud and many languages, and has the biggest community. The cost is
  setup: more pieces, version matching, and writing your own waits.
- **All three found the same app behaviour,** but Mobilewright's stricter interaction (no hidden
  keyboard) caught one bug that Maestro missed.
