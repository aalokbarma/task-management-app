export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  primary: string;
  onPrimary: string;
  success: string;
  danger: string;
  warning: string;
  disabled: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F7',
  card: '#FFFFFF',
  border: '#E2E2E7',
  text: '#111114',
  textSecondary: '#6B6B76',
  textInverse: '#FFFFFF',
  primary: '#4F46E5',
  onPrimary: '#FFFFFF',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  disabled: '#C7C7CC',
};

export const darkColors: ThemeColors = {
  background: '#0B0B0F',
  surface: '#17171C',
  card: '#1C1C22',
  border: '#2C2C33',
  text: '#F2F2F5',
  textSecondary: '#9A9AA5',
  textInverse: '#0B0B0F',
  primary: '#6366F1',
  onPrimary: '#FFFFFF',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  disabled: '#3A3A42',
};
