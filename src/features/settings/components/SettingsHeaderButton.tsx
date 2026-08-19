import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme';
import type { AppStackParamList } from '../../../types';

export function SettingsHeaderButton(): React.JSX.Element {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Settings"
      onPress={() => navigation.navigate('Settings')}
      style={{ paddingHorizontal: theme.spacing.xs }}
    >
      <Text
        style={{
          color: theme.colors.primary,
          fontSize: theme.typography.bodyBold.fontSize,
          fontWeight: theme.typography.bodyBold.fontWeight,
        }}
      >
        Settings
      </Text>
    </Pressable>
  );
}
