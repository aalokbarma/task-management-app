import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Input, Screen } from '../../../components';
import { useTheme } from '../../../theme';
import type { AppError, CreateTaskInput, UpdateTaskInput } from '../../../types';
import {
  mapTaskFieldErrors,
  type TaskFieldErrors,
} from '../taskFieldErrors';
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
} from '../validateTask';
import { DueAtField } from './DueAtField';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialTitle?: string;
  initialDescription?: string;
  initialDueAt?: string;
  isSubmitting: boolean;
  formError: AppError | null;
  onSubmitCreate: (input: CreateTaskInput) => void | Promise<void>;
  onSubmitUpdate: (input: UpdateTaskInput) => void | Promise<void>;
  onDismissFormError: () => void;
  completed?: boolean;
  onToggleComplete?: () => void | Promise<void>;
  onDelete?: () => void;
}

function parseInitialDueAt(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function TaskForm({
  mode,
  initialTitle = '',
  initialDescription = '',
  initialDueAt,
  isSubmitting,
  formError,
  onSubmitCreate,
  onSubmitUpdate,
  onDismissFormError,
  completed = false,
  onToggleComplete,
  onDelete,
}: TaskFormProps): React.JSX.Element {
  const theme = useTheme();
  const descriptionRef = useRef<React.ComponentRef<typeof Input>>(null);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [dueAt, setDueAt] = useState<Date | null>(parseInitialDueAt(initialDueAt));
  const [fieldErrors, setFieldErrors] = useState<TaskFieldErrors>({});

  function handleTitleChange(value: string): void {
    setTitle(value);
    if (formError) {
      onDismissFormError();
    }
    if (fieldErrors.title) {
      setFieldErrors(current => ({ ...current, title: undefined }));
    }
  }

  function handleSubmit(): void {
    onDismissFormError();
    const dueAtIso = dueAt ? dueAt.toISOString() : undefined;

    if (mode === 'create') {
      const validation = validateCreateTaskInput({
        title,
        description,
        dueAt: dueAtIso,
      });
      if (!validation.success) {
        setFieldErrors(mapTaskFieldErrors(validation.error));
        return;
      }

      setFieldErrors({});
      onSubmitCreate(validation.data);
      return;
    }

    const validation = validateUpdateTaskInput({
      title,
      description,
      dueAt: dueAtIso ?? '',
    });
    if (!validation.success) {
      setFieldErrors(mapTaskFieldErrors(validation.error));
      return;
    }

    setFieldErrors({});
    onSubmitUpdate(validation.data);
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoider}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.h2.fontSize,
            fontWeight: theme.typography.h2.fontWeight,
            lineHeight: theme.typography.h2.lineHeight,
            marginBottom: theme.spacing.lg,
          }}
        >
          {mode === 'create' ? 'Add task' : 'Edit task'}
        </Text>
        {formError ? (
          <Text
            style={{
              color: theme.colors.danger,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              marginBottom: theme.spacing.md,
            }}
          >
            {formError.message}
          </Text>
        ) : null}
        <Input
          label="Title"
          value={title}
          onChangeText={handleTitleChange}
          placeholder="What needs to be done?"
          error={fieldErrors.title}
          autoCapitalize="sentences"
          autoCorrect
          returnKeyType="next"
          editable={!isSubmitting}
          onSubmitEditing={() => descriptionRef.current?.focus()}
          style={{ marginBottom: theme.spacing.md }}
        />
        <Input
          ref={descriptionRef}
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional details"
          autoCapitalize="sentences"
          autoCorrect
          multiline
          numberOfLines={4}
          editable={!isSubmitting}
          style={{ marginBottom: theme.spacing.md }}
        />
        <DueAtField
          value={dueAt}
          error={fieldErrors.dueAt}
          disabled={isSubmitting}
          onChange={setDueAt}
        />
        <View style={{ marginTop: theme.spacing.sm }}>
          <Button
            label={mode === 'create' ? 'Create task' : 'Save changes'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
        {mode === 'edit' && onToggleComplete ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Button
              label={completed ? 'Mark as incomplete' : 'Mark as complete'}
              variant="secondary"
              disabled={isSubmitting}
              onPress={() => {
                onToggleComplete();
              }}
            />
          </View>
        ) : null}
        {mode === 'edit' && onDelete ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Button
              label="Delete task"
              variant="danger"
              disabled={isSubmitting}
              onPress={onDelete}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avoider: {
    flexGrow: 1,
  },
});
