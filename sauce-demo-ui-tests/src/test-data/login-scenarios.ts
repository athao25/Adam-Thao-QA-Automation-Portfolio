export interface LoginScenario {
  name: string;
  username: string;
  password: string;
  shouldSucceed: boolean;
  expectedError?: string;
}

export const LOGIN_SCENARIOS: LoginScenario[] = [
  {
    name: 'Standard User - Valid Login',
    username: 'standard_user',
    password: 'secret_sauce',
    shouldSucceed: true,
  },
  {
    name: 'Locked Out User - Account Locked',
    username: 'locked_out_user',
    password: 'secret_sauce',
    shouldSucceed: false,
    expectedError: 'Sorry, this user has been locked out',
  },
  {
    name: 'Problem User - Valid Login',
    username: 'problem_user',
    password: 'secret_sauce',
    shouldSucceed: true,
  },
  {
    name: 'Performance Glitch User - Valid Login',
    username: 'performance_glitch_user',
    password: 'secret_sauce',
    shouldSucceed: true,
  },
  {
    name: 'Error User - Valid Login',
    username: 'error_user',
    password: 'secret_sauce',
    shouldSucceed: true,
  },
  {
    name: 'Visual User - Valid Login',
    username: 'visual_user',
    password: 'secret_sauce',
    shouldSucceed: true,
  },
  {
    name: 'Invalid Username',
    username: 'invalid_user',
    password: 'secret_sauce',
    shouldSucceed: false,
    expectedError: 'Username and password do not match',
  },
  {
    name: 'Invalid Password',
    username: 'standard_user',
    password: 'wrong_password',
    shouldSucceed: false,
    expectedError: 'Username and password do not match',
  },
  {
    name: 'Empty Username',
    username: '',
    password: 'secret_sauce',
    shouldSucceed: false,
    expectedError: 'Username is required',
  },
  {
    name: 'Empty Password',
    username: 'standard_user',
    password: '',
    shouldSucceed: false,
    expectedError: 'Password is required',
  },
  {
    name: 'Empty Credentials',
    username: '',
    password: '',
    shouldSucceed: false,
    expectedError: 'Username is required',
  },
];
