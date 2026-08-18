import React from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../../components';
import { useTheme } from '../../../theme';
import type { AppStackParamList } from '../../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

export default function SettingsScreen(_props: Props): React.JSX.Element {
  const theme = useTheme();

  return (
    <Screen>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.h2.fontSize,
          fontWeight: theme.typography.h2.fontWeight,
        }}
      >
        Settings
      </Text>
    </Screen>
  );
}
