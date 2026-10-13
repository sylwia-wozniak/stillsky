# Stillsky

A calm night-sky focus timer. Every completed focus session lights a star; stars fill
constellations; giving up makes the star fall. Built with React Native CLI (TypeScript) for iOS and
Android, with stable test IDs everywhere so it is a good target for **Appium** and **Mobilewright**.

All data stays on the device (AsyncStorage). No login, no backend.

## Prerequisites

- Node 20+ and npm
- **iOS:** Xcode, CocoaPods (`bundle install` once, then pods as below)
- **Android:** Android Studio with SDK + an emulator (AVD), JDK 17, and in `~/.zshrc`:
  ```bash
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
  ```

## Run (development)

```bash
npm install
cd ios && bundle exec pod install && cd ..
npm start            # Metro bundler, keep it running
npm run ios          # iOS simulator
npm run android      # Android emulator
```

## Unit tests

```bash
npm test             # Vitest, runs with TZ=UTC
```

Unit tests cover the pure logic in `src/domain` and `src/storage`.

## App identifiers

| Platform | Identifier |
|----------|------------|
| iOS bundle ID | `com.stillsky` |
| Android package | `com.stillsky` |
| Android main activity | `com.stillsky.MainActivity` |

## Build artifacts for automation

Debug builds load JavaScript from Metro (`npm start` must be running) and include the debug
helpers below. Release builds bundle the JavaScript and run standalone.

**iOS simulator `.app`**

```bash
# Release (standalone, no Metro needed)
xcodebuild -workspace ios/Stillsky.xcworkspace -scheme Stillsky -configuration Release \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build build
# → ios/build/Build/Products/Release-iphonesimulator/Stillsky.app

# Debug (needs Metro; has debug helpers)
xcodebuild -workspace ios/Stillsky.xcworkspace -scheme Stillsky -configuration Debug \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ios/build build
# → ios/build/Build/Products/Debug-iphonesimulator/Stillsky.app
```

**Android `.apk`**

```bash
cd android
./gradlew assembleDebug     # → android/app/build/outputs/apk/debug/app-debug.apk (needs Metro)
./gradlew assembleRelease   # → android/app/build/outputs/apk/release/app-release.apk (standalone,
                            #   signed with the template's debug keystore — fine for testing)
```

## Appium capabilities

```jsonc
// iOS
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 17 Pro",
  "appium:app": "/absolute/path/to/ios/build/Build/Products/Release-iphonesimulator/Stillsky.app",
  "appium:bundleId": "com.stillsky"
}

// Android
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:avd": "<your AVD name>",
  "appium:app": "/absolute/path/to/android/app/build/outputs/apk/release/app-release.apk",
  "appium:appPackage": "com.stillsky",
  "appium:appActivity": ".MainActivity"
}
```

## Locators

Every interactive or asserted element has a `testID` **and** an `accessibilityLabel`. All IDs live
in [`src/testIds.ts`](src/testIds.ts) and follow `screen.element`, for example:

`onboarding.nameInput`, `focus.startButton`, `focus.duration.25`, `focus.intention.study`,
`focus.timerText`, `dialog.confirmButton`, `sky.constellation.orion`, `stats.period.week`,
`stats.totalTime`, `stats.bar.3`, `settings.soundToggle`, `settings.resetButton`, `tabs.sky`.

- iOS: the testID is the accessibility identifier → Appium `accessibility id` or `id`.
- Android: the testID is the view's `resource-id` → Appium `id` (UiAutomator2).
- The accessibility label always equals the visible text, so text assertions work too.
- Constellations and chart bars are drawn with SVG; each has a transparent overlay view that
  carries its testID, because SVG shapes are not exposed to automation.

## Debug helpers (debug builds only)

- **1-minute duration** in the Focus duration picker, so tests don't wait 10+ minutes.
- **Seed demo data** in Settings: replaces your sessions with ~30 days of random history.

## Good scenarios to automate

- Onboarding validation (empty / whitespace / 21-character names)
- Start → give up → cancel / confirm (falling star)
- Complete a 1-minute session → star in Sky, numbers in Stats
- Kill the app mid-session, relaunch after the end → session counted as completed
- Settings persist across relaunch; Reset requires typing `RESET` exactly
