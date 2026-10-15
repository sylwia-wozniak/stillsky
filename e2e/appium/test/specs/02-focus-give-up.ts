import { TID, el, freshStartAndOnboard } from '../helpers';

describe('Focus: give up', () => {
  it('asks for confirmation and makes the star fall', async () => {
    await freshStartAndOnboard();
    await expect(el(TID.focus.greeting)).toHaveText(expect.stringContaining('Ada'));
    await expect(el(TID.focus.duration(25))).toBeSelected();

    await el(TID.focus.duration(1)).click();
    await el(TID.focus.intention('study')).click();
    await el(TID.focus.startButton).click();
    await expect(el(TID.focus.timerText)).toBeDisplayed();
    await expect(el(TID.tabs.sky)).not.toBeDisplayed(); // tab bar hidden while focusing

    await el(TID.focus.giveUpButton).click();
    await expect(el(TID.dialog.message)).toHaveText('Your star will fall. Give up?');
    await el(TID.dialog.cancelButton).click();
    await expect(el(TID.focus.timerText)).toBeDisplayed(); // still running

    await el(TID.focus.giveUpButton).click();
    await el(TID.dialog.confirmButton).click();
    await expect(el(TID.focus.startButton)).toBeDisplayed();
    await expect(el(TID.tabs.sky)).toBeDisplayed();
  });
});
