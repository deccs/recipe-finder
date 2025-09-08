import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinnerClasses = `${sizeClasses[size]} ${className}`;

  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={spinnerClasses}
        style={{
          borderTop: '3px solid rgba(0, 0, 0, 0.1)',
          borderRight: '3px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '3px solid rgba(0, 0, 0, 0.1)',
          borderLeft: '3px solid #3b82f6',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}