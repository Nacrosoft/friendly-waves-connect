
import React, { ReactNode, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AuthFormWrapperProps {
  children: ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  inputValue?: string;
}

export const AuthFormWrapper = ({ 
  children, 
  buttonText = 'Submit',
  onButtonClick = () => {},
  onInputChange,
  inputValue = ''
}: AuthFormWrapperProps) => {
  return (
    <div className="space-y-6">
      {children}
      
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-3">Quick access</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Input 
              type="text" 
              placeholder="Enter quick access code..."
              className="w-full"
              value={inputValue}
              onChange={onInputChange}
            />
          </div>
          <Button 
            onClick={onButtonClick} 
            className="w-full sm:w-auto bg-[#6C63FF] hover:bg-[#5A52D5]"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
