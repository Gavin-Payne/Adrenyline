import { colors, spacing } from '../theme';

export const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  padding: '20px'
};

export const tabContentStyle = {
  padding: '20px',
  marginBottom: '80px',
  backgroundColor: colors.background.surface,
  color: colors.text.primary
};

export const tipBoxStyle = {
  backgroundColor: colors.background.elevated,
  padding: spacing.md,
  borderRadius: '8px',
  marginBottom: spacing.sm
};

export const searchContainerStyle = {
  padding: spacing.lg,
  backgroundColor: colors.background.elevated,
  borderRadius: '8px',
  marginBottom: spacing.lg
};

export const gridRowStyle = (index) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: index % 2 === 0 ? colors.background.elevated : colors.background.surface
});

export const bottomGridContainerStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: colors.background.surface,
  borderBottomLeftRadius: '10px',
  borderBottomRightRadius: '10px',
  padding: spacing.sm,
  borderTop: `1px solid ${colors.border.light}`
};

export const tradingContainerStyle = {
  backgroundColor: colors.background.surface,
  padding: spacing.lg,
  borderRadius: '8px',
  marginTop: spacing.md,
  marginBottom: spacing.xl,
  maxWidth: '800px',
  margin: '0 auto',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};