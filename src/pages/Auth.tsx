
import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthFormWrapper } from '@/components/AuthFormWrapper';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Redirect to home if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" />;
  }

  const handleQuickAccess = () => {
    toast({
      title: "Quick Access",
      description: "Quick access feature is not implemented yet",
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary rounded-full p-3">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Messenger</h1>
          <p className="text-muted-foreground mt-2">Connect with friends and family</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <div className="flex gap-2 mb-6">
            <Button 
              variant={isLogin ? "default" : "outline"} 
              className="flex-1"
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Login
            </Button>
            <Button 
              variant={!isLogin ? "default" : "outline"} 
              className="flex-1"
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Register
            </Button>
          </div>
          
          <AuthFormWrapper 
            buttonText={isLogin ? "Quick Login" : "Quick Register"} 
            onButtonClick={handleQuickAccess}
          >
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </AuthFormWrapper>
        </div>
      </div>
    </div>
  );
};

export default Auth;
