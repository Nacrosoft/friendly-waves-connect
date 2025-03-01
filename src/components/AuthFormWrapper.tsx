
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface AuthFormWrapperProps {
  children: ReactNode;
  buttonText: string;
  onButtonClick: () => void;
}

export const AuthFormWrapper = ({ 
  children, 
  buttonText, 
  onButtonClick 
}: AuthFormWrapperProps) => {
  return (
    <div className="space-y-4">
      {children}
      
      <div className="flex items-center gap-2 mt-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Quick access code..."
            className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
        <Button onClick={onButtonClick} className="shrink-0">
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
