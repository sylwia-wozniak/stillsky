#!/bin/sh
# Gets the Android emulator ready for an E2E run (any of the three suites).
set -e
SERIAL=${ANDROID_SERIAL:-emulator-5554}
METRO=http://localhost:8081

if ! adb -s "$SERIAL" get-state >/dev/null 2>&1; then
  echo "No device $SERIAL. Start the emulator first: npm run emulator" >&2
  exit 1
fi

if ! curl -sf "$METRO/status" >/dev/null; then
  echo "Metro is not running. Start it first: npm start" >&2
  exit 1
fi

# The debug app loads JavaScript through localhost when this is set: ~5 s per start instead of
# 16-22 s through 10.0.2.2 (see android/app/src/main/java/com/stillsky/DevServerHost.kt).
adb -s "$SERIAL" reverse tcp:8081 tcp:8081 >/dev/null

# Mobilewright's helper stays on the emulator for 30 min after a run and holds UI automation,
# which stops Maestro's driver and Appium's UiAutomator2 from starting.
adb -s "$SERIAL" shell pkill -f com.mobilenext.mobilecli.DeviceServer 2>/dev/null || true

# Build the bundle now, so the first test does not wait for Metro to compile it.
echo "Warming up Metro..."
curl -sf -o /dev/null "$METRO/index.bundle?platform=android&dev=true&minify=false&app=com.stillsky"

# A freshly booted emulator keeps working in the background for minutes; tests started then
# time out at random. Wait until it is idle (1-minute load average below 2), up to 5 minutes.
until [ "$(adb -s "$SERIAL" shell getprop sys.boot_completed | tr -d '\r')" = 1 ]; do sleep 2; done
waited=0
while :; do
  load=$(adb -s "$SERIAL" shell cat /proc/loadavg | awk '{print $1}')
  if awk -v l="$load" 'BEGIN { exit !(l < 2) }'; then break; fi
  if [ "$waited" -ge 300 ]; then
    echo "Emulator still busy after 5 min (load $load). Tests may be flaky; restart it: npm run emulator" >&2
    break
  fi
  [ "$waited" -eq 0 ] && echo "Waiting for the emulator to settle (load $load)..."
  sleep 10; waited=$((waited + 10))
done
echo "Emulator ready (load $load)."
