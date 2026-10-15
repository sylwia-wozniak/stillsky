import { TID, el, freshStartAndOnboard } from '../helpers';

describe('Demo data (debug builds only)', () => {
  it('fills Sky and Stats', async () => {
    await freshStartAndOnboard();
    await el(TID.tabs.settings).click();
    await el(TID.settings.seedButton).click();

    await el(TID.tabs.sky).click();
    await expect(el(TID.sky.emptyState)).not.toBeDisplayed();
    await expect(el(TID.sky.constellation('littleDipper'))).toBeDisplayed();

    await el(TID.tabs.stats).click();
    await el(TID.stats.period('month')).click();
    await expect(el(TID.stats.emptyState)).not.toBeDisplayed();
    await expect(el(TID.stats.totalTime)).toBeDisplayed();
  });
});
