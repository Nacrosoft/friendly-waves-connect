
import React, { useState } from 'react';
import { RegisterForm } from '@/components/RegisterForm';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';
import { UserPlus, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [quickAccessCode, setQuickAccessCode] = useState('');
  
  const handleQuickRegister = () => {
    if (quickAccessCode) {
      console.log("Quick access register requested with code:", quickAccessCode);
      // Here you could implement the quick registration functionality
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#F1F0FB]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-[#E5DEFF] p-3 rounded-full">
            <UserPlus className="h-8 w-8 text-[#6C63FF]" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        
        <AuthFormWrapper 
          buttonText="Quick Register" 
          onButtonClick={handleQuickRegister}
          onInputChange={(e) => setQuickAccessCode(e.target.value)}
          inputValue={quickAccessCode}
        >
          <RegisterForm />
        </AuthFormWrapper>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6C63FF] font-medium">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
