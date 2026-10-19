import { expect, test } from '@mobilewright/test';
import { TID, freshStartAndOnboard } from './helpers';

test('seeded demo data fills Sky and Stats (test builds only)', async ({ device, screen, platform }) => {
  await freshStartAndOnboard(device, screen, platform);
  await screen.getByTestId(TID.tabs.settings).tap();
  await screen.getByTestId(TID.settings.seedButton).tap();

  await screen.getByTestId(TID.tabs.sky).tap();
  await expect(screen.getByTestId(TID.sky.emptyState)).toBeHidden();
  await expect(screen.getByTestId(TID.sky.constellation('littleDipper'))).toBeVisible();

  await screen.getByTestId(TID.tabs.stats).tap();
  await screen.getByTestId(TID.stats.period('month')).tap();
  await expect(screen.getByTestId(TID.stats.emptyState)).toBeHidden();
  await expect(screen.getByTestId(TID.stats.totalTime)).toBeVisible();
});
