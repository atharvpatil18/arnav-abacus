import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, helperText, ...props }, ref) => {
    const id = props.id || props.name;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-900"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
            {
              'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500':
                error,
            },
            className,
          )}
          {...props}
        />
        {helperText ? (
          <p
            className={clsx('mt-1 text-sm', {
              'text-red-600': error,
              'text-gray-500': !error,
            })}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };