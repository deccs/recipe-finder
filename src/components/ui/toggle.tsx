import { motion } from 'framer-motion';
import { useState } from 'react';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ isOn, onToggle, label, disabled = false, className = '' }: ToggleProps) {
  const toggleClasses = `relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
    isOn ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`;

  const handleToggle = () => {
    if (!disabled) {
      onToggle();
    }
  };

  return (
    <div className="flex items-center">
      {label && (
        <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
      <button
        type="button"
        className={toggleClasses}
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={isOn}
      >
        <motion.span
          className="inline-block w-4 h-4 transform bg-white rounded-full"
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
          initial={false}
          animate={{ x: isOn ? '1.25rem' : '0.25rem' }}
        />
      </button>
    </div>
  );
}