import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Leaf, Eye, EyeOff, UserPlus, Tractor, ShoppingBag, CheckCircle, MapPin, Phone } from 'lucide-react'

const STEPS = {
  buyer:  ['Account Type', 'Personal Info', 'Security'],
  farmer: ['Account Type', 'Personal Info', 'Farm Details', 'Security'],
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('buyer')
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', password2: '',
    farm_name: '', location: '', phone: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { toast.error('Passwords do not match!'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const result = await register({ ...form, role })
      toast.success(result.message || 'Account created successfully! 🎉')
      if (role === 'farmer') navigate('/farmer')
      else navigate('/buyer')
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(msg => toast.error(msg))
      else toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const f = (field) => ({
    value: form[field],
    onChange: (e) => setForm(prev => ({ ...prev, [field]: e.target.value })),
  })

  const benefits = role === 'farmer'
    ? ['List unlimited products', 'AI-powered price suggestions', 'Real-time demand forecasting', 'Manage orders easily', 'Detailed analytics dashboard']
    : ['Browse 500+ farm products', 'AI-curated recommendations', 'Direct from verified farmers', 'Track orders in real-time', 'Competitive fresh prices']

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #071328 0%, #040D1C 60%, #07132A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>

        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'380px', height:'380px', borderRadius:'50%', background:`radial-gradient(circle, ${role==='farmer' ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)'} 0%, transparent 70%)` }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 6px 18px rgba(16,185,129,0.35)' }}>
              <Leaf size={20} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>AgriMarket AI</span>
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <p className="text-sm font-bold mb-3 uppercase tracking-widest" style={{ color: role === 'farmer' ? '#34D399' : '#93C5FD' }}>
            {role === 'farmer' ? '🌾 Farmer Benefits' : '🛒 Buyer Benefits'}
          </p>
          <h2 className="text-4xl font-bold mb-4 leading-tight" style={{ color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>
            {role === 'farmer' ? 'Grow your farm\nbusiness with AI' : 'Fresh produce,\ndirect from farms'}
          </h2>
          <p className="mb-8" style={{ color: '#8BA3C4', fontSize: '15px', lineHeight: '1.6' }}>
            {role === 'farmer'
              ? 'Join thousands of verified farmers selling directly to buyers with AI-powered tools.'
              : 'Discover fresh, high-quality agricultural products sourced directly from verified farmers.'}
          </p>

          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={b} className="flex items-center gap-3 animate-fade-in-left"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: role === 'farmer' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', border: `1px solid ${role==='farmer' ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.25)'}` }}>
                  <CheckCircle size={12} style={{ color: role === 'farmer' ? '#34D399' : '#93C5FD' }} />
                </div>
                <span style={{ color: '#8BA3C4', fontSize: '14px' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Trusted by farmers and buyers across India
          </p>
          <div className="flex items-center gap-2 mt-2">
            {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#F59E0B', fontSize: '14px' }}>★</span>)}
            <span style={{ color: 'var(--text-sec)', fontSize: '13px', marginLeft: '4px' }}>4.9 / 5 average</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 overflow-auto">
        <div className="w-full max-w-[420px] animate-fade-in-up">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>
              Create account
            </h1>
            <p style={{ color: '#8BA3C4', fontSize: '14px' }}>Join AgriMarket AI — it's free</p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-6"
            style={{
              background: 'rgba(12,29,58,0.60)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
            }}>

            {/* Role toggle */}
            <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { value: 'buyer',  label: 'Buyer',  icon: ShoppingBag, color: '#3B82F6' },
                { value: 'farmer', label: 'Farmer', icon: Tractor,     color: '#10B981' },
              ].map(({ value, label, icon: Icon, color }) => (
                <button key={value} type="button" onClick={() => setRole(value)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={role === value ? {
                    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                    color, border: `1px solid ${color}30`, boxShadow: `0 4px 12px ${color}14`
                  } : { color: 'var(--text-muted)', border: '1px solid transparent' }}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">First name</label>
                  <input className="input-field" placeholder="Ramesh" {...f('first_name')} required />
                </div>
                <div>
                  <label className="field-label">Last name</label>
                  <input className="input-field" placeholder="Patel" {...f('last_name')} required />
                </div>
              </div>

              <div>
                <label className="field-label">Email address</label>
                <input type="email" className="input-field" placeholder="you@example.com" {...f('email')} required />
              </div>

              <div>
                <label className="field-label">Phone number</label>
                <div className="relative">
                  <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>
                    <Phone size={15} />
                  </span>
                  <input className="input-field" style={{ paddingLeft: '40px' }}
                    placeholder="+91 98765 43210" {...f('phone')} />
                </div>
              </div>

              {role === 'farmer' && (
                <>
                  <div>
                    <label className="field-label">Farm name <span style={{ color:'var(--red)' }}>*</span></label>
                    <input className="input-field" placeholder="Green Valley Farm"
                      {...f('farm_name')} required />
                  </div>
                  <div>
                    <label className="field-label">Location</label>
                    <div className="relative">
                      <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>
                        <MapPin size={15} />
                      </span>
                      <input className="input-field" style={{ paddingLeft: '40px' }}
                        placeholder="Village, District, State" {...f('location')} />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input-field"
                    style={{ paddingRight: '44px' }}
                    placeholder="Min 8 characters" {...f('password')} required minLength={8} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="field-label">Confirm password</label>
                <input type="password" className="input-field" placeholder="Repeat password" {...f('password2')} required />
              </div>

              {role === 'farmer' && (
                <div className="flex items-start gap-3 p-3 rounded-2xl"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <span style={{ fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>⚠️</span>
                  <p style={{ color: '#FCD34D', fontSize: '12px', lineHeight: '1.5' }}>
                    Farmer accounts require <strong>admin approval</strong> before listing products. You'll be notified once verified.
                  </p>
                </div>
              )}

              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}
                style={{ padding: '13px', fontSize: '15px', marginTop: '4px' }}>
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <UserPlus size={17} />}
                {loading ? 'Creating account...' : `Create ${role === 'farmer' ? 'Farmer' : 'Buyer'} Account`}
              </button>
            </form>
          </div>

          <p style={{ textAlign:'center', color:'var(--text-sec)', fontSize:'14px', marginTop:'20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--green-light)', fontWeight:700, textDecoration:'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
