'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';

export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedDuration?: number; // in seconds
  actualDuration?: number; // in seconds
}

interface ProgressBarProps {
  steps: ProgressStep[];
  currentStepId?: string;
  className?: string;
}

export function ProgressBar({ steps, currentStepId, className }: ProgressBarProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <Check className="h-4 w-4 text-white" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-white animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-white" />;
      default:
        return <span className="text-xs font-medium text-gray-500">{index + 1}</span>;
    }
  };

  const getStepClasses = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'in_progress':
        return 'bg-primary-600 border-primary-600';
      case 'failed':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-gray-200 border-gray-300';
    }
  };

  const getConnectorClasses = (index: number) => {
    const step = steps[index];
    const nextStep = steps[index + 1];
    
    if (step.status === 'completed') {
      return 'bg-green-500';
    }
    if (step.status === 'in_progress' && nextStep) {
      return 'bg-gradient-to-r from-primary-600 to-gray-300';
    }
    return 'bg-gray-300';
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            ความคืบหน้าโดยรวม
          </span>
          <span className="text-sm text-gray-500">
            {completedSteps} จาก {totalSteps} ขั้นตอน
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step-by-Step Progress */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Step Content */}
            <div className="flex items-start">
              {/* Step Icon */}
              <div className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0',
                getStepClasses(step)
              )}>
                {getStepIcon(step, index)}
              </div>

              {/* Step Details */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={clsx(
                    'text-sm font-medium',
                    step.status === 'completed' ? 'text-green-700' :
                    step.status === 'in_progress' ? 'text-primary-700' :
                    step.status === 'failed' ? 'text-red-700' :
                    'text-gray-500'
                  )}>
                    {step.title}
                  </h4>
                  
                  {/* Duration Display */}
                  {(step.estimatedDuration || step.actualDuration) && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.status === 'completed' && step.actualDuration ? (
                        <span>{step.actualDuration}s</span>
                      ) : step.estimatedDuration ? (
                        <span>~{step.estimatedDuration}s</span>
                      ) : null}
                    </div>
                  )}
                </div>
                
                <p className={clsx(
                  'text-sm mt-1',
                  step.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                )}>
                  {step.description}
                </p>

                {/* Progress indicator for current step */}
                {step.status === 'in_progress' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-primary-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={clsx(
                'absolute left-4 top-8 w-0.5 h-6 -ml-px',
                getConnectorClasses(index)
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}