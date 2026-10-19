# Maestro smoke flows

Quick end-to-end checks that drive Stillsky by testID. They run against the **test build**
(it has the 1-minute duration and Seed demo data helpers, and needs no Metro; see the main README).
A debug build with Metro running works too.

**iOS 27:** with the keyboard open, Maestro's iOS driver (2.11.0) can read the layout
from before the keyboard moved it, so a tap aimed at Begin lands on a key (it typed "Adat") and
the flow fails. `common/hide-keyboard-ios.yaml` closes the keyboard on iOS before each tap that
follows typing. It presses the keyboard's Done key, because `hideKeyboard` fails on iOS 27
("Couldn't hide the keyboard").

```bash
npm run ios:e2e                        # or: npm run emulator, then npm run android:e2e
npm run e2e:maestro:ios                # all flows; or e2e:maestro:android
npm run e2e:maestro:smoke:ios          # fast ones only (~2–3 min)
maestro --platform ios test e2e/maestro/05-settings.yaml   # one flow
```

| Flow | Covers | Tags |
|------|--------|------|
| 01-onboarding | name validation, onboarding skipped after relaunch | smoke |
| 02-focus-give-up | start, cancel / confirm give-up, tab bar hidden | smoke |
| 03-focus-complete-and-sky | 1-min session completes, star + constellation card | slow |
| 04-stats | completed vs fallen counts, success rate, bars per period | slow |
| 05-settings | rename, default duration, toggles persist, Reset confirmation | smoke |
| 06-demo-data | seeded data fills Sky and Stats | smoke, test builds only |
| 07-restore-after-kill | session finishing while app is killed is counted | slow |
| 08-give-up-dialog-not-stale | dialog left open at completion doesn't reappear next session | slow |

`common/` holds subflows used via `runFlow` (fresh start + onboarding, a 70 s wait).
The same scenarios are also written in [Mobilewright](../mobilewright/) and [Appium](../appium/).
