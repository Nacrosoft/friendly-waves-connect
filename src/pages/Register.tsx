
import React from 'react';
import { RegisterForm } from '@/components/RegisterForm';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';

const Register = () => {
  return (
    <AuthFormWrapper type="register">
      <RegisterForm />
    </AuthFormWrapper>
  );
};

export default Register;
