import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Ringkasan aktivitas farmasi hari ini' },
  '/orders': { title: 'Order Obat', subtitle: 'Daftar dan manajemen pesanan obat dari poli' },
  '/orders/new': { title: 'Buat Order Baru', subtitle: 'Tambah pesanan obat dari poliklinik' },
  '/medicines': { title: 'Manajemen Obat', subtitle: 'Data stok dan daftar obat yang tersedia' },
};

export default function Navbar() {
  const location = useLocation();

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

  return (
    <header className="navbar">
      <div>
        <div className="navbar-title">{title}</div>
        {subtitle && <div className="navbar-subtitle">{subtitle}</div>}
      </div>
      <div className="navbar-actions">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
            {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </div>
        </div>
      </div>
    </header>
  );
}
