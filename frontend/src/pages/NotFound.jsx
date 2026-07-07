import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>404</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/" className="btn btn-primary">← Kembali ke Dashboard</Link>
    </div>
  );
}
