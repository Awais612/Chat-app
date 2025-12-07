import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 backdrop-blur-xl bg-white/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <LoginIcon sx={{ color: 'white', fontSize: 32 }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#0284c7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0284c7',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#0284c7',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0284c7',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoggingIn}
              sx={{
                backgroundColor: '#0284c7',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                '&:hover': {
                  backgroundColor: '#0369a1',
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)',
                },
                '&:disabled': {
                  backgroundColor: '#94a3b8',
                },
              }}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
