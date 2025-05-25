import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

// Simple math-based CAPTCHA for demonstration
// In production, use a proper CAPTCHA service like reCAPTCHA
export function SimpleCaptcha({ onVerify, className }: SimpleCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
    setNum1(newNum1);
    setNum2(newNum2);
    setUserAnswer('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    const correctAnswer = num1 + num2;
    const isCorrect = parseInt(userAnswer) === correctAnswer;
    setIsVerified(isCorrect);
    onVerify(isCorrect);
  };

  const handleInputChange = (value: string) => {
    setUserAnswer(value);
    if (isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground">
            Security Check: What is {num1} + {num2}?
          </label>
          <div className="flex gap-2 mt-1">
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter answer"
              className={cn(
                'flex-1',
                isVerified && 'border-green-500 bg-green-50',
                userAnswer && !isVerified && parseInt(userAnswer) !== num1 + num2 && 'border-red-500'
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={!userAnswer}
            >
              Verify
            </Button>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateCaptcha}
          className="p-2"
          title="Generate new question"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {isVerified && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Security check passed</span>
        </div>
      )}

      {userAnswer && !isVerified && parseInt(userAnswer) !== num1 + num2 && (
        <div className="text-sm text-red-600">
          Incorrect answer. Please try again.
        </div>
      )}
    </div>
  );
}

export default SimpleCaptcha;
