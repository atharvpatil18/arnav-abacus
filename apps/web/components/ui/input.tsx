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
            'block w-full rounded-xl border-slate-200 bg-slate-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:bg-white transition-all duration-200 sm:text-sm',
            {
              'border-rose-300 text-rose-900 placeholder-rose-300 focus:border-rose-500 focus:ring-rose-500 bg-rose-50':
                error,
            },
            className,
          )}
          {...props}
        />
        {helperText ? (
          <p
            className={clsx('mt-1 text-sm', {
              'text-rose-600': error,
              'text-slate-500': !error,
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