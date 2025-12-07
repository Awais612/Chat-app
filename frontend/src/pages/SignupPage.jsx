import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuthStore } from '../store/useAuthStore';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 backdrop-blur-xl bg-white/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <PersonAddIcon sx={{ color: 'white', fontSize: 32 }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              label="Full Name"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#9333ea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9333ea',
                  },
                },
              }}
            />

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
                    borderColor: '#9333ea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9333ea',
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
              helperText="Password must be at least 8 characters"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#9333ea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9333ea',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSigningUp}
              sx={{
                backgroundColor: '#9333ea',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                '&:hover': {
                  backgroundColor: '#7e22ce',
                  boxShadow: '0 6px 16px rgba(147, 51, 234, 0.4)',
                },
                '&:disabled': {
                  backgroundColor: '#94a3b8',
                },
              }}
            >
              {isSigningUp ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
