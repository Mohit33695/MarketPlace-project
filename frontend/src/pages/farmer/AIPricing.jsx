import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, Zap, DollarSign, BarChart2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

export default function FarmerAIPricing() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState(null)
  const [priceData, setPriceData] = useState(null)
  const [demandData, setDemandData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/products/my/').then(r => {
      const list = r.data.results || r.data
      setProducts(list)
      if (list.length > 0) setSelected(list[0])
    })
  }, [])

  useEffect(() => {
    if (selected) fetchAI(selected)
  }, [selected])

  const fetchAI = async (product) => {
    setLoading(true)
    setPriceData(null)
    setDemandData(null)
    try {
      const [p, d] = await Promise.all([
        api.get(`/ai/price-suggest/${product.id}/`),
        api.get(`/ai/demand/${product.id}/?days=7`),
      ])
      setPriceData(p.data)
      setDemandData(d.data)
    } catch { 
      toast.error('Failed to fetch AI insights') 
    } finally { 
      setLoading(false) 
    }
  }

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp size={18} style={{ color: '#34D399' }} />
    if (trend === 'down') return <TrendingDown size={18} style={{ color: '#FCA5A5' }} />
    return <Minus size={18} style={{ color: 'var(--text-muted)' }} />
  }

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header
          title="AI Pricing & Forecast"
          actions={<span className="ai-chip"><Zap size={11} /> ML Engine Active</span>}
        />
        <div className="content-area">

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          
          {/* Side Selector Card */}
          <div className="glass animate-fade-in-up" style={{ padding: '18px', minHeight: '340px' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              My Products
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {products.map(p => {
                const isActive = selected?.id === p.id
                return (
                  <button key={p.id} onClick={() => setSelected(p)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '14px',
                      border: '1px solid', cursor: 'pointer', transition: 'all 0.22s',
                      ...(isActive 
                        ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(139,92,246,0.06))', color: '#C4B5FD', borderColor: 'rgba(139,92,246,0.25)' }
                        : { background: 'rgba(255,255,255,0.02)', color: 'var(--text-sec)', borderColor: 'rgba(255,255,255,0.05)' }
                      )
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#EEF2FF';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.color = 'var(--text-sec)';
                      }
                    }}>
                    <p style={{ fontSize: '13.5px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                      {p.name}
                    </p>
                    <p style={{ fontSize: '11px', opacity: isActive ? 0.95 : 0.6 }}>₹{p.price}/{p.unit}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* AI Output Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {loading ? (
              <div className="glass" style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ borderTopColor: 'var(--violet)', marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-sec)', fontSize: '14px' }}>AI is calculating market averages and pricing points...</p>
              </div>
            ) : priceData && (
              <>
                {/* Suggestion Card */}
                <div className="glass animate-fade-in-up" style={{ padding: '24px' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: '#EEF2FF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={16} style={{ color: '#C4B5FD' }} /> Suggestion Analysis — {selected?.name}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    
                    {/* Block 1 */}
                    <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sec)', marginBottom: '6px' }}>Current Price</p>
                      <p style={{ fontSize: '24px', fontWeight: 900, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>
                        ₹{priceData.current_price}
                      </p>
                      <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>per {selected?.unit}</p>
                    </div>

                    {/* Block 2 */}
                    <div style={{ 
                      padding: '16px', borderRadius: '16px', 
                      background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.22)', 
                      textAlign: 'center', boxShadow: 'inset 0 0 16px rgba(139,92,246,0.1)'
                    }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#C4B5FD', marginBottom: '6px' }}>AI Suggested</p>
                      <p style={{ fontSize: '24px', fontWeight: 900, color: '#C4B5FD', fontFamily: 'Outfit, sans-serif' }}>
                        ₹{priceData.suggested_price}
                      </p>
                      <p style={{ fontSize: '10.5px', color: 'rgba(196,181,253,0.5)', marginTop: '2px' }}>per {selected?.unit}</p>
                    </div>

                    {/* Block 3 */}
                    <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-sec)', marginBottom: '6px' }}>Market Trend</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
                        <TrendIcon trend={priceData.trend} />
                        <span style={{ 
                          fontSize: '15px', fontWeight: 800, textTransform: 'capitalize',
                          color: priceData.trend === 'up' ? '#34D399' : (priceData.trend === 'down' ? '#FCA5A5' : 'var(--text-sec)') 
                        }}>
                          {priceData.trend}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confidence: {priceData.confidence}%</p>
                    </div>

                  </div>

                  {/* Confidence Slider bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-sec)', fontWeight: 600 }}>Confidence Factor</span>
                      <span style={{ color: '#C4B5FD', fontWeight: 800 }}>{priceData.confidence}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        width: `${priceData.confidence}%`,
                        background: 'linear-gradient(90deg, #8B5CF6, #3B82F6)',
                        boxShadow: '0 0 8px rgba(139,92,246,0.6)'
                      }} />
                    </div>
                  </div>

                </div>

                {/* 7-Day Demand Forecast Card */}
                {demandData && (
                  <div className="glass animate-fade-in-up" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: '#EEF2FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart2 size={16} style={{ color: '#34D399' }} /> 7-Day Demand Forecast
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${demandData.demand_level === 'High' ? 'badge-green' : demandData.demand_level === 'Medium' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '10px' }}>
                          {demandData.demand_level} Demand
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-sec)' }}>Avg Score: {demandData.average_demand}/100</span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: 210 }}>
                      <ResponsiveContainer>
                        <AreaChart data={demandData.forecast}>
                          <defs>
                            <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-sec)' }} />
                          <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-sec)' }} />
                          <Tooltip contentStyle={{ background: 'rgba(7,19,42,0.92)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
                            labelStyle={{ color: '#EEF2FF', fontWeight: 700 }}
                            formatter={(v) => [`${v}/100`, 'Demand Index']} />
                          <ReferenceLine y={70} stroke="#10B981" strokeDasharray="5 5" label={{ value: 'High', fill: '#10B981', fontSize: 10, position: 'top' }} />
                          <Area type="monotone" dataKey="demand_score" stroke="#34D399" fill="url(#forecastGlow)" strokeWidth={2.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <button onClick={() => fetchAI(selected)} className="btn-secondary" style={{ width: 'fit-content', padding: '10px 18px', fontSize: '13px' }}>
                  <RefreshCw size={14} /> Refresh AI Forecast
                </button>
              </>
            )}

          </div>

        </div>
        </div>
      </div>
    </div>
  )
}
