import { expect, test } from '@mobilewright/test';
import { SESSION_MS, TID, freshStartAndOnboard } from './helpers';

test('completing a 1-minute session lights the first star', async ({ device, screen, platform }) => {
  await freshStartAndOnboard(device, screen, platform);
  await screen.getByTestId(TID.tabs.sky).tap();
  await expect(screen.getByTestId(TID.sky.emptyState)).toBeVisible();

  await screen.getByTestId(TID.tabs.focus).tap();
  await screen.getByTestId(TID.focus.duration(1)).tap();
  await screen.getByTestId(TID.focus.startButton).tap();
  await expect(screen.getByTestId(TID.focus.completedMessage)).toBeVisible({ timeout: SESSION_MS });

  await screen.getByTestId(TID.focus.viewInSkyButton).tap();
  await expect(screen.getByTestId(TID.sky.litCount)).toHaveText('1 star lit');
  await screen.getByTestId(TID.sky.constellation('littleDipper')).tap();
  await expect(screen.getByTestId(TID.sky.cardName)).toHaveText('Little Dipper');
  await expect(screen.getByTestId(TID.sky.cardProgress)).toHaveText('1/7 stars');
  await expect(screen.getByTestId(TID.sky.cardDate)).toHaveText('In progress');
  await screen.getByTestId(TID.sky.cardClose).tap();
  await expect(screen.getByTestId(TID.sky.card)).toBeHidden();
});
