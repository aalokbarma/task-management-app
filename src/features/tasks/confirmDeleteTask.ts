import { Alert } from 'react-native';

export function confirmDeleteTask(onConfirm: () => void): void {
  Alert.alert(
    'Delete task',
    'This task will be removed from this device.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ],
  );
}
