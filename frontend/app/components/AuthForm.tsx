import { ReactNode } from 'react';
import Alert from './Alert';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  error?: string;
  success?: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  footer?: ReactNode;
}

export default function AuthForm({
  title,
  subtitle,
  children,
  error,
  success,
  isLoading,
  onSubmit,
  submitText,
  footer
}: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}
          
          <div className="rounded-md shadow-sm -space-y-px">
            {children}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Chargement...' : submitText}
            </button>
          </div>

          {footer && (
            <div className="text-center">
              {footer}
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 