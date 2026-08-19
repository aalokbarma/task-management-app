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
import { signUpRequested } from '../authThunks';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({
  navigation,
}: Props): React.JSX.Element {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsAuthSubmitting);
  const formError = useAppSelector(selectAuthError);

  function handleSubmit(credentials: AuthCredentials): void {
    dispatch(signUpRequested(credentials));
  }

  return (
    <AuthCredentialsForm
      title="Sign Up"
      submitLabel="Create account"
      secondaryLabel="Already have an account? Log in"
      isSubmitting={isSubmitting}
      formError={formError}
      passwordContentType="newPassword"
      onSubmit={handleSubmit}
      onSecondaryPress={() => navigation.navigate('Login')}
      onDismissFormError={() => dispatch(authErrorCleared())}
    />
  );
}
