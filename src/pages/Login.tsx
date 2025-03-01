
import React from 'react';
import { LoginForm } from '@/components/LoginForm';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  
  const handleLogin = () => {
    // This would be called when the quick access button is clicked
    console.log("Quick access login requested");
  };
  
  return (
    <AuthFormWrapper 
      type="login" 
      buttonText="Quick Login" 
      onButtonClick={handleLogin}
    >
      <LoginForm />
    </AuthFormWrapper>
  );
};

export default Login;
