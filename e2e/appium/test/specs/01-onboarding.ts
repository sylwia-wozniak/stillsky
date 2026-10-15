import { TID, el, freshStart, relaunch } from '../helpers';

describe('Onboarding', () => {
  it('validates the name and is skipped on relaunch', async () => {
    await freshStart();
    const nameInput = el(TID.onboarding.nameInput);
    const begin = el(TID.onboarding.beginButton);

    await expect(begin).toBeDisplayed();
    await nameInput.setValue('   ');
    await expect(el(TID.onboarding.nameError)).toBeDisplayed();
    await expect(begin).toBeDisabled();

    await nameInput.setValue('Ada');
    await begin.click();
    await expect(el(TID.tabs.focus)).toBeDisplayed();
    await expect(el(TID.tabs.settings)).toBeDisplayed();

    await relaunch();
    await expect(el(TID.tabs.sky)).toBeDisplayed();
    await expect(el(TID.onboarding.nameInput)).not.toBeDisplayed();
  });
});
