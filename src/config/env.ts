import Config from 'react-native-config';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface AppEnv {
  environment: AppEnvironment;
  appName: string;
}

function resolveEnvironment(value: string | undefined): AppEnvironment {
  if (value === 'staging' || value === 'production') {
    return value;
  }
  return 'development';
}

export const env: AppEnv = {
  environment: resolveEnvironment(Config.ENVIRONMENT),
  appName: Config.APP_NAME ?? 'TaskApp',
};
