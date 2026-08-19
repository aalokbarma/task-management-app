import React from 'react';
import { Text } from 'react-native';
import { useAppSelector } from '../../app/hooks';
import { useTheme } from '../../theme';
import { selectIsOnline } from './connectivitySlice';

export function OfflineBanner(): React.JSX.Element | null {
  const theme = useTheme();
  const isOnline = useAppSelector(selectIsOnline);

  if (isOnline) {
    return null;
  }

  return (
    <Text
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      style={{
        color: theme.colors.warning,
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.caption.lineHeight,
        marginBottom: theme.spacing.sm,
      }}
    >
      You're offline. Changes are saved on this device.
    </Text>
  );
}
