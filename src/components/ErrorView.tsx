import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { Button } from './Button';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({
  message,
  onRetry,
}: ErrorViewProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing.lg }]}>
      <Text
        style={[
          styles.message,
          {
            color: theme.colors.danger,
            fontSize: theme.typography.body.fontSize,
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        {message}
      </Text>
      {onRetry ? (
        <Button label="Retry" onPress={onRetry} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
