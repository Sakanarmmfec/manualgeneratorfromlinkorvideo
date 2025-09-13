import React from 'react';
import { clsx } from 'clsx';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <label
      className={clsx(
        'block text-sm font-medium text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
};