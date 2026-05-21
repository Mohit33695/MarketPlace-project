import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { UserCheck, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchFarmers = () => {
    api.get('/auth/admin/users/?role=farmer').then(r => setFarmers(r.data.results || r.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchFarmers() }, [])

  const handleAction = async (id, action) => {
    try {
      const { data } = await api.patch(`/auth/admin/farmers/${id}/approve/`, { action })
      toast.success(data.message)
      fetchFarmers()
    } catch { toast.error('Action failed') }
  }

  const filtered = filter === 'all' ? farmers
    : filter === 'pending' ? farmers.filter(f => !f.is_approved)
    : farmers.filter(f => f.is_approved)

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><UserCheck size={24} className="text-green-400" /> Farmer Management</h1>
            <p className="text-slate-400 text-sm mt-1">Approve or reject farmer accounts</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${filter === f ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="flex justify-center h-40 items-center"><div className="spinner" /></div> : (
          <div className="space-y-3">
            {filtered.map(f => (
              <div key={f.id} className="glass p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                    {f.first_name?.[0]}{f.last_name?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-sm">{f.first_name} {f.last_name}</p>
                      <span className={`badge ${f.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                        {f.is_approved ? <><CheckCircle size={10} /> Approved</> : <><Clock size={10} /> Pending</>}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{f.email}</p>
                    {f.farmer_profile && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        🌾 {f.farmer_profile.farm_name} · 📍 {f.farmer_profile.location || 'Location not set'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!f.is_approved ? (
                    <>
                      <button onClick={() => handleAction(f.id, 'approve')}
                        className="btn-primary py-2 px-4 text-xs">
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => handleAction(f.id, 'reject')}
                        className="btn-danger py-2 px-4 text-xs">
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleAction(f.id, 'reject')}
                      className="btn-danger py-2 px-4 text-xs">
                      <XCircle size={13} /> Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="glass p-12 text-center">
                <UserCheck size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No {filter !== 'all' ? filter : ''} farmers found</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
