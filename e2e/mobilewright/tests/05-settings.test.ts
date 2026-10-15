import { expect, test } from '@mobilewright/test';
import { TID, freshStartAndOnboard, relaunch, swipeUntilVisible } from './helpers';

test('settings persist across relaunch and Reset needs exact confirmation', async ({ device, screen, platform }) => {
  await freshStartAndOnboard(device, screen, platform);
  await screen.getByTestId(TID.tabs.settings).tap();

  await screen.getByTestId(TID.settings.nameInput).fill('Grace');
  await screen.getByTestId(TID.settings.saveNameButton).tap();

  // 40 starts off-screen in the horizontal picker
  await swipeUntilVisible(
    screen,
    screen.getByTestId(TID.settings.durationPicker),
    screen.getByTestId(TID.settings.duration(40)),
  );
  await screen.getByTestId(TID.settings.duration(40)).tap();
  await expect(screen.getByTestId(TID.settings.duration(40))).toBeSelected();
  await screen.getByTestId(TID.settings.soundToggle).tap();
  await expect(screen.getByTestId(TID.settings.soundToggle)).not.toBeChecked();

  await relaunch(device);
  await expect(screen.getByTestId(TID.focus.greeting)).toHaveText(/Grace/);
  await expect(screen.getByTestId(TID.focus.duration(40))).toBeSelected();
  await screen.getByTestId(TID.tabs.settings).tap();
  await expect(screen.getByTestId(TID.settings.soundToggle)).not.toBeChecked();
  await expect(screen.getByTestId(TID.settings.keepAwakeToggle)).toBeChecked();

  await screen.getByTestId(TID.settings.resetButton).scrollIntoViewIfNeeded();
  await screen.getByTestId(TID.settings.resetButton).tap();
  await screen.getByTestId(TID.dialog.input).fill('reset');
  await expect(screen.getByTestId(TID.dialog.confirmButton)).toBeDisabled();
  await screen.getByTestId(TID.dialog.input).fill('RESET');
  await expect(screen.getByTestId(TID.dialog.confirmButton)).toBeEnabled();
  await screen.getByTestId(TID.dialog.confirmButton).tap();
  await expect(screen.getByTestId(TID.onboarding.nameInput)).toBeVisible();
});
