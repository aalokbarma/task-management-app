export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string } | undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type NavigationParamList = AuthStackParamList & AppStackParamList;
