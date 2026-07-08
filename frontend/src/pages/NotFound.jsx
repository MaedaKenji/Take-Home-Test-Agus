import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '4.5rem', fontWeight: 800, color: 'text.disabled' }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Halaman Tidak Ditemukan
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Maaf, halaman yang Anda cari tidak dapat ditemukan.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        color="primary"
      >
        Kembali ke Dashboard
      </Button>
    </Box>
  );
}
