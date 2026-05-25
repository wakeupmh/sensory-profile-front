import { colors, spacing, fonts } from '../../theme/tokens';

export const previewItemStyle: React.CSSProperties = {
  fontSize: '14px',
  color: colors.ink,
  fontFamily: fonts.body,
  padding: `${spacing.xs} 0`,
  borderBottom: `1px solid rgba(10,10,26,0.1)`,
};

export const emptyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: colors.ink,
  fontFamily: fonts.body,
  opacity: 0.5,
  fontStyle: 'italic',
};
