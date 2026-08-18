import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  style,
  testID,
}: InputProps): React.JSX.Element {
  const theme = useTheme();
  const borderColor = error ? theme.colors.danger : theme.colors.border;

  return (
    <View style={style}>
      {label ? (
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.caption.fontSize,
            marginBottom: theme.spacing.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        testID={testID}
        style={[
          styles.input,
          {
            borderColor,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            fontSize: theme.typography.body.fontSize,
          },
        ]}
      />
      {error ? (
        <Text
          style={{
            color: theme.colors.danger,
            fontSize: theme.typography.caption.fontSize,
            marginTop: theme.spacing.xs,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
