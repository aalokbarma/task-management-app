import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = false,
  style,
}: ScreenProps): React.JSX.Element {
  const theme = useTheme();
  const padding = { padding: theme.spacing.md };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, padding, style]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, padding, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
