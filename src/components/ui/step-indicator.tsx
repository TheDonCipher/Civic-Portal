import React from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  variant?: 'default' | 'enhanced';
}

export function StepIndicator({
  steps,
  currentStep,
  className,
  variant = 'default',
}: StepIndicatorProps) {
  if (variant === 'enhanced') {
    return (
      <div className={cn('step-indicator-enhanced', className)}>
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'step-indicator-item flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 relative',
                      {
                        'completed bg-green-500 border-green-500 text-white shadow-lg':
                          isCompleted,
                        'active border-blue-500 text-blue-600 shadow-md':
                          isCurrent && !isCompleted,
                        'border-gray-300 text-gray-400 bg-white':
                          !isCompleted && !isCurrent,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Circle className="w-5 h-5 fill-current" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}

                    {/* Animated ring for current step */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse opacity-75" />
                    )}
                  </div>

                  <div className="mt-3 text-center max-w-[120px]">
                    <div
                      className={cn(
                        'text-sm font-semibold transition-colors duration-200',
                        {
                          'text-green-600': isCompleted,
                          'text-blue-600': isCurrent && !isCompleted,
                          'text-gray-500': !isCompleted && !isCurrent,
                        }
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div
                        className={cn(
                          'text-xs mt-1 transition-colors duration-200',
                          {
                            'text-green-500': isCompleted,
                            'text-blue-500': isCurrent && !isCompleted,
                            'text-gray-400': !isCompleted && !isCurrent,
                          }
                        )}
                      >
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>

                {!isLast && (
                  <div className="flex items-center justify-center px-4">
                    <div
                      className={cn(
                        'step-indicator-connector w-16 h-1 rounded-full transition-all duration-500',
                        {
                          'bg-gradient-to-r from-green-400 to-green-500':
                            isCompleted,
                          'bg-gradient-to-r from-blue-400 to-blue-500':
                            isCurrent,
                          'bg-gray-200': !isCompleted && !isCurrent,
                        }
                      )}
                    />
                    {(isCompleted || isCurrent) && (
                      <ArrowRight
                        className={cn(
                          'w-4 h-4 ml-2 transition-colors duration-200',
                          {
                            'text-green-500': isCompleted,
                            'text-blue-500': isCurrent,
                          }
                        )}
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="progress-enhanced h-full transition-all duration-700 ease-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          >
            <div className="progress-bar w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle and Content */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                    {
                      'bg-primary border-primary text-primary-foreground':
                        isCompleted,
                      'bg-primary border-primary text-primary-foreground':
                        isCurrent,
                      'bg-background border-muted-foreground/30 text-muted-foreground':
                        isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-2 text-center">
                  <p
                    className={cn('text-sm font-medium transition-colors', {
                      'text-primary': isCompleted || isCurrent,
                      'text-muted-foreground': isUpcoming,
                    })}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p
                      className={cn('text-xs mt-1 transition-colors', {
                        'text-muted-foreground': isCompleted || isCurrent,
                        'text-muted-foreground/60': isUpcoming,
                      })}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn('h-0.5 transition-colors duration-200', {
                      'bg-primary': step.id < currentStep,
                      'bg-muted-foreground/30': step.id >= currentStep,
                    })}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactStepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-200',
                  {
                    'bg-primary border-primary text-primary-foreground':
                      isCompleted,
                    'bg-primary border-primary text-primary-foreground':
                      isCurrent,
                    'bg-background border-muted-foreground/30 text-muted-foreground':
                      !isCompleted && !isCurrent,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8 mx-2 transition-colors duration-200',
                    {
                      'bg-primary': step.id < currentStep,
                      'bg-muted-foreground/30': step.id >= currentStep,
                    }
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div className="mt-3">
        {steps.map((step) => {
          if (step.id === currentStep) {
            return (
              <div key={step.id}>
                <p className="text-sm font-medium text-primary">{step.title}</p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
