#!/bin/sh
# Gets the Android emulator ready for an E2E run (any of the three suites).
set -e
SERIAL=${ANDROID_SERIAL:-emulator-5554}

if ! adb -s "$SERIAL" get-state >/dev/null 2>&1; then
  echo "No device $SERIAL. Start the emulator first: npm run emulator" >&2
  exit 1
fi

# The debug app loads JavaScript through localhost when this is set: ~5 s per start instead of
# 16-22 s through 10.0.2.2 (see android/app/src/main/java/com/stillsky/DevServerHost.kt).
adb -s "$SERIAL" reverse tcp:8081 tcp:8081 >/dev/null

# Mobilewright's helper stays on the emulator for 30 min after a run and holds UI automation,
# which stops Maestro's driver and Appium's UiAutomator2 from starting.
adb -s "$SERIAL" shell pkill -f com.mobilenext.mobilecli.DeviceServer 2>/dev/null || true
