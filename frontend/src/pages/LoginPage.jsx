import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Selamat datang, ${user.displayName || user.username}!`);
      navigate('/', { replace: true });
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0a0f1e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient orbs */}
      <Box sx={{
        position: 'absolute', top: '15%', left: '10%', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '15%', right: '10%', width: 250, height: 250,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
      }} />

      <Card sx={{
        width: '100%',
        maxWidth: 420,
        mx: 2,
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 2,
              boxShadow: '0 0 30px rgba(14,165,233,0.4)',
            }}>
              <LocalHospitalIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 0.5 }}>
              Farmasi RSUD
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Sistem Order Obat — Syarifah Ambami
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#f1f5f9', mb: 2.5 }}>
              Masuk ke Sistem
            </Typography>

            <TextField
              id="login-username"
              fullWidth
              label="Username"
              size="small"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Masukkan username"
              autoComplete="username"
              autoFocus
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <TextField
              id="login-password"
              fullWidth
              label="Password"
              size="small"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Masukkan password"
              autoComplete="current-password"
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(v => !v)}
                        edge="end"
                        sx={{ color: '#94a3b8' }}
                        tabIndex={-1}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Button
              id="login-submit-btn"
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={!loading && <LoginIcon />}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                fontWeight: 700,
                fontSize: '1rem',
                py: 1.25,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284c7, #4f46e5)',
                  boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
                },
                '&:disabled': {
                  opacity: 0.7,
                },
              }}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#64748b' }}>
            
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
