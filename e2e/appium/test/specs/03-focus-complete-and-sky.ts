import { SESSION_MS, TID, el, freshStartAndOnboard } from '../helpers';

describe('Focus: complete a session', () => {
  it('lights the first star', async () => {
    await freshStartAndOnboard();
    await el(TID.tabs.sky).click();
    await expect(el(TID.sky.emptyState)).toBeDisplayed();

    await el(TID.tabs.focus).click();
    await el(TID.focus.duration(1)).click();
    await el(TID.focus.startButton).click();
    await el(TID.focus.completedMessage).waitForDisplayed({ timeout: SESSION_MS });

    await el(TID.focus.viewInSkyButton).click();
    await expect(el(TID.sky.litCount)).toHaveText('1 star lit');
    await el(TID.sky.constellation('littleDipper')).click();
    await expect(el(TID.sky.cardName)).toHaveText('Little Dipper');
    await expect(el(TID.sky.cardProgress)).toHaveText('1/7 stars');
    await expect(el(TID.sky.cardDate)).toHaveText('In progress');
    await el(TID.sky.cardClose).click();
    await expect(el(TID.sky.card)).not.toBeDisplayed();
  });
});
