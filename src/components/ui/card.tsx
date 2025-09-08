import { motion, HTMLMotionProps } from 'framer-motion';
import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'transition'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  transition?: {
    duration: number;
    delay?: number;
  };
}

export function Card({ children, className = '', hover = true, transition = { duration: 0.3 }, ...props }: CardProps) {
  const cardClasses = `bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 ${className}`;

  return (
    <motion.div
      className={cardClasses}
      whileHover={hover ? { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
}