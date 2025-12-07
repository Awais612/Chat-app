import { CircularProgress } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <CircularProgress size={60} thickness={4} />
    </div>
  );
};

export default LoadingSpinner;
