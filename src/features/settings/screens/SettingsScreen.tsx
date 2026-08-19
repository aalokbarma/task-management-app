import React from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { Button, Screen } from '../../../components';
import { ThemeModePicker } from '../components/ThemeModePicker';
import {
  selectAuthError,
  selectAuthUser,
  selectIsAuthSubmitting,
} from '../../auth/authSlice';
import { signOutRequested } from '../../auth/authThunks';
import { useTheme } from '../../../theme';
import type { AppStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

export default function SettingsScreen(_props: Props): React.JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isSubmitting = useAppSelector(selectIsAuthSubmitting);
  const error = useAppSelector(selectAuthError);

  function handleSignOut(): void {
    if (isSubmitting) {
      return;
    }

    dispatch(signOutRequested());
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
        Settings
      </Text>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.caption.fontSize,
          lineHeight: theme.typography.caption.lineHeight,
          marginBottom: theme.spacing.xs,
        }}
      >
        Signed in as
      </Text>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.body.fontSize,
          lineHeight: theme.typography.body.lineHeight,
          marginBottom: theme.spacing.lg,
        }}
      >
        {user?.email || 'Your account'}
      </Text>
      <ThemeModePicker />
      {error ? (
        <Text
          style={{
            color: theme.colors.danger,
            fontSize: theme.typography.body.fontSize,
            lineHeight: theme.typography.body.lineHeight,
            marginBottom: theme.spacing.md,
          }}
        >
          {error.message}
        </Text>
      ) : null}
      <Button
        label="Log out"
        variant="danger"
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={handleSignOut}
      />
    </Screen>
  );
}
