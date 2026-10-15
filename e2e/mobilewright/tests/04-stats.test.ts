import { expect, test } from '@mobilewright/test';
import { SESSION_MS, TID, freshStartAndOnboard } from './helpers';

test('stats count completed and fallen stars per period', async ({ device, screen, platform }) => {
  await freshStartAndOnboard(device, screen, platform);
  await screen.getByTestId(TID.tabs.stats).tap();
  await expect(screen.getByTestId(TID.stats.emptyState)).toBeVisible();
  await screen.getByTestId(TID.tabs.focus).tap();

  // one fallen star
  await screen.getByTestId(TID.focus.duration(1)).tap();
  await screen.getByTestId(TID.focus.startButton).tap();
  await screen.getByTestId(TID.focus.giveUpButton).tap();
  await screen.getByTestId(TID.dialog.confirmButton).tap();

  // one earned star
  await screen.getByTestId(TID.focus.duration(1)).tap();
  await screen.getByTestId(TID.focus.intention('reading')).tap();
  await screen.getByTestId(TID.focus.startButton).tap();
  await expect(screen.getByTestId(TID.focus.completedMessage)).toBeVisible({ timeout: SESSION_MS });
  await screen.getByTestId(TID.focus.doneButton).tap();

  await screen.getByTestId(TID.tabs.stats).tap();
  await expect(screen.getByTestId(TID.stats.totalTime)).toHaveText('1m');
  await expect(screen.getByTestId(TID.stats.completed)).toHaveText('1');
  await expect(screen.getByTestId(TID.stats.failed)).toHaveText('1');
  await expect(screen.getByTestId(TID.stats.successRate)).toHaveText('50%');
  await expect(screen.getByTestId(TID.stats.intentionMinutes('reading'))).toHaveText('1m');

  await screen.getByTestId(TID.stats.period('week')).tap();
  await expect(screen.getByTestId(TID.stats.bar(6))).toBeVisible();
  await expect(screen.getByTestId(TID.stats.bar(7))).toBeHidden();
  await screen.getByTestId(TID.stats.period('month')).tap();
  await expect(screen.getByTestId(TID.stats.bar(27))).toBeVisible(); // every month has 28+ days
});
