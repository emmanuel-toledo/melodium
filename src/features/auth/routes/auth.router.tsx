import { lazy } from 'react';
import type { RouteObject } from 'react-router';

import { AuthLayout } from '../layouts/auth.layout';

const LoginPage = lazy(() =>
  import('../pages/login-page').then((module) => ({ default: module.LoginPage })),
);

const RegisterPage = lazy(() =>
  import('../pages/register-page').then((module) => ({ default: module.RegisterPage })),
);

const ResetPasswordPage = lazy(() =>
  import('../pages/reset-password-page').then((module) => ({ default: module.ResetPasswordPage })),
);

export const authRoutes: RouteObject[] = [
  {
    Component: AuthLayout,
    children: [
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
      { path: '/reset-password', Component: ResetPasswordPage },
    ],
  },
];
