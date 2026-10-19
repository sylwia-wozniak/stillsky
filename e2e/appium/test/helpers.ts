import { execFileSync } from 'node:child_process';
import { TID } from '../../../src/testIds';

export { TID };
export const APP = 'com.stillsky';
export const SESSION_MS = 75_000; // a 1-minute focus session plus margin

/**
 * Element by testID. iOS exposes testID as the accessibility id (`~`), but on Android `~` matches
 * the accessibility label (content-desc); the testID is the resource-id there.
 */
export function el(testId: string) {
  return driver.isAndroid
    ? $(`android=new UiSelector().resourceId("${testId}")`)
    : $(`~${testId}`);
}

/**
 * Types into a text field and waits until the field shows all of it. On iOS the driver types
 * faster than the app handles each change, and a tap right after `setValue` can catch the app with
 * a letter missing ("Ad" instead of "Ada"), so it checks and retypes if needed.
 */
export async function typeText(testId: string, text: string) {
  const field = el(testId);
  for (let attempt = 1; ; attempt++) {
    await field.setValue(text);
    try {
      await field.waitUntil(async () => (await field.getText()) === text, { timeout: 3_000 });
      return;
    } catch (e) {
      if (attempt === 3) throw e;
    }
  }
}

const appArg = () => (driver.isAndroid ? { appId: APP } : { bundleId: APP });

/** The session's device: the adb serial on Android, the simulator UDID on iOS. */
function deviceId(): string {
  const id = driver.capabilities['udid' as keyof typeof driver.capabilities];
  if (typeof id !== 'string') throw new Error('Appium session has no udid capability');
  return id;
}

export async function terminate() {
  await driver.execute('mobile: terminateApp', appArg());
}

export async function launch() {
  await driver.execute('mobile: activateApp', appArg());
}

/** Starts the app with no stored data, like Maestro's `clearState`. */
export async function freshStart() {
  await terminate();
  if (driver.isAndroid) {
    await driver.execute('mobile: clearApp', { appId: APP });
    // Debug builds on Android 17 need local-network access to reach Metro; clearing data revokes it.
    execFileSync('adb', ['-s', deviceId(), 'shell', 'pm', 'grant', APP, 'android.permission.ACCESS_LOCAL_NETWORK']);
  } else {
    // Appium has no "clear app data" for iOS simulators: empty the app's data container instead.
    const dir = execFileSync('xcrun', ['simctl', 'get_app_container', deviceId(), APP, 'data']).toString().trim();
    execFileSync('/bin/sh', ['-c', `rm -rf "${dir}/Documents/"* "${dir}/Library/"* "${dir}/tmp/"*`]);
  }
  await launch();
  // After clearing data the debug app reloads its JS bundle from Metro, which can take longer
  // than the default 5 s wait.
  await el(TID.onboarding.nameInput).waitForDisplayed({ timeout: 30_000 });
}

/** Stops and starts the app, keeping its data. */
export async function relaunch() {
  await terminate();
  await launch();
}

/** Fresh start, then completes onboarding as "Ada". */
export async function freshStartAndOnboard() {
  await freshStart();
  await typeText(TID.onboarding.nameInput, 'Ada');
  await el(TID.onboarding.beginButton).click();
  await expect(el(TID.tabs.focus)).toBeDisplayed();
}

/** Whether a switch is on. Android reports `checked`; iOS reports the switch value "1"/"0". */
export async function isSwitchOn(testId: string) {
  const attr = await el(testId).getAttribute(driver.isAndroid ? 'checked' : 'value');
  return attr === 'true' || attr === '1';
}

/** Drags a horizontal list left (short, slow drags) until `targetId` is fully inside it. */
export async function swipeUntilVisible(listId: string, targetId: string, maxSwipes = 6) {
  const list = await el(listId).getElementRect(await el(listId).elementId);
  const isInside = async () => {
    const target = el(targetId);
    if (!(await target.isExisting())) return false;
    const r = await target.getElementRect(await target.elementId);
    return r.width >= r.height && r.x >= list.x && r.x + r.width <= list.x + list.width;
  };
  for (let i = 0; i < maxSwipes && !(await isInside()); i++) {
    const y = Math.round(list.y + list.height / 2);
    const fromX = Math.round(list.x + list.width * 0.75);
    const toX = Math.round(fromX - list.width / 3);
    if (driver.isAndroid) {
      await driver.execute('mobile: dragGesture', { startX: fromX, startY: y, endX: toX, endY: y, speed: 500 });
    } else {
      await driver.execute('mobile: dragFromToForDuration', { fromX, fromY: y, toX, toY: y, duration: 0.8 });
    }
    await driver.pause(300);
  }
  if (!(await isInside())) throw new Error(`${targetId} not scrolled into view after ${maxSwipes} swipes`);
}
