export interface User {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
