
import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';
import { useAuth } from '@/context/AuthContext';
import { User, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/utils/supabase';

const Login = () => {
  const { login } = useAuth();
  const [quickAccessCode, setQuickAccessCode] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleLogin = async () => {
    if (!quickAccessCode) {
      toast({
        title: 'Error',
        description: 'Please enter a quick access code',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Attempt to fetch user by the quick access code from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('stream_access_token', quickAccessCode)
        .single();
      
      if (error || !data) {
        console.error('Quick access error:', error);
        toast({
          title: 'Invalid Code',
          description: 'The quick access code you entered is invalid',
          variant: 'destructive'
        });
        return;
      }
      
      // If successful, log in the user with their credentials
      const success = await login(data.name, data.password);
      if (success) {
        toast({
          title: 'Logged in',
          description: `Welcome back, ${data.name}!`
        });
        navigate('/chat');
      }
    } catch (error) {
      console.error('Quick access login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An error occurred during login',
        variant: 'destructive'
      });
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
