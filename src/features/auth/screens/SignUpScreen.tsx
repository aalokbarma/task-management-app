import React from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Screen } from '../../../components';
import { useTheme } from '../../../theme';
import type { AuthStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({
  navigation,
}: Props): React.JSX.Element {
  const theme = useTheme();

  return (
    <Screen>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.h2.fontSize,
          fontWeight: theme.typography.h2.fontWeight,
          marginBottom: theme.spacing.md,
        }}
      >
        Sign Up
      </Text>
      <Button
        label="Already have an account? Log in"
        variant="secondary"
        onPress={() => navigation.navigate('Login')}
      />
    </Screen>
  );
}
