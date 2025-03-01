
import React from 'react';
import { RegisterForm } from '@/components/RegisterForm';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';

const Register = () => {
  const handleQuickRegister = () => {
    // This would be called when the quick access button is clicked
    console.log("Quick access register requested");
  };
  
  return (
    <AuthFormWrapper 
      type="register" 
      buttonText="Quick Register" 
      onButtonClick={handleQuickRegister}
    >
      <RegisterForm />
    </AuthFormWrapper>
  );
};

export default Register;
