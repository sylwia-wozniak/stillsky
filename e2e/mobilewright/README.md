# Mobilewright suite

The same 8 scenarios as the [Maestro flows](../maestro/), written with
[Mobilewright](https://github.com/mobile-next/mobilewright), a Playwright-style framework for
iOS and Android. Locators come straight from the app's [`src/testIds.ts`](../../src/testIds.ts),
so tests and app can't drift apart.

## Setup (once)

```bash
cd e2e/mobilewright
npm install
npx mobilewright doctor                      # checks Xcode, adb, emulators
npx mobilewright devices                     # lists booted simulators/emulators
npx mobilewright install -d <ios-device-id>  # installs the helper agent on an iOS simulator
```

Node 22.12+ is required. Android needs `adb` on your `PATH` (see the main README).

## Run

Start Metro and a debug build first (`npm start`, then `npm run ios` / `npm run android` in the
repo root). The tests use the debug-only 1-minute duration and Seed demo data.

```bash
npm run test:ios         # iPhone 17 Pro simulator
npm run test:android     # Pixel 9 emulator
npm test                 # both, one after the other
npx mobilewright test tests/05-settings.test.ts --project ios   # one file
npx mobilewright show-report                                    # after a run with --reporter html
```

From the repo root: `npm run e2e:mobilewright`, `npm run e2e:mobilewright:ios`,
`npm run e2e:mobilewright:android`.

## How it's set up

- [`mobilewright.config.ts`](mobilewright.config.ts): `ios` and `android` projects, one worker,
  150 s per test (some scenarios wait for a real 1-minute session), accessibility tree attached
  to failures.
- [`tests/helpers.ts`](tests/helpers.ts):
  - `freshStart()` clears app data before each test, like Maestro's `clearState`. On Android it
    re-grants the local-network permission that debug builds need to reach Metro.
  - `freshStartAndOnboard()` adds onboarding as "Ada".
  - `swipeUntilVisible()` drags a horizontal list until an item is fully on screen (see below).

## Things learned writing it

- `scrollIntoViewIfNeeded()` only scrolls vertically, and `locator.swipe()` is a fast fling that
  overshoots short lists. Horizontal lists need short, slow `screen.swipe()` drags.
- Visibility of items in a scroll view differs per platform: iOS reports off-screen items as
  visible, and Android reports a clipped item as a thin sliver. Compare bounding boxes instead.
- The suite found a real bug that the Maestro flow hid: with the keyboard open, the first tap on
  a duration chip only closed the keyboard (Maestro called `hideKeyboard` first).
