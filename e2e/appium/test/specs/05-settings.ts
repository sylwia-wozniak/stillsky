import { TID, el, freshStartAndOnboard, isSwitchOn, relaunch, swipeUntilVisible } from '../helpers';

describe('Settings', () => {
  it('persist across relaunch and Reset needs exact confirmation', async () => {
    await freshStartAndOnboard();
    await el(TID.tabs.settings).click();

    await el(TID.settings.nameInput).setValue('Grace');
    await el(TID.settings.saveNameButton).click();

    // 40 starts off-screen in the horizontal picker
    await swipeUntilVisible(TID.settings.durationPicker, TID.settings.duration(40));
    await el(TID.settings.duration(40)).click();
    await expect(el(TID.settings.duration(40))).toBeSelected();
    await el(TID.settings.soundToggle).click();
    expect(await isSwitchOn(TID.settings.soundToggle)).toBe(false);

    await relaunch();
    await expect(el(TID.focus.greeting)).toHaveText(expect.stringContaining('Grace'));
    await expect(el(TID.focus.duration(40))).toBeSelected();
    await el(TID.tabs.settings).click();
    expect(await isSwitchOn(TID.settings.soundToggle)).toBe(false);
    expect(await isSwitchOn(TID.settings.keepAwakeToggle)).toBe(true);

    await el(TID.settings.resetButton).click();
    await el(TID.dialog.input).setValue('reset');
    await expect(el(TID.dialog.confirmButton)).toBeDisabled();
    await el(TID.dialog.input).setValue('RESET');
    await expect(el(TID.dialog.confirmButton)).toBeEnabled();
    await el(TID.dialog.confirmButton).click();
    await expect(el(TID.onboarding.nameInput)).toBeDisplayed();
  });
});
