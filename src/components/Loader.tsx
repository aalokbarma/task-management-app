import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

interface LoaderProps {
  size?: 'small' | 'large';
  fullscreen?: boolean;
}

export function Loader({
  size = 'large',
  fullscreen = false,
}: LoaderProps): React.JSX.Element {
  const theme = useTheme();

  if (!fullscreen) {
    return <ActivityIndicator size={size} color={theme.colors.primary} />;
  }

  return (
    <View style={[styles.fullscreen, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
