import { TID, el, freshStart, relaunch, typeText } from '../helpers';

describe('Onboarding', () => {
  it('validates the name and is skipped on relaunch', async () => {
    await freshStart();
    const begin = el(TID.onboarding.beginButton);

    await expect(begin).toBeDisplayed();
    await el(TID.onboarding.nameInput).setValue('   '); // the error below is the check
    await expect(el(TID.onboarding.nameError)).toBeDisplayed();
    await expect(begin).toBeDisabled();

    await typeText(TID.onboarding.nameInput, 'Ada');
    await begin.click();
    await expect(el(TID.tabs.focus)).toBeDisplayed();
    await expect(el(TID.tabs.settings)).toBeDisplayed();

    await relaunch();
    await expect(el(TID.tabs.sky)).toBeDisplayed();
    await expect(el(TID.onboarding.nameInput)).not.toBeDisplayed();
  });
});
