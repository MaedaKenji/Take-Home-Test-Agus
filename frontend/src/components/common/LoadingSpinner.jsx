export default function LoadingSpinner({ text = 'Memuat data...', fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{text}</p>
      </div>
    );
  }
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}
