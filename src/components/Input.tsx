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

type TextInputRef = React.ComponentRef<typeof TextInput>;

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Input = React.forwardRef<TextInputRef, InputProps>(
  function InputField(
  {
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType,
    autoCapitalize = 'none',
    autoCorrect,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    editable = true,
    multiline = false,
    numberOfLines,
    style,
    testID,
  },
  ref,
): React.JSX.Element {
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
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        textContentType={textContentType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        testID={testID}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
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
});

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  multiline: {
    minHeight: 96,
  },
});
