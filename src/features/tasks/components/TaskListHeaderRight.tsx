import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../theme';
import type { AppStackParamList } from '../../../types';
import { SettingsHeaderButton } from '../../settings/components/SettingsHeaderButton';

export function TaskListHeaderRight(): React.JSX.Element {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add task"
        hitSlop={8}
        onPress={() => navigation.navigate('TaskDetail')}
        style={{ paddingHorizontal: theme.spacing.xs }}
      >
        <Text
          style={{
            color: theme.colors.primary,
            fontSize: theme.typography.bodyBold.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
          }}
        >
          Add
        </Text>
      </Pressable>
      <SettingsHeaderButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
