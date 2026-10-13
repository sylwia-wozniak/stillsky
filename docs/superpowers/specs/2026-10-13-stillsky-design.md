# Stillsky — Design Spec

Date: 2026-10-13
Status: Draft for review

## 1. Purpose

Stillsky is a personal focus-timer app inspired by Forest (forestapp.cc), re-themed around a night sky:
each successful focus session lights a star; stars fill constellations; quitting early makes the star fall.

It has two goals:
1. A small, pleasant app for personal use.
2. A realistic practice target for future end-to-end tests with **Appium** and **Mobilewright** on
   **both iOS and Android**. Testability is a first-class requirement.

### Out of scope (v1)
- Paid plans, accounts, login, backend, sync. All data is local to the device.
- Session history list, custom tags, notifications, "strict mode" (failing on app background).
- The E2E test suites themselves (Appium / Mobilewright) — the app is only made ready for them.

## 2. Tech stack

- **React Native CLI** (bare, no Expo), **TypeScript**, `ios/` and `android/` folders committed.
- Navigation: **React Navigation** (native stack + bottom tabs).
- Storage: `@react-native-async-storage/async-storage`.
- Graphics/animation: `react-native-svg`, `react-native-reanimated`.
- Keep-awake: `@sayem314/react-native-keep-awake` (maintained fork of `react-native-keep-awake`). Chime: `react-native-sound`.
- Charts: hand-made SVG bar chart (no chart library).
- Unit tests: **Vitest** for pure TS (`src/domain`, `src/storage`); the RN template's Jest setup is removed. Metro stays the app bundler (Vite cannot bundle React Native).
- Targets: iOS Simulator (Xcode, already installed) and Android Emulator (Android Studio + SDK
  must be installed; `adb` currently not on PATH).

## 3. Project structure

```
Stillsky/
├── android/  ios/
├── src/
│   ├── app/            RootNavigator: Onboarding stack vs MainTabs
│   ├── screens/        OnboardingScreen, FocusScreen, SkyScreen, StatsScreen, SettingsScreen
│   ├── components/     Star, SkyCanvas, BarChart, DurationPicker, TagChips, ConfirmDialog, Toast
│   ├── domain/         pure TS, no React
│   │   ├── timer.ts            session state machine + remaining-time calculation
│   │   ├── constellations.ts   constellation definitions + lit-star mapping
│   │   ├── stats.ts            aggregation per day/week/month, tag breakdown
│   │   └── validation.ts       name and duration validation
│   ├── storage/        typed AsyncStorage wrapper with defaults + schemaVersion
│   ├── state/          AppProvider (React Context): user, settings, sessions, activeSession
│   ├── theme/          night-sky palette, typography, spacing
│   └── testIds.ts      single source of truth for every testID
└── __tests__/          Vitest tests for src/domain and src/storage
```

Rule: screens and components contain no business logic; all rules live in `domain/` and are unit-tested.

## 4. Screens & behavior

Navigation: if no user is stored → Onboarding. Otherwise → bottom tabs **Focus · Sky · Stats · Settings**.

### 4.1 Onboarding (first launch only)
- Welcome copy over starry background, prompt "What should we call you?", name input, **Begin** button.
- Name valid when trimmed length is 1–20. While invalid, Begin is disabled and a hint is shown.
- On Begin: save `User`, save default `Settings`, navigate to MainTabs (onboarding removed from back stack).

### 4.2 Focus
States:
- **Idle**: greeting ("Good evening, {name}" — morning/afternoon/evening by local hour), dim star,
  duration picker (10–120 min, 5-min steps, initial value = `settings.defaultDurationMin`),
  intention chips (Work / Study / Reading / Other, default Work), **Start** button.
- **Running**: `MM:SS` countdown, star brightness interpolates 0→1 with progress, **Give up** button.
  Bottom tabs hidden. Keep-awake active if `settings.keepAwake`.
- **Give up** → ConfirmDialog "Your star will fall. Give up?" [Cancel] [Give up].
  Confirm → falling-star animation, session saved with `status: 'failed'`, return to Idle.
- **Completed** (remaining reaches 0) → star flash, message "You earned a star ✨", chime if
  `settings.sound`, session saved `status: 'completed'`, buttons **View in sky** (→ Sky tab) and **Done** (→ Idle).
- Backgrounding the app does not fail the session; remaining time is always computed from `startedAt`.
- **Debug builds only** (`__DEV__`): duration picker additionally offers **1 min**.

### 4.3 Sky
- Full-screen SVG night sky. Lit star count = number of completed sessions.
- Stars are assigned to constellations in a fixed order (8 constellations, e.g. Little Dipper (7),
  Cassiopeia (5), Orion (7), Big Dipper (7), Cygnus (5), Lyra (4), Leo (6), Scorpius (8)). After all
  are complete, extra stars appear as scattered background stars.
- A completed constellation shows connecting lines and its name.
- Tapping a constellation opens a card: name, `lit/total` stars, completion date (date of the session
  that lit its last star) or "In progress".
- Empty state: "Complete a focus session to light your first star".

### 4.4 Stats
- Segmented control **Day / Week / Month** (current calendar day, current ISO week, current month; local time).
- Tiles: total focus time (completed sessions only), completed count, fallen count, success rate
  (completed / (completed + failed), shown as "—" when no sessions).
- Bar chart of completed focus minutes: per hour (Day, 24 bars), per weekday (Week, 7 bars),
  per day of month (Month, 28–31 bars). A session is bucketed by its `startedAt`.
- Intention breakdown: minutes per intention for the period.
- Empty state when the period has no sessions.

### 4.5 Settings
- Name (edit, same validation as onboarding).
- Default duration (10–120, 5-min steps).
- Sound toggle (default on). Keep-awake toggle (default on).
- **Reset all data** → dialog requiring the user to type `RESET`; confirm button disabled until it
  matches exactly. Confirm clears all storage keys and navigates to Onboarding.
- **Debug builds only**: **Seed demo data** button — generates ~30 days of random sessions
  (mixed tags, ~80% completed) replacing existing sessions.
- App version (from native build) at bottom.

## 5. Data model

AsyncStorage keys, each a JSON value wrapped as `{ schemaVersion: 1, data: ... }`:

```ts
type Intention = 'work' | 'study' | 'reading' | 'other';

// key: "user"
interface User { name: string; createdAt: string /* ISO */ }

// key: "settings"
interface Settings { defaultDurationMin: number; sound: boolean; keepAwake: boolean }
// defaults: { defaultDurationMin: 25, sound: true, keepAwake: true }

// key: "sessions"
interface Session {
  id: string; startedAt: string; endedAt: string;
  plannedMin: number; intention: Intention; status: 'completed' | 'failed';
}

// key: "activeSession" (absent when idle)
interface ActiveSession { startedAt: string; plannedMin: number; intention: Intention }
```

- Lit stars and all stats are **derived** from `sessions`; nothing derived is stored.
- On app start, if `activeSession` exists: if `now >= startedAt + plannedMin` it is recorded as
  completed (endedAt = planned end) and cleared; otherwise Focus resumes in Running state.

## 6. Error handling

- Unreadable/corrupt JSON or unknown `schemaVersion` for a key → use defaults for that key, `console.warn`, never crash.
- Failed writes → Toast "Couldn't save, please try again"; in-memory state retained.
- Validation in `domain/validation.ts`, used by both UI and tests.

## 7. Testability requirements

- Every interactive or asserted element has a `testID` **and** an `accessibilityLabel`.
- All testIDs are defined in `src/testIds.ts`; components never use string literals for testIDs.
- Naming: `screen.element`, e.g. `onboarding.nameInput`, `onboarding.beginButton`,
  `focus.startButton`, `focus.giveUpButton`, `focus.timerText`, `focus.duration.25`, `focus.intention.study`,
  `dialog.confirmButton`, `dialog.cancelButton`, `sky.constellation.orion`, `sky.emptyState`,
  `stats.period.week`, `stats.totalTime`, `stats.bar.3`, `settings.soundToggle`,
  `settings.resetButton`, `settings.resetInput`, `tabs.focus`, etc.
- Verify on both platforms (Appium Inspector or `uiautomator dump` / Xcode accessibility inspector) that
  testIDs are exposed: Android as `resource-id`, iOS as accessibility identifier.
- Asserted values (timer, stats totals, star counts) are rendered as text elements with their own IDs.
- Debug-only aids: 1-minute duration, Seed demo data.
- README documents how to build a debug `.app` for the iOS Simulator and a debug `.apk` for Android,
  with output paths and the bundle ID / package name (`com.stillsky`) for Appium capabilities.

## 8. Unit testing (in scope)

Vitest tests for:
- `timer.ts`: start, remaining-time calculation, completion, give-up, restore after relaunch.
- `constellations.ts`: star N → (constellation, index); completion detection; overflow stars.
- `stats.ts`: period filtering, bucketing, totals, success rate, tag breakdown, empty input.
- `validation.ts`: name and duration bounds.
- `storage/`: defaults on missing/corrupt data, round-trip read/write (in-memory AsyncStorage mock via `vi.mock`).

## 9. Success criteria

- App builds and runs on iOS Simulator and Android Emulator from the same codebase.
- Full flow works: onboarding → focus session (complete and give up) → star appears in Sky →
  Stats reflect it → Settings changes persist across relaunch → Reset returns to onboarding.
- All Vitest tests pass.
- testIDs visible in Appium Inspector on both platforms for every element listed in section 7.
