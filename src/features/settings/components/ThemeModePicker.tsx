import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useTheme } from '../../../theme';
import type { ThemeMode } from '../../../types';
import { selectThemeMode } from '../../theme/themeSlice';
import { setThemeModeRequested } from '../../theme/themeThunks';

const OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function ThemeModePicker(): React.JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);

  return (
    <View>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.caption.fontSize,
          lineHeight: theme.typography.caption.lineHeight,
          marginBottom: theme.spacing.xs,
        }}
      >
        Appearance
      </Text>
      <View style={[styles.row, { marginBottom: theme.spacing.lg }]}>
        {OPTIONS.map(option => {
          const selected = option.id === mode;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                if (option.id !== mode) {
                  dispatch(setThemeModeRequested(option.id));
                }
              }}
              style={[
                styles.chip,
                {
                  borderColor: selected
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: selected
                    ? theme.colors.primary
                    : theme.colors.surface,
                  borderRadius: theme.radii.md,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  marginRight: theme.spacing.xs,
                  marginBottom: theme.spacing.xs,
                },
              ]}
            >
              <Text
                style={{
                  color: selected
                    ? theme.colors.onPrimary
                    : theme.colors.text,
                  fontSize: theme.typography.caption.fontSize,
                  fontWeight: theme.typography.bodyBold.fontWeight,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
