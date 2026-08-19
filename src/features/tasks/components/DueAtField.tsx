import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Button } from '../../../components';
import { useTheme } from '../../../theme';
import { formatDueAt } from '../../../utils/formatDate';

interface DueAtFieldProps {
  value: Date | null;
  error?: string;
  disabled?: boolean;
  onChange: (next: Date | null) => void;
}

type PickerStep = 'hidden' | 'date' | 'time';

function mergeDateAndTime(datePart: Date, timePart: Date): Date {
  const next = new Date(datePart);
  next.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return next;
}

export function DueAtField({
  value,
  error,
  disabled = false,
  onChange,
}: DueAtFieldProps): React.JSX.Element {
  const theme = useTheme();
  const [step, setStep] = useState<PickerStep>('hidden');
  const pickerValue = value ?? new Date();

  function handleChange(event: DateTimePickerEvent, selected?: Date): void {
    if (event.type === 'dismissed') {
      setStep('hidden');
      return;
    }

    if (!selected) {
      return;
    }

    if (Platform.OS === 'android') {
      if (step === 'date') {
        onChange(mergeDateAndTime(selected, pickerValue));
        setStep('time');
        return;
      }

      onChange(mergeDateAndTime(value ?? selected, selected));
      setStep('hidden');
      return;
    }

    onChange(selected);
  }

  return (
    <View>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.caption.fontSize,
          marginBottom: theme.spacing.xs,
        }}
      >
        Due date
      </Text>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.body.fontSize,
          lineHeight: theme.typography.body.lineHeight,
          marginBottom: theme.spacing.sm,
        }}
      >
        {value ? formatDueAt(value.toISOString()) : 'None'}
      </Text>
      {error ? (
        <Text
          style={{
            color: theme.colors.danger,
            fontSize: theme.typography.caption.fontSize,
            marginBottom: theme.spacing.sm,
          }}
        >
          {error}
        </Text>
      ) : null}
      <View style={[styles.actions, { marginBottom: theme.spacing.md }]}>
        <Button
          label={value ? 'Change' : 'Set due date'}
          variant="secondary"
          disabled={disabled}
          onPress={() => setStep('date')}
          style={{ marginRight: theme.spacing.sm, marginBottom: theme.spacing.sm }}
        />
        {value ? (
          <Button
            label="Clear"
            variant="secondary"
            disabled={disabled}
            onPress={() => {
              setStep('hidden');
              onChange(null);
            }}
            style={{ marginBottom: theme.spacing.sm }}
          />
        ) : null}
        {Platform.OS === 'ios' && step !== 'hidden' ? (
          <Button
            label="Done"
            variant="secondary"
            disabled={disabled}
            onPress={() => setStep('hidden')}
            style={{ marginBottom: theme.spacing.sm }}
          />
        ) : null}
      </View>
      {step !== 'hidden' ? (
        <DateTimePicker
          value={pickerValue}
          mode={
            Platform.OS === 'ios'
              ? 'datetime'
              : step === 'time'
                ? 'time'
                : 'date'
          }
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

