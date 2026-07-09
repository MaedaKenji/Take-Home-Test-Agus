import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import { useColorMode } from '../../context/ColorModeContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Ringkasan aktivitas farmasi hari ini' },
  '/orders': { title: 'Order Obat', subtitle: 'Daftar dan manajemen pesanan obat dari poli' },
  '/orders/new': { title: 'Buat Order Baru', subtitle: 'Tambah pesanan obat dari poliklinik' },
  '/medicines': { title: 'Manajemen Obat', subtitle: 'Data stok dan daftar obat yang tersedia' },
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();
  const { user, logout } = useAuth();

  const getPageInfo = () => {
    if (location.pathname.startsWith('/orders/') && location.pathname.includes('/edit')) {
      return { title: 'Edit Order', subtitle: 'Ubah data pesanan obat' };
    }
    if (location.pathname.startsWith('/orders/') && location.pathname !== '/orders/new') {
      return { title: 'Detail Order', subtitle: 'Informasi lengkap pesanan obat' };
    }
    return PAGE_TITLES[location.pathname] || { title: 'Farmasi RSUD', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();
  const now = new Date();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <Box
      component="header"
      sx={{
        height: '64px',
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Brand Logo on mobile */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1.25,
            textDecoration: 'none',
            color: 'text.primary',
          }}
        >
          <Box
            sx={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 12px rgba(14, 165, 233, 0.3)',
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: '1.25rem' }} />
          </Box>
          <Box sx={{ mr: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.875rem' }}>
              Farmasi RSUD
            </Typography>
          </Box>
        </Box>

        {/* Divider on mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, height: '24px', width: '1px', bgcolor: 'divider' }} />

        <Box>
          <Typography variant="h3" sx={{ fontSize: '1.125rem', color: 'text.primary', fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Date/time */}
        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 400 }}>
            {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </Typography>
        </Box>

        {/* Theme toggle */}
        <Tooltip title={mode === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
          <IconButton onClick={toggleColorMode} color="inherit" size="small">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        {/* User avatar & name */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, borderLeft: 1, borderColor: 'divider' }}>
            <Avatar
              sx={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                fontSize: '0.75rem', fontWeight: 700,
              }}
            >
              {getInitials(user.displayName || user.username)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user.displayName || user.username}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {user.role}
              </Typography>
            </Box>
            <Tooltip title="Keluar">
              <IconButton size="small" onClick={handleLogout} color="inherit" id="logout-btn">
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}
