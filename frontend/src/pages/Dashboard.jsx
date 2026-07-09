import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';

// Material Icons
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MedicationIcon from '@mui/icons-material/Medication';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import LoopIcon from '@mui/icons-material/Loop';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InboxIcon from '@mui/icons-material/Inbox';
import ShieldIcon from '@mui/icons-material/Shield';

import { getDashboardStats, getOrders } from '../services/orderService';
import { getLowStockMedicines } from '../services/medicineService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadData = async () => {
    try {
      const [statsRes, ordersRes, lowStockRes] = await Promise.all([
        getDashboardStats(),
        getOrders({ limit: 6, sort: 'createdAt:desc' }),
        getLowStockMedicines(),
      ]);
      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data);
      setLowStockMeds(lowStockRes.data.data);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const STAT_CARDS = [
    {
      icon: <ReceiptLongIcon />,
      label: 'Order Hari Ini',
      value: stats?.orders?.total ?? 0,
      color: 'info.main',
      bgColor: 'rgba(59, 130, 246, 0.12)'
    },
    {
      icon: <HourglassEmptyIcon />,
      label: 'Menunggu',
      value: stats?.orders?.pending ?? 0,
      color: 'warning.main',
      bgColor: 'rgba(245, 158, 11, 0.12)'
    },
    {
      icon: <AutorenewIcon />,
      label: 'Sedang Diproses',
      value: stats?.orders?.processing ?? 0,
      color: 'primary.main',
      bgColor: 'rgba(14, 165, 233, 0.12)'
    },
    {
      icon: <CheckCircleIcon />,
      label: 'Selesai Hari Ini',
      value: stats?.orders?.completed ?? 0,
      color: 'success.main',
      bgColor: 'rgba(34, 197, 94, 0.12)'
    },
    {
      icon: <MedicationIcon />,
      label: 'Total Jenis Obat',
      value: stats?.medicines?.total ?? 0,
      color: 'secondary.main',
      bgColor: 'rgba(99, 102, 241, 0.12)'
    },
    {
      icon: <WarningIcon />,
      label: 'Stok Kritis',
      value: stats?.medicines?.lowStock ?? 0,
      color: 'error.main',
      bgColor: 'rgba(239, 68, 68, 0.12)'
    },
  ];

  const sortedLowStockMeds = [...lowStockMeds].sort((a, b) => {
    const pctA = a.minStock > 0 ? (a.stock / a.minStock) : 0;
    const pctB = b.minStock > 0 ? (b.stock / b.minStock) : 0;
    return pctA - pctB;
  });

  const getProgressInfo = (stock, minStock) => {
    if (minStock <= 0) return { pct: 100, color: '#22c55e', label: 'Aman' };
    const pct = Math.round(Math.min((stock / minStock) * 100, 100));

    if (stock === 0) return { pct, color: '#ef4444', label: 'Habis' };
    if (pct <= 25) return { pct, color: '#ef4444', label: 'Kritis' };
    if (pct <= 50) return { pct, color: '#f97316', label: 'Sangat Rendah' };
    if (pct <= 75) return { pct, color: '#facc15', label: 'Stok Rendah' };
    return { pct, color: '#22c55e', label: 'Hampir Aman' };
  };

  return (
    <Box className="animate-fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Ringkasan aktivitas farmasi hari ini
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', px: 2, py: 0.75, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
          <RefreshIcon sx={{ fontSize: 16, color: 'text.secondary', animation: 'spin 10s linear infinite' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Sinkron otomatis setiap 30 detik • Terakhir diperbarui {lastUpdated}
          </Typography>
        </Box>
      </Box>

      {/* Actionable Warning Banner (replaced emoji with clean layout and standard warning icon prefix) */}
      {(stats?.medicines?.lowStock ?? 0) > 0 && (
        <Alert
          severity="error"
          icon={<WarningIcon sx={{ color: '#fff' }} />}
          sx={{
            mb: 3,
            borderRadius: '12px',
            bgcolor: 'error.main',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap',
              gap: 2,
              p: 0
            },
            '& .MuiAlert-icon': {
              color: '#fff',
              opacity: 0.9
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
            {stats.medicines.lowStock} obat memiliki stok kritis dan perlu segera direstok.
          </Typography>
          <Button
            variant="contained"
            size="small"
            component={RouterLink}
            to="/medicines?lowStock=true"
            sx={{
              color: 'error.main',
              fontWeight: 800,
              bgcolor: 'common.white',
              borderRadius: '8px',
              px: 2.5,
              py: 0.5,
              textTransform: 'none',
              boxShadow: 'none',
              minHeight: '36px',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 'none'
              }
            }}
          >
            Lihat Obat
          </Button>
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {STAT_CARDS.map((s, i) => (
          <Grid item xs={12} sm={4} md={2} key={i}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  borderColor: s.color,
                }
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: s.color,
                    bgcolor: s.bgColor,
                    mb: 1.5,
                  }}
                >
                  {s.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1, color: 'text.primary' }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dashboard Insights Section (Replaced raw emojis with proper MUI icons) */}
      <Box sx={{ mb: 4, p: 2.5, bgcolor: 'action.hover', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 855, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
          <LightbulbIcon sx={{ color: 'warning.main' }} fontSize="small" /> Rekomendasi & Wawasan Sistem
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: '8px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {(stats?.orders?.pending ?? 0) === 0 ? (
                <>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Tidak ada order poli yang tertunda hari ini.
                  </Typography>
                </>
              ) : (
                <>
                  <WarningIcon color="warning" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Ada {stats?.orders?.pending} order menunggu persetujuan.
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: '8px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {(stats?.medicines?.lowStock ?? 0) === 0 ? (
                <>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Stok seluruh jenis obat aman dan mencukupi.
                  </Typography>
                </>
              ) : (
                <>
                  <WarningIcon color="error" />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {stats?.medicines?.lowStock} jenis obat perlu segera restok.
                  </Typography>
                </>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: '8px', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TrendingUpIcon color="secondary" />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Total jenis obat aktif: <strong>{stats?.medicines?.total ?? 0} obat</strong>.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '600px', borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', mr: 1 }}>
                  Order Terbaru
                </Typography>
                <Button
                  component={RouterLink}
                  to="/orders"
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    flexShrink: 0
                  }}
                >
                  Lihat Semua
                </Button>
              </Box>

              {/* Empty state (replaced emoji with MUI InboxIcon) */}
              {recentOrders.length === 0 ? (
                <Box sx={{ py: 6, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 2 }}>
                  <InboxIcon sx={{ fontSize: '3.5rem', color: 'text.disabled', opacity: 0.6 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                      Belum ada order masuk hari ini
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: '320px', mx: 'auto' }}>
                      Semua order baru dari poliklinik atau IGD akan muncul di sini.
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    to="/orders/new"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      mt: 1,
                      minHeight: '40px',
                      px: 3
                    }}
                  >
                    Buat Order
                  </Button>
                </Box>
              ) : (
                <TableContainer sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '490px', pr: 1.5 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>No. Order</TableCell>
                        <TableCell>Poliklinik</TableCell>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell sx={{ fontWeight: 700 }}>
                            <Link component={RouterLink} to={`/orders/${order.id}`} underline="hover" color="primary.main">
                              {order.orderNumber}
                            </Link>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{order.polyclinic}</TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {new Date(order.orderDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '600px', borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2.5, gap: 5.3 }}>
                <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary' }}>
                  Obat Stok Rendah
                </Typography>
                <Button
                  component={RouterLink}
                  to="/medicines?lowStock=true"
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    flexShrink: 0
                  }}
                >
                  Semua
                </Button>
              </Box>

              {/* Empty state (replaced emoji with MUI ShieldIcon) */}
              {sortedLowStockMeds.length === 0 ? (
                <Box sx={{ py: 6, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 2 }}>
                  <ShieldIcon sx={{ fontSize: '3rem', color: 'success.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Semua stok aman
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflowY: 'auto', pr: 2.5, maxHeight: '490px' }}>
                  {sortedLowStockMeds.slice(0, 15).map((med) => {
                    const info = getProgressInfo(med.stock, med.minStock);
                    return (
                      <Box
                        key={med.id}
                        sx={{
                          p: 2,
                          bgcolor: 'action.hover',
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: info.color,
                            transform: 'translateX(3px)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', flexGrow: 1, wordBreak: 'break-word' }}>
                            {med.name}
                          </Typography>
                          <Chip
                            label={info.label}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              borderRadius: '6px',
                              height: '22px',
                              bgcolor: `${info.color}15`,
                              color: info.color,
                              border: `1px solid ${info.color}30`,
                              flexShrink: 0
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Stok: <strong>{med.stock}</strong> / {med.minStock} {med.unit}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: info.color }}>
                            {info.pct}%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={info.pct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'action.selected',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: info.color,
                              borderRadius: 4,
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions Section */}
      <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', mb: 2 }}>
            Aksi Cepat
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to="/orders/new"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                minHeight: '42px',
                px: 3,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              Buat Order Baru
            </Button>
            <Button
              component={RouterLink}
              to="/medicines"
              variant="contained"
              color="secondary"
              startIcon={<MedicationIcon />}
              sx={{
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                minHeight: '42px',
                px: 3,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              Tambah / Kelola Obat
            </Button>
            <Button
              component={RouterLink}
              to="/orders?status=pending"
              variant="outlined"
              color="warning"
              startIcon={<ListIcon />}
              sx={{
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                minHeight: '42px',
                px: 3
              }}
            >
              Lihat Order Pending
            </Button>
            <Button
              component={RouterLink}
              to="/orders?status=processing"
              variant="outlined"
              color="info"
              startIcon={<LoopIcon />}
              sx={{
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                minHeight: '42px',
                px: 3
              }}
            >
              Lihat Sedang Diproses
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
