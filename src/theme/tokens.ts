/**
 * Gumroad-Style Design Tokens for Perfil Sensorial
 * Playful, card-based, thick-shadow neubrutalism aesthetic
 */

// ─── Colors ───────────────────────────────────────────────
export const colors = {
  canvas: '#FFFEF5',
  ink: '#0A0A1A',
  surface: '#FFFFFF',
  'surface-cream': '#FFF8E1',

  'brand-cyan': '#4ECDC4',
  'brand-yellow': '#FFD93D',
  'brand-salmon': '#FF6B6B',
  'brand-mint': '#A8E6CF',
  'brand-lavender': '#C7B8FF',
  'brand-peach': '#FFC09F',

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;

// ─── Shadows ──────────────────────────────────────────────
export const shadows = {
  card: '6px 6px 0px #0A0A1A',
  'card-hover': '8px 8px 0px #0A0A1A',
  'card-sm': '4px 4px 0px #0A0A1A',
  button: '3px 3px 0px #0A0A1A',
  'button-active': '1px 1px 0px #0A0A1A',
  input: '2px 2px 0px #0A0A1A',
  none: 'none',
} as const;

// ─── Border Radius ────────────────────────────────────────
export const radii = {
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  pill: '9999px',
  full: '50%',
} as const;

// ─── Spacing ──────────────────────────────────────────────
export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  section: '64px',
} as const;

// ─── Typography ───────────────────────────────────────────
export const fonts = {
  display: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;

export const typography = {
  'display-xl': { size: '56px', weight: 700, lh: 1.05, ls: '-0.02em', font: fonts.display },
  'display-lg': { size: '40px', weight: 700, lh: 1.1, ls: '-0.02em', font: fonts.display },
  'display-md': { size: '32px', weight: 700, lh: 1.15, ls: '-0.01em', font: fonts.display },
  'display-sm': { size: '24px', weight: 700, lh: 1.2, ls: '-0.01em', font: fonts.display },
  'title-lg': { size: '20px', weight: 600, lh: 1.3, ls: '-0.01em', font: fonts.display },
  'title-md': { size: '18px', weight: 600, lh: 1.35, ls: '0', font: fonts.display },
  'title-sm': { size: '16px', weight: 600, lh: 1.4, ls: '0', font: fonts.display },
  'body-lg': { size: '18px', weight: 400, lh: 1.6, ls: '0', font: fonts.body },
  'body-md': { size: '16px', weight: 400, lh: 1.6, ls: '0', font: fonts.body },
  'body-sm': { size: '14px', weight: 400, lh: 1.55, ls: '0', font: fonts.body },
  caption: { size: '13px', weight: 500, lh: 1.4, ls: '0', font: fonts.display },
  'caption-uppercase': { size: '12px', weight: 600, lh: 1.4, ls: '0.08em', font: fonts.display },
  button: { size: '14px', weight: 600, lh: 1.0, ls: '0', font: fonts.display },
  'nav-link': { size: '14px', weight: 500, lh: 1.4, ls: '0', font: fonts.display },
} as const;

// ─── Borders ──────────────────────────────────────────────
export const borders = {
  default: '2px solid #0A0A1A',
  hairline: '1px solid #0A0A1A',
  thick: '3px solid #0A0A1A',
} as const;

// ─── Z-Index ──────────────────────────────────────────────
export const zIndex = {
  menu: 1000,
  bottomNav: 999,
  modal: 1100,
} as const;

// ─── Helper: apply typography token to style object ───────
export function applyTypography(
  token: keyof typeof typography,
  extra?: React.CSSProperties
): React.CSSProperties {
  const t = typography[token];
  return {
    fontFamily: t.font,
    fontSize: t.size,
    fontWeight: t.weight,
    lineHeight: t.lh,
    letterSpacing: t.ls,
    ...extra,
  };
}
