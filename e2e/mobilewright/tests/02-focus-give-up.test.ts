import { expect, test } from '@mobilewright/test';
import { TID, freshStartAndOnboard } from './helpers';

test('giving up asks for confirmation and makes the star fall', async ({ device, screen, platform }) => {
  await freshStartAndOnboard(device, screen, platform);
  await expect(screen.getByTestId(TID.focus.greeting)).toHaveText(/Ada/);
  await expect(screen.getByTestId(TID.focus.duration(25))).toBeSelected();

  await screen.getByTestId(TID.focus.duration(1)).tap();
  await screen.getByTestId(TID.focus.intention('study')).tap();
  await screen.getByTestId(TID.focus.startButton).tap();
  await expect(screen.getByTestId(TID.focus.timerText)).toBeVisible();
  await expect(screen.getByTestId(TID.tabs.sky)).toBeHidden(); // tab bar hidden while focusing

  await screen.getByTestId(TID.focus.giveUpButton).tap();
  await expect(screen.getByTestId(TID.dialog.message)).toHaveText('Your star will fall. Give up?');
  await screen.getByTestId(TID.dialog.cancelButton).tap();
  await expect(screen.getByTestId(TID.focus.timerText)).toBeVisible(); // still running

  await screen.getByTestId(TID.focus.giveUpButton).tap();
  await screen.getByTestId(TID.dialog.confirmButton).tap();
  await expect(screen.getByTestId(TID.focus.startButton)).toBeVisible();
  await expect(screen.getByTestId(TID.tabs.sky)).toBeVisible();
});
