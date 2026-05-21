export default function StatCard({ icon: Icon, label, value, sub, color = '#10B981', trend }) {
  const glow = `${color}20`
  const border = `${color}20`

  return (
    <div className="stat-card animate-fade-in-up" style={{ overflow: 'hidden' }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: '-32px', right: '-32px',
        width: '120px', height: '120px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: `linear-gradient(145deg, ${color}18, ${color}0A)`,
          border: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${glow}`,
        }}>
          <Icon size={22} style={{ color }} />
        </div>

        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            ...(trend >= 0
              ? { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }
              : { background: 'rgba(239,68,68,0.12)',  color: '#FCA5A5', border: '1px solid rgba(252,165,165,0.2)' }
            )
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p style={{
        fontSize: '30px', fontWeight: 800, color: '#EEF2FF',
        fontFamily: 'Outfit, sans-serif', lineHeight: 1, marginBottom: '6px'
      }}>
        {value}
      </p>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-sec)' }}>{label}</p>
      {sub && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>}
    </div>
  )
}
