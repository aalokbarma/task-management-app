import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Input, Screen } from '../../../components';
import { validateCredentials } from '../../../services/auth';
import { useTheme } from '../../../theme';
import type { AppError, AuthCredentials } from '../../../types';
import {
  mapCredentialFieldErrors,
  type CredentialFieldErrors,
} from '../credentialFieldErrors';

interface AuthCredentialsFormProps {
  title: string;
  submitLabel: string;
  secondaryLabel: string;
  isSubmitting: boolean;
  formError: AppError | null;
  passwordContentType: 'password' | 'newPassword';
  onSubmit: (credentials: AuthCredentials) => void;
  onSecondaryPress: () => void;
  onDismissFormError: () => void;
}

export function AuthCredentialsForm({
  title,
  submitLabel,
  secondaryLabel,
  isSubmitting,
  formError,
  passwordContentType,
  onSubmit,
  onSecondaryPress,
  onDismissFormError,
}: AuthCredentialsFormProps): React.JSX.Element {
  const theme = useTheme();
  const passwordRef = useRef<React.ComponentRef<typeof Input>>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CredentialFieldErrors>({});

  const formMessage = formError?.message ?? null;

  function handleEmailChange(value: string): void {
    setEmail(value);
    if (formError) {
      onDismissFormError();
    }
    if (fieldErrors.email) {
      setFieldErrors(current => ({ ...current, email: undefined }));
    }
  }

  function handlePasswordChange(value: string): void {
    setPassword(value);
    if (formError) {
      onDismissFormError();
    }
    if (fieldErrors.password) {
      setFieldErrors(current => ({ ...current, password: undefined }));
    }
  }

  function handleSubmit(): void {
    onDismissFormError();
    const validation = validateCredentials({ email, password });
    if (!validation.success) {
      setFieldErrors(mapCredentialFieldErrors(validation.error));
      return;
    }

    setFieldErrors({});
    onSubmit(validation.data);
  }

  return (
    <Screen scroll>
      <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.h2.fontSize,
            fontWeight: theme.typography.h2.fontWeight,
            lineHeight: theme.typography.h2.lineHeight,
            marginBottom: theme.spacing.lg,
          }}
        >
          {title}
        </Text>
        {formMessage ? (
          <Text
            style={{
              color: theme.colors.danger,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              marginBottom: theme.spacing.md,
            }}
          >
            {formMessage}
          </Text>
        ) : null}
        <Input
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="you@example.com"
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          editable={!isSubmitting}
          onSubmitEditing={() => passwordRef.current?.focus()}
          style={{ marginBottom: theme.spacing.md }}
        />
        <Input
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="At least 6 characters"
          error={fieldErrors.password}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={
            passwordContentType === 'newPassword' ? 'password-new' : 'password'
          }
          textContentType={passwordContentType}
          returnKeyType="done"
          editable={!isSubmitting}
          onSubmitEditing={handleSubmit}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <Button
          label={submitLabel}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginBottom: theme.spacing.sm }}
        />
        <View style={{ marginTop: theme.spacing.sm }}>
          <Button
            label={secondaryLabel}
            variant="secondary"
            onPress={onSecondaryPress}
            disabled={isSubmitting}
          />
        </View>
    </Screen>
  );
}
