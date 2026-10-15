import { SESSION_MS, TID, el, freshStartAndOnboard } from '../helpers';

describe('Stats', () => {
  it('counts completed and fallen stars per period', async () => {
    await freshStartAndOnboard();
    await el(TID.tabs.stats).click();
    await expect(el(TID.stats.emptyState)).toBeDisplayed();
    await el(TID.tabs.focus).click();

    // one fallen star
    await el(TID.focus.duration(1)).click();
    await el(TID.focus.startButton).click();
    await el(TID.focus.giveUpButton).click();
    await el(TID.dialog.confirmButton).click();

    // one earned star
    await el(TID.focus.duration(1)).click();
    await el(TID.focus.intention('reading')).click();
    await el(TID.focus.startButton).click();
    await el(TID.focus.completedMessage).waitForDisplayed({ timeout: SESSION_MS });
    await el(TID.focus.doneButton).click();

    await el(TID.tabs.stats).click();
    await expect(el(TID.stats.totalTime)).toHaveText('1m');
    await expect(el(TID.stats.completed)).toHaveText('1');
    await expect(el(TID.stats.failed)).toHaveText('1');
    await expect(el(TID.stats.successRate)).toHaveText('50%');
    await expect(el(TID.stats.intentionMinutes('reading'))).toHaveText('1m');

    await el(TID.stats.period('week')).click();
    await expect(el(TID.stats.bar(6))).toBeDisplayed();
    await expect(el(TID.stats.bar(7))).not.toBeExisting();
    await el(TID.stats.period('month')).click();
    await expect(el(TID.stats.bar(27))).toBeDisplayed(); // every month has 28+ days
  });
});
