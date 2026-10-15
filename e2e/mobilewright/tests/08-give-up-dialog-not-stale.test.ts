import { expect, test } from '@mobilewright/test';
import { SESSION_MS, TID, freshStartAndOnboard } from './helpers';

test('a Give-up dialog left open when the session completes does not reappear', async ({ device, screen, platform }) => {
  await freshStartAndOnboard(device, screen, platform);
  await screen.getByTestId(TID.focus.duration(1)).tap();
  await screen.getByTestId(TID.focus.startButton).tap();
  await screen.getByTestId(TID.focus.giveUpButton).tap();
  await expect(screen.getByTestId(TID.dialog.message)).toBeVisible();

  // leave the dialog open until the session finishes on its own
  await expect(screen.getByTestId(TID.focus.completedMessage)).toBeVisible({ timeout: SESSION_MS });
  await screen.getByTestId(TID.focus.doneButton).tap();
  await screen.getByTestId(TID.focus.startButton).tap();
  await expect(screen.getByTestId(TID.focus.timerText)).toBeVisible();
  await expect(screen.getByTestId(TID.dialog.message)).toBeHidden();
});
