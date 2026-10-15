import { SESSION_MS, TID, el, freshStartAndOnboard } from '../helpers';

describe('Give-up dialog', () => {
  it('left open when the session completes does not reappear', async () => {
    await freshStartAndOnboard();
    await el(TID.focus.duration(1)).click();
    await el(TID.focus.startButton).click();
    await el(TID.focus.giveUpButton).click();
    await expect(el(TID.dialog.message)).toBeDisplayed();

    // leave the dialog open until the session finishes on its own
    await el(TID.focus.completedMessage).waitForDisplayed({ timeout: SESSION_MS });
    await el(TID.focus.doneButton).click();
    await el(TID.focus.startButton).click();
    await expect(el(TID.focus.timerText)).toBeDisplayed();
    await expect(el(TID.dialog.message)).not.toBeDisplayed();
  });
});
