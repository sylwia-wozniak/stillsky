# Maestro vs Mobilewright

The same 8 Stillsky scenarios automated with both tools, on an iPhone 17 Pro simulator (iOS 26)
and a Pixel 9 emulator (Android 17). Timings and run conditions are in [BENCHMARKS.md](BENCHMARKS.md).

## At a glance

| | Maestro 2.0.10 | Mobilewright 0.0.66 |
|---|---|---|
| **Tests are written in** | YAML | TypeScript (Playwright-style API) |
| **Setup** | One CLI install | `npm install` per project; one-time helper agent on each iOS simulator |
| **Locators** | `id:` strings copied into YAML | Imports `src/testIds.ts`, so IDs can't drift from the app |
| **Suite time, iOS** | **7m 31s** | 8.7m |
| **Suite time, Android** | 10m 42s | **7.6m** |
| **Time per action, iOS** | ~1 s (estimated from flow times) | ~2 s per tap, ~4.7 s per text fill (measured) |
| **Waiting** | Automatic between steps | Automatic in actions and `expect()` |
| **Clean state per test** | `launchApp: clearState: true` | `device.clearAppData()` in a helper |
| **Permissions** | `permissions: { all: allow }` | Grant yourself (`adb shell pm grant` on Android) |
| **Horizontal lists** | `swipe: from: <element>` just works | Needed a custom helper (see challenges) |
| **Assertions** | visible / not visible / text / selected / checked / enabled | Same set, plus `toBeDisabled`, `toBeFocused`, soft asserts |
| **Runner features** | Tags, `runFlow`, `when: platform` | Projects per platform, retries, workers, HTML/JUnit reports, fixtures |
| **Debugging** | Screenshots and logs in `~/.maestro/tests/` | Error context, accessibility tree on failure, own timing code |
| **Maturity** | Established, large community | Very new (0.0.x), small community |

## The same step in both

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

Equally readable. Maestro needs no programming; Mobilewright gives you types, autocompletion
and shared helpers.

## Why Mobilewright is slower on iOS

Measured on an idle Mac:

| Operation (iOS) | Time |
|---|---:|
| Read the screen once (accessibility tree, 45 elements) | ~0.77 s |
| Tap (reads the screen twice to check the element stopped moving, then taps) | ~2.1 s |
| Fill a text field (tap, clear, type) | ~4.7 s |
| Clear app data / launch app | 0.5 s / 2.6 s |

On Android one screen read takes ~0.2 s, which is why Mobilewright is the faster tool there.
The iOS cost is fixed per read and doesn't depend on screen size. Turning simulator animations
off made no difference. A typical test does 15–25 actions, so iOS pays roughly 30–50 s of overhead
per test.

## Why Maestro is slower on Android

Before every tap, Maestro waits for the **whole screen** to stop changing. Mobilewright only
checks that the **element it's about to tap** has stopped moving. Stillsky's Focus screen has a
countdown that changes every second, and that's what exposes the difference.

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

The same Give-up tap takes 2.6 s with Maestro on iOS and an estimated 0.9 s with Mobilewright on Android (two 0.2 s reads plus the tap).

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
- **Mobilewright, both platforms:** it checks only the target element's position across two reads.
  The countdown elsewhere doesn't matter.

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
**76.8 s to 40.7 s** (Give up: 14.1 s → 2.7 s). The suite in `e2e/maestro/` still uses Maestro's
defaults, so the benchmark compares the tools out of the box.

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

## Which one when

- **Maestro:** quick smoke tests, people who don't code, the fastest iOS runs, simple flows.
- **Mobilewright:** TypeScript teams, tests that share code with the app (IDs, helpers), stricter
  assertions, Playwright-style reports and retries, and Android-heavy suites.
- **Both found the same app behaviour,** but Mobilewright's stricter interaction (no hidden
  keyboard) caught one bug that Maestro missed.

Next: the same scenarios in **Appium** to complete the comparison.
