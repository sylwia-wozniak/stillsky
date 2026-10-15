import { expect, test } from '@mobilewright/test';
import { TID, freshStart, relaunch } from './helpers';

test('onboarding validates the name and is skipped on relaunch', async ({ device, screen, platform }) => {
  await freshStart(device, platform);
  const nameInput = screen.getByTestId(TID.onboarding.nameInput);
  const begin = screen.getByTestId(TID.onboarding.beginButton);

  await expect(begin).toBeVisible();
  await nameInput.fill('   ');
  await expect(screen.getByTestId(TID.onboarding.nameError)).toBeVisible();
  await expect(begin).toBeDisabled();

  await nameInput.fill('Ada');
  await begin.tap();
  await expect(screen.getByTestId(TID.tabs.focus)).toBeVisible();
  await expect(screen.getByTestId(TID.tabs.settings)).toBeVisible();

  await relaunch(device);
  await expect(screen.getByTestId(TID.tabs.sky)).toBeVisible();
  await expect(screen.getByTestId(TID.onboarding.nameInput)).toBeHidden();
});
