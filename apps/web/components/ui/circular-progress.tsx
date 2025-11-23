import { ComponentPropsWithoutRef, forwardRef } from 'react';

interface CircularProgressProps extends ComponentPropsWithoutRef<'div'> {
  size?: number;
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ size = 24, className, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-primary-600 ${className || ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
);