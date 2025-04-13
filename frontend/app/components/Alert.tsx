interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-600',
    error: 'bg-red-50 border-red-200 text-red-600'
  };

  return (
    <div className={`border px-4 py-3 rounded relative ${styles[type]}`} role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
} 