import { expect, test } from '@mobilewright/test';
import { APP, TID, freshStartAndOnboard } from './helpers';

test('a session that ended while the app was killed counts as completed', async ({ device, screen, platform }) => {
  await freshStartAndOnboard(device, screen, platform);
  await screen.getByTestId(TID.focus.duration(1)).tap();
  await screen.getByTestId(TID.focus.startButton).tap();
  await expect(screen.getByTestId(TID.focus.timerText)).toBeVisible();

  await device.terminateApp(APP);
  await new Promise(resolve => setTimeout(resolve, 70_000)); // the session ends while the app is closed
  await device.launchApp(APP);

  await expect(screen.getByTestId(TID.focus.startButton)).toBeVisible();
  await expect(screen.getByTestId(TID.focus.timerText)).toBeHidden();
  await screen.getByTestId(TID.tabs.sky).tap();
  await expect(screen.getByTestId(TID.sky.litCount)).toHaveText('1 star lit');
});
