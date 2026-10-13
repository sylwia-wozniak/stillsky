export const colors = {
  background: '#0B1026',
  surface: '#151B3A',
  star: '#FFE9A8',
  accent: '#8FA8FF',
  text: '#E8ECFF',
  muted: '#8A93B8',
  danger: '#FF7A90',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const typography = {
  title: { fontSize: 28, fontWeight: '600' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, color: colors.text },
  caption: { fontSize: 13, color: colors.muted },
  timer: { fontSize: 56, fontWeight: '200' as const, color: colors.text, fontVariant: ['tabular-nums' as const] },
};
