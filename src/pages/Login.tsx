
import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';
import { useAuth } from '@/context/AuthContext';
import { User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const [quickAccessCode, setQuickAccessCode] = useState('');
  
  const handleLogin = () => {
    if (quickAccessCode) {
      console.log("Quick access login requested with code:", quickAccessCode);
      // Here you could implement the quick access login functionality
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#F1F0FB]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-[#E5DEFF] p-3 rounded-full">
            <LogIn className="h-8 w-8 text-[#6C63FF]" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
        
        <AuthFormWrapper 
          buttonText="Quick Login" 
          onButtonClick={handleLogin}
          onInputChange={(e) => setQuickAccessCode(e.target.value)}
          inputValue={quickAccessCode}
        >
          <LoginForm />
        </AuthFormWrapper>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6C63FF] font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
