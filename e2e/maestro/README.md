# Maestro smoke flows

Quick end-to-end checks that drive Stillsky by testID. They run against a **debug** build
(they use the 1-minute duration and Seed demo data helpers), so Metro must be running.

```bash
npm start                              # Metro
npm run ios                            # or: npm run android
maestro test e2e/maestro               # all flows
maestro test e2e/maestro --include-tags smoke   # fast ones only (~1 min)
maestro test e2e/maestro/05-settings.yaml       # one flow
```

| Flow | Covers | Tags |
|------|--------|------|
| 01-onboarding | name validation, onboarding skipped after relaunch | smoke |
| 02-focus-give-up | start, cancel / confirm give-up, tab bar hidden | smoke |
| 03-focus-complete-and-sky | 1-min session completes, star + constellation card | slow |
| 04-stats | completed vs fallen counts, success rate, bars per period | slow |
| 05-settings | rename, default duration, toggles persist, Reset confirmation | smoke |
| 06-demo-data | seeded data fills Sky and Stats | smoke, debug-only |
| 07-restore-after-kill | session finishing while app is killed is counted | slow |
| 08-give-up-dialog-not-stale | dialog left open at completion doesn't reappear next session | slow |

`common/` holds subflows used via `runFlow` (fresh start + onboarding, a 70 s wait).
The same scenarios are good candidates to rewrite in Appium and Mobilewright.
