import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Checkbox({ 
  label, 
  description, 
  className, 
  id,
  checked,
  ...props 
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          className={clsx(
            'h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500',
            className
          )}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label 
              htmlFor={checkboxId}
              className="font-medium text-gray-700 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}