import type { Period } from './domain/stats';
import type { Tag } from './domain/types';

// Single source of truth for every testID. Naming: `screen.element`.
export const TID = {
  tabs: {
    focus: 'tabs.focus',
    sky: 'tabs.sky',
    stats: 'tabs.stats',
    settings: 'tabs.settings',
  },
  onboarding: {
    nameInput: 'onboarding.nameInput',
    beginButton: 'onboarding.beginButton',
    nameError: 'onboarding.nameError',
  },
  focus: {
    greeting: 'focus.greeting',
    startButton: 'focus.startButton',
    giveUpButton: 'focus.giveUpButton',
    timerText: 'focus.timerText',
    star: 'focus.star',
    completedMessage: 'focus.completedMessage',
    viewInSkyButton: 'focus.viewInSkyButton',
    doneButton: 'focus.doneButton',
    duration: (m: number) => `focus.duration.${m}`,
    tag: (t: Tag) => `focus.tag.${t}`,
  },
  dialog: {
    container: 'dialog.container',
    message: 'dialog.message',
    input: 'dialog.input',
    confirmButton: 'dialog.confirmButton',
    cancelButton: 'dialog.cancelButton',
  },
  sky: {
    canvas: 'sky.canvas',
    emptyState: 'sky.emptyState',
    litCount: 'sky.litCount',
    constellation: (id: string) => `sky.constellation.${id}`,
    card: 'sky.card',
    cardName: 'sky.cardName',
    cardProgress: 'sky.cardProgress',
    cardDate: 'sky.cardDate',
    cardClose: 'sky.cardClose',
  },
  stats: {
    period: (p: Period) => `stats.period.${p}`,
    totalTime: 'stats.totalTime',
    completed: 'stats.completed',
    failed: 'stats.failed',
    successRate: 'stats.successRate',
    emptyState: 'stats.emptyState',
    bar: (i: number) => `stats.bar.${i}`,
    tagMinutes: (t: Tag) => `stats.tag.${t}`,
  },
  settings: {
    nameInput: 'settings.nameInput',
    saveNameButton: 'settings.saveNameButton',
    nameError: 'settings.nameError',
    duration: (m: number) => `settings.duration.${m}`,
    soundToggle: 'settings.soundToggle',
    keepAwakeToggle: 'settings.keepAwakeToggle',
    resetButton: 'settings.resetButton',
    seedButton: 'settings.seedButton',
    version: 'settings.version',
  },
  toast: 'toast',
} as const;
