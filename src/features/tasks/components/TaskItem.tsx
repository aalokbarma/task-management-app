import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme';
import type { Task } from '../../../types';
import { formatDueAt } from '../../../utils/formatDate';

interface TaskItemProps {
  task: Task;
  onPress: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
}

function TaskItemComponent({
  task,
  onPress,
  onToggleComplete,
  onDelete,
}: TaskItemProps): React.JSX.Element {
  const theme = useTheme();
  const dueLabel = task.dueAt ? formatDueAt(task.dueAt) : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={task.title}
      onPress={() => onPress(task.id)}
      onLongPress={() => onDelete(task.id)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={
          task.completed ? 'Mark as incomplete' : 'Mark as complete'
        }
        hitSlop={8}
        onPress={() => onToggleComplete(task.id, !task.completed)}
        style={[
          styles.checkbox,
          {
            borderColor: task.completed
              ? theme.colors.primary
              : theme.colors.border,
            backgroundColor: task.completed
              ? theme.colors.primary
              : undefined,
            marginRight: theme.spacing.sm,
          },
          !task.completed ? styles.checkboxEmpty : null,
        ]}
      />
      <View style={styles.body}>
        <Text
          numberOfLines={2}
          style={[
            {
              color: task.completed
                ? theme.colors.textSecondary
                : theme.colors.text,
              fontSize: theme.typography.body.fontSize,
              fontWeight: theme.typography.bodyBold.fontWeight,
              lineHeight: theme.typography.body.lineHeight,
            },
            task.completed ? styles.completedTitle : null,
          ]}
        >
          {task.title}
        </Text>
        {dueLabel ? (
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.caption.fontSize,
              lineHeight: theme.typography.caption.lineHeight,
              marginTop: theme.spacing.xs,
            }}
          >
            {dueLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export const TaskItem = React.memo(TaskItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  checkboxEmpty: {
    backgroundColor: 'transparent',
  },
  body: {
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
});
