import React from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Screen } from '../../../components';
import { useTheme } from '../../../theme';
import type { AuthStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props): React.JSX.Element {
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
        Log In
      </Text>
      <Button
        label="Create an account"
        variant="secondary"
        onPress={() => navigation.navigate('SignUp')}
      />
    </Screen>
  );
}
