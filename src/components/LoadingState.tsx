import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingState({ 
  message = 'Loading...', 
  submessage,
  size = 'md',
  className = '',
  fullScreen = false
}: LoadingStateProps) {
  const containerClasses = fullScreen 
    ? 'min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  const spinnerSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <LoadingSpinner size={spinnerSize} className="mx-auto mb-4 text-blue-600" />
        <p className="text-gray-900 font-medium">{message}</p>
        {submessage && (
          <p className="text-gray-600 text-sm mt-2">{submessage}</p>
        )}
      </div>
    </div>
  );
}
