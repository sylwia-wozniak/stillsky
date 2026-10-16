# Maestro vs Mobilewright vs Appium

The same 8 Stillsky scenarios automated with three tools, on an iPhone 18 Pro simulator (iOS 27)
and a Pixel 9 emulator (Android 17). Timings and run conditions are in [BENCHMARKS.md](BENCHMARKS.md).

## At a glance

| | Maestro 2.11.0 | Mobilewright 0.0.66 | Appium 3.8 + WebdriverIO 10 |
|---|---|---|---|
| **Tests are written in** | YAML | TypeScript (Playwright-style API) | TypeScript (any WebDriver language) |
| **Setup** | One CLI install | `npm install`; one-time agent on each iOS simulator | `npm install`, Appium drivers, WebDriverAgent build on first iOS run, capabilities |
| **Locators** | `id:` strings copied into YAML | Imports `src/testIds.ts` | Imports `src/testIds.ts`; selector differs per platform |
| **Suite time, iOS** | 8m 4s | 9.3m | **6m 57s** |
| **Suite time, Android** | 9m 21s | **7.3m** | 7m 32s |
| **Tap on a still screen** (iOS / Android) | 1.4 s / 2.2 s | 2.2 s / 0.8 s | ~0.5 s (estimated from test times) |
| **Code for the 8 scenarios** | 204 lines of YAML | 248 lines of TypeScript | 279 lines of TypeScript |
| **Installed size** | ~345 MB CLI (Java) | 73 MB, 94 npm packages | 379 MB, ~1,300 npm packages (incl. both drivers) |
| **Waits before a tap** | Whole screen to settle | Target element to stop moving | Only for the element to exist |
| **Clean state per test** | `launchApp: clearState: true` | `device.clearAppData()` | `mobile: clearApp` (Android); manual data wipe (iOS) |
| **Permissions** | `permissions: { all: allow }` | Grant yourself | `autoGrantPermissions` + grant after clearing data |
| **Horizontal lists** | `swipe` from an element just works | Needed a custom helper | Native drag commands worked first time |
| **Runner features** | Tags, `runFlow`, `when: platform` | Projects, retries, workers, reports, fixtures | Mocha/Jasmine/Cucumber, retries, many reporters, device clouds |
| **Debugging** | Screenshots and logs per run | Error context, accessibility tree on failure | Appium server log, Appium Inspector, screenshots on failure |
| **Maturity** | Established, large community | Very new (0.0.x), small community | Industry standard, largest community |

Lines of code count non-blank, non-comment lines, including helpers and config. Tap times were
measured on 2026-10-16; Appium's is an estimate from its test times. All three passed 8 of 8 on
both platforms.

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
plus an app launch and relaunch in **14 s on iOS**, compared with 26 s for Maestro and 33 s for
Mobilewright.

The trade-off is that a tap can land during an animation. That didn't cause any failures in our
runs, but on apps with long transitions you may need explicit waits.

## Why Mobilewright is slower on iOS

Every Mobilewright action reads the whole screen (the accessibility tree) at least twice to check
that the element has stopped moving. On iOS one read is four times slower than on Android:

| Operation | iOS 27 | Android 17 |
|---|---:|---:|
| Read the screen once | 0.83 s | 0.2 s |
| Tap a button | 2.2 s | 0.8 s |
| Fill a text field (tap, clear, type) | 4.8 s | 1.2 s |
| Clear app data | 0.65 s | 0.19 s |
| Launch the app after clearing data (debug build loads its bundle from Metro) | 8.8 s | 5.0 s |

So the same test is about twice as fast on Android. On iOS, Mobilewright spends about 18 s more per
test than Appium (2m 21s over the 8 tests).

## Why Maestro is slower on Android

Before every tap, Maestro waits for the **whole screen** to stop changing. Stillsky's Focus screen
has a countdown that changes every second, and that's what exposes it.

From the Maestro log of flow 02 on Android, without a settle limit:

```
19:51:48.640  Tapping on element: Give up
              (nothing for 10.4 s: waiting for the screen to settle)
19:51:59.027  Tap aimed via settled hierarchy
19:51:59.027  Tapping at (540, 1769)
19:52:00.346  Something has changed in the UI judging by view hierarchy. Proceed.
```

| Maestro tap, Android | Default | `waitToSettleTimeoutMs: 500` | What's on screen |
|---|---:|---:|---|
| Start | 11.9 s | 2.6 s | countdown starts after the tap |
| Give up | 12.3 s | 2.9 s | countdown ticking |
| Cancel in the dialog | 14.0 s | 3.7 s | countdown ticking behind it |
| Duration chip | 2.5 s | 2.3 s | nothing moving |

For comparison, Mobilewright taps in 0.8 s on Android: it reads the screen twice (0.2 s each) and
only checks the button itself.

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
Measured with Maestro 2.11.0.

### The fix: `waitToSettleTimeoutMs`

`tapOn` accepts a limit on that wait:

```yaml
- tapOn: { id: focus.giveUpButton, waitToSettleTimeoutMs: 500 }
```

With a 500 ms limit on every tap, flow 02 on Android went from **79 s to 45 s** (Give up:
12.3 s → 2.9 s). All flows in
`e2e/maestro/` use this setting on every tap, and the timings in [BENCHMARKS.md](BENCHMARKS.md)
include it. It makes no difference on iOS, where the settle check is already fast. Maestro is still
the slowest on Android (9m 21s) because of its normal per-step cost there: about 2.2 s for a tap on
a still screen, against 1.4 s on iOS.

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
- **Taps below a text field miss on iOS 27.** With the keyboard open, Maestro's iOS driver (2.11.0)
  can read the layout from before the keyboard moved it. A tap aimed at Begin landed on
  the "t" key instead (the name became "Adat"), and 5 of 8 flows failed. `hideKeyboard` doesn't help:
  on iOS 27 it fails with "Couldn't hide the keyboard". The flows now press the keyboard's Done key
  first (`common/hide-keyboard-ios.yaml`), on iOS only.
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

- **Version matching with Xcode.** Each XCUITest driver release ships a WebDriverAgent built for
  a range of Xcode versions. 12.18.1 works on Xcode 27, but on an older Xcode every iOS session
  fails with `xcodebuild failed with code 65` until you pin an older driver (see the
  [Appium README](appium/README.md)). Expect to manage driver ↔ Xcode versions.
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
- **Appium:** the industry standard. Fastest here on iOS and close behind Mobilewright on Android,
  works with every device cloud and many languages, and has the biggest community. The cost is
  setup: more pieces, version matching, and writing your own waits.
- **All three found the same app behaviour,** but Mobilewright's stricter interaction (no hidden
  keyboard) caught one bug that Maestro missed.
