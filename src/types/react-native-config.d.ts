declare module 'react-native-config' {
  export interface NativeConfig {
    ENVIRONMENT?: string;
    APP_NAME?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
