import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Brain, TrendingUp, TrendingDown, Minus, RefreshCw, Zap } from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
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
    setPriceData(null); setDemandData(null)
    try {
      const [p, d] = await Promise.all([
        api.get(`/ai/price-suggest/${product.id}/`),
        api.get(`/ai/demand/${product.id}/?days=7`),
      ])
      setPriceData(p.data)
      setDemandData(d.data)
    } catch { toast.error('Failed to fetch AI data') }
    finally { setLoading(false) }
  }

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp size={18} className="text-green-400" />
    if (trend === 'down') return <TrendingDown size={18} className="text-red-400" />
    return <Minus size={18} className="text-slate-400" />
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain size={24} className="text-violet-400" /> AI Pricing & Demand
            </h1>
            <p className="text-slate-400 text-sm mt-1">AI-powered price suggestions and 7-day demand forecast</p>
          </div>
          <span className="ai-chip"><Zap size={12} /> Powered by ML</span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Product selector */}
          <div className="col-span-3">
            <div className="glass p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Products</p>
              <div className="space-y-1">
                {products.map(p => (
                  <button key={p.id} onClick={() => setSelected(p)}
                    className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all ${selected?.id === p.id
                      ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs opacity-60">₹{p.price}/{p.unit}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI results */}
          <div className="col-span-9 space-y-6">
            {loading ? (
              <div className="glass p-16 flex items-center justify-center">
                <div className="text-center">
                  <div className="spinner mx-auto mb-4" style={{ borderTopColor: '#8b5cf6' }} />
                  <p className="text-slate-400 text-sm">AI is analyzing market data...</p>
                </div>
              </div>
            ) : priceData && (
              <>
                {/* Price suggestion card */}
                <div className="glass p-6">
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Brain size={18} className="text-violet-400" /> Price Analysis — {selected?.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-slate-800/60">
                      <p className="text-xs text-slate-500 mb-1">Current Price</p>
                      <p className="text-2xl font-bold text-white">₹{priceData.current_price}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      <p className="text-xs text-violet-300 mb-1">AI Suggested Price</p>
                      <p className="text-2xl font-bold text-violet-300">₹{priceData.suggested_price}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-800/60">
                      <p className="text-xs text-slate-500 mb-1">Trend</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <TrendIcon trend={priceData.trend} />
                        <span className={`font-semibold text-sm ${priceData.trend === 'up' ? 'text-green-400' : priceData.trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                          {priceData.trend}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Confidence: {priceData.confidence}%</p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Model Confidence</span><span>{priceData.confidence}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${priceData.confidence}%`, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />
                    </div>
                  </div>
                </div>

                {/* Demand forecast chart */}
                {demandData && (
                  <div className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-green-400" /> 7-Day Demand Forecast
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${demandData.demand_level === 'High' ? 'badge-green' : demandData.demand_level === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>
                          {demandData.demand_level} Demand
                        </span>
                        <span className="text-xs text-slate-500">Avg: {demandData.average_demand}/100</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={demandData.forecast}>
                        <defs>
                          <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                          formatter={(v) => [`${v}/100`, 'Demand Score']} />
                        <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'High', fill: '#22c55e', fontSize: 11 }} />
                        <Area type="monotone" dataKey="demand_score" stroke="#22c55e" fill="url(#demandGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <button onClick={() => fetchAI(selected)} className="btn-secondary">
                  <RefreshCw size={15} /> Refresh Analysis
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
