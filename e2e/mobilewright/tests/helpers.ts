import { execFileSync } from 'node:child_process';
import type { Device, Screen } from '@mobilewright/core';
import { expect } from '@mobilewright/test';
import { TID } from '../../../src/testIds';

export { TID };
export const APP = 'com.stillsky';

/** Real-time waits shared by several scenarios. */
export const SESSION_MS = 75_000; // a 1-minute focus session plus margin

/** Starts the app with no stored data, like Maestro's `clearState`. */
export async function freshStart(device: Device, platform: string | undefined) {
  await device.terminateApp(APP).catch(() => {});
  await device.clearAppData(APP);
  if (platform === 'android') {
    // Debug builds on Android 17 need local-network access to reach Metro; clearing data revokes it.
    execFileSync('adb', ['shell', 'pm', 'grant', APP, 'android.permission.ACCESS_LOCAL_NETWORK']);
  }
  await device.launchApp(APP);
}

/** Stops and starts the app, keeping its data. */
export async function relaunch(device: Device) {
  await device.terminateApp(APP);
  await device.launchApp(APP);
}

/** Fresh start, then completes onboarding as "Ada". */
export async function freshStartAndOnboard(device: Device, screen: Screen, platform: string | undefined) {
  await freshStart(device, platform);
  await screen.getByTestId(TID.onboarding.nameInput).fill('Ada');
  await screen.getByTestId(TID.onboarding.beginButton).tap();
  await expect(screen.getByTestId(TID.tabs.focus)).toBeVisible();
}

type Locator = ReturnType<Screen['getByTestId']>;

/**
 * Drags a horizontal list left until `target` is fully inside it.
 * - Mobilewright's scrollIntoViewIfNeeded() only scrolls vertically.
 * - locator.swipe() is a fast fling that overshoots short lists.
 * - On iOS, off-screen children of a scroll view still count as "visible"; on Android a clipped
 *   element reports only its visible sliver.
 * So this does short, slow drags from the list's centre and compares positions.
 */
export async function swipeUntilVisible(screen: Screen, list: Locator, target: Locator, maxSwipes = 6) {
  const listBox = await list.boundingBox();
  if (!listBox) throw new Error('list has no bounding box');
  const isInside = async () => {
    const box = await target.boundingBox({ timeout: 1000 }).catch(() => null);
    if (!box) return false;
    // Android reports only the on-screen part of a clipped element (e.g. a 7px sliver), so also
    // require a full chip: chips are always wider than they are tall.
    const fullyDrawn = box.width >= box.height;
    return fullyDrawn && box.x >= listBox.x && box.x + box.width <= listBox.x + listBox.width;
  };
  for (let i = 0; i < maxSwipes && !(await isInside()); i++) {
    await screen.swipe('left', {
      startX: listBox.x + listBox.width * 0.75,
      startY: listBox.y + listBox.height / 2,
      distance: listBox.width / 3,
      duration: 800, // slow drag: no fling
    });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!(await isInside())) throw new Error(`target not scrolled into view after ${maxSwipes} swipes`);
}
