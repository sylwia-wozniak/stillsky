// "Twilight glass": a dusk gradient behind translucent, softly bordered layers.
export const colors = {
  gradientTop: '#171A45',
  gradientMid: '#36296A',
  gradientBottom: '#86568A',
  background: '#171A45', // solid fallback behind the gradient
  glass: 'rgba(255,255,255,0.08)',
  glassStrong: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.18)',
  backdrop: 'rgba(10,8,30,0.55)',
  dialog: 'rgba(46,38,92,0.97)',
  primary: 'rgba(255,255,255,0.92)', // filled buttons and selected chips
  onPrimary: '#2A2160',
  star: '#FFE7B0',
  accent: '#CDBBFF',
  text: '#F5F2FF',
  muted: 'rgba(245,242,255,0.62)',
  danger: '#FFA3B5',
};

export const fonts = {
  light: 'Outfit-Light',
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
  semibold: 'Outfit-SemiBold',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 12, md: 18, pill: 999 };

export const typography = {
  title: {
    fontFamily: fonts.light,
    fontSize: 32,
    color: colors.text,
    letterSpacing: 0.3,
  },
  heading: { fontFamily: fonts.regular, fontSize: 20, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 0.4,
  },
  timer: {
    fontFamily: fonts.light,
    fontSize: 64,
    color: colors.text,
    fontVariant: ['tabular-nums' as const],
    letterSpacing: 2,
  },
};

/** Glass tab bar; the Focus tab re-applies it (plus display: none) while a session runs. */
export const tabBarStyle = {
  backgroundColor: 'rgba(23,18,58,0.45)',
  borderTopColor: colors.glassBorder,
  elevation: 0,
};

/** Translucent card surface used across screens. */
export const glassCard = {
  backgroundColor: colors.glass,
  borderColor: colors.glassBorder,
  borderWidth: 1,
  borderRadius: radius.md,
};
