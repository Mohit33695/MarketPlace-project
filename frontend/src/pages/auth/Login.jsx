import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Leaf, Eye, EyeOff, LogIn, Zap, TrendingUp, ShieldCheck, Star } from 'lucide-react'

const DEMOS = [
  { role: 'farmer', emoji: '🌾', label: 'Farmer', email: 'farmer@demo.com', password: 'demo1234', color: '#10B981' },
  { role: 'buyer',  emoji: '🛒', label: 'Buyer',  email: 'buyer@demo.com',  password: 'demo1234', color: '#3B82F6' },
  { role: 'admin',  emoji: '⚙️', label: 'Admin',  email: 'admin@demo.com',  password: 'demo1234', color: '#8B5CF6' },
]

const FEATURES = [
  { icon: TrendingUp, color: '#10B981', title: 'AI Price Prediction', desc: 'ML-powered pricing to maximise earnings' },
  { icon: Zap,        color: '#F59E0B', title: 'Demand Forecasting',  desc: '7-day demand forecast with seasonal data' },
  { icon: ShieldCheck,color: '#3B82F6', title: 'Verified Farmers',    desc: 'Only approved farmers list products' },
  { icon: Star,       color: '#8B5CF6', title: 'Smart Recommendations', desc: 'Personalised AI picks for every buyer' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.first_name}! 👋`)
      if (user.role === 'farmer') navigate('/farmer')
      else if (user.role === 'buyer') navigate('/buyer')
      else navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (demo) => {
    setActiveDemo(demo.role)
    setForm({ email: demo.email, password: demo.password })
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left hero panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(150deg, #071328 0%, #040D1C 60%, #07132A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>

        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position:'absolute', top:'-80px', left:'-80px', width:'480px', height:'480px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'-60px', right:'-40px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', top:'45%', right:'20%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />

        {/* Logo */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center animate-pulse-green"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
              <Leaf size={22} color="white" />
            </div>
            <div>
              <span className="text-xl font-bold" style={{ color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>AgriMarket</span>
              <span className="text-xs font-semibold ml-2 ai-chip" style={{ fontSize: '10px', padding: '3px 8px' }}>AI</span>
            </div>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: '#34D399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              🌱 Smart Agricultural Marketplace
            </p>
            <h2 className="text-5xl font-bold leading-tight mb-5" style={{ color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>
              From Farm to
              <br />
              <span className="gradient-text">Doorstep,</span>
              <br />
              Powered by AI
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: '#8BA3C4', maxWidth: '440px' }}>
              Connect directly with verified farmers. Get AI-powered price insights, real-time demand forecasting, and personalized recommendations.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mt-10 stagger">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="animate-fade-in-up p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <p className="text-sm font-700 mb-1" style={{ color: '#EEF2FF', fontWeight: 700 }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#5A7599' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center gap-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {[['500+', 'Farmers'], ['10K+', 'Products'], ['95%', 'Satisfaction']].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold gradient-text">{num}</p>
              <p className="text-xs" style={{ color: '#5A7599' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-auto">

        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <Leaf size={20} color="white" />
            </div>
            <span className="text-xl font-bold gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>AgriMarket AI</span>
          </div>
        </div>

        <div className="w-full max-w-md animate-fade-in-up">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>
              Welcome back 👋
            </h1>
            <p style={{ color: '#8BA3C4', fontSize: '15px' }}>Sign in to continue to your dashboard</p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-7"
            style={{
              background: 'rgba(12,29,58,0.60)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
            }}>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label">Email address</label>
                <input id="login-email" type="email" className="input-field"
                  placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="field-label">Password</label>
                <div className="relative">
                  <input id="login-password" type={showPass ? 'text' : 'password'}
                    className="input-field" style={{ paddingRight: '48px' }}
                    placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', transition:'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}
                style={{ fontSize: '15px' }}>
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <LogIn size={16} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>QUICK DEMO</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Demo quick-fill */}
            <div className="grid grid-cols-3 gap-2">
              {DEMOS.map(demo => (
                <button key={demo.role} type="button" onClick={() => quickFill(demo)}
                  className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl transition-all"
                  style={{
                    background: activeDemo === demo.role ? `${demo.color}16` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeDemo === demo.role ? `${demo.color}35` : 'rgba(255,255,255,0.06)'}`,
                    transform: activeDemo === demo.role ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}>
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{demo.emoji}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: activeDemo === demo.role ? demo.color : 'var(--text-sec)', textTransform: 'capitalize' }}>
                    {demo.label}
                  </span>
                </button>
              ))}
            </div>
            {activeDemo && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '10px' }}>
                Credentials filled — click <strong style={{ color: 'var(--green)' }}>Sign In</strong> above ✓
              </p>
            )}
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-sec)', fontSize: '14px', marginTop: '24px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--green-light)', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--green-light)'}>
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
