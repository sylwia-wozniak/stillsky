import { TID, el, freshStartAndOnboard, launch, terminate } from '../helpers';

describe('Restore after kill', () => {
  it('counts a session that ended while the app was killed', async () => {
    await freshStartAndOnboard();
    await el(TID.focus.duration(1)).click();
    await el(TID.focus.startButton).click();
    await expect(el(TID.focus.timerText)).toBeDisplayed();

    await terminate();
    await driver.pause(70_000); // the session ends while the app is closed
    await launch();

    await expect(el(TID.focus.startButton)).toBeDisplayed();
    await expect(el(TID.focus.timerText)).not.toBeDisplayed();
    await el(TID.tabs.sky).click();
    await expect(el(TID.sky.litCount)).toHaveText('1 star lit');
  });
});
