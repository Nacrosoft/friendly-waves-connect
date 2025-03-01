
import React from 'react';
import { LoginForm } from '@/components/LoginForm';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';

const Login = () => {
  return (
    <AuthFormWrapper type="login">
      <LoginForm />
    </AuthFormWrapper>
  );
};

export default Login;
