import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { AuthCredentials, AuthStackParamList } from '../../../types';
import { AuthCredentialsForm } from '../components/AuthCredentialsForm';
import {
  authErrorCleared,
  selectAuthError,
  selectIsAuthSubmitting,
} from '../authSlice';
import { signInRequested } from '../authThunks';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsAuthSubmitting);
  const formError = useAppSelector(selectAuthError);

  function handleSubmit(credentials: AuthCredentials): void {
    dispatch(signInRequested(credentials));
  }

  return (
    <AuthCredentialsForm
      title="Log In"
      submitLabel="Log in"
      secondaryLabel="Create an account"
      isSubmitting={isSubmitting}
      formError={formError}
      passwordContentType="password"
      onSubmit={handleSubmit}
      onSecondaryPress={() => navigation.navigate('SignUp')}
      onDismissFormError={() => dispatch(authErrorCleared())}
    />
  );
}
