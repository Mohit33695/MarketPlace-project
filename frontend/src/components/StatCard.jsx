export default function StatCard({ icon: Icon, label, value, sub, color = '#10B981', trend }) {
  const glow   = `${color}22`
  const border = `${color}22`

  return (
    <div className="stat-card animate-fade-in-up">
      {/* Top-right glow orb */}
      <div style={{
        position: 'absolute', top: '-28px', right: '-28px',
        width: '110px', height: '110px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '13px',
          background: `linear-gradient(145deg, ${color}1A, ${color}0A)`,
          border: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 14px ${glow}`,
        }}>
          <Icon size={21} style={{ color }} />
        </div>

        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
            ...(trend >= 0
              ? { background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.18)' }
              : { background: 'rgba(239,68,68,0.1)',  color: '#FCA5A5', border: '1px solid rgba(252,165,165,0.18)' }
            )
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <p style={{
        fontSize: '28px', fontWeight: 800, color: '#EEF2FF',
        fontFamily: 'Outfit, sans-serif', lineHeight: 1, marginBottom: '5px',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </p>
      {/* Label */}
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-sec)' }}>{label}</p>
      {sub && <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>}
    </div>
  )
}
