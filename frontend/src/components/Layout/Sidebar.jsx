import { NavLink, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const NAV_ITEMS = [
  { to: '/', icon: <DashboardIcon />, label: 'Dashboard', exact: true },
  { to: '/orders', icon: <ReceiptLongIcon />, label: 'Order Obat' },
  { to: '/medicines', icon: <MedicalServicesIcon />, label: 'Manajemen Obat' },
];

export default function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        width: '260px',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
      }}
    >
      {/* Clickable Header Logo */}
      <Box
        component={Link}
        to="/"
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textDecoration: 'none',
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(14, 165, 233, 0.3)',
          }}
        >
          <LocalHospitalIcon />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Farmasi RSUD
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            Sistem Order Obat
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            mb: 1,
            display: 'block',
            fontWeight: 600,
            color: 'text.disabled',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Menu Utama
        </Typography>
        
        <List component="nav" disablePadding>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.exact}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                color: 'text.secondary',
                '&.active': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover:not(.active)': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider />
      
      <Box sx={{ p: 2.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
          RSUD Syarifah Ambami
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Rato Ebu Bangkalan
        </Typography>
      </Box>
    </Box>
  );
}
