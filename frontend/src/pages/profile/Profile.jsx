import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { User, Save, MapPin, Phone, Briefcase, Mail, Leaf } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    // farmer fields
    farm_name: '',
    location: '',
    state: '',
    phone: '',
    bio: '',
    // buyer fields
    address: '',
    city: '',
    pincode: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        farm_name: user.farmer_profile?.farm_name || '',
        location: user.farmer_profile?.location || '',
        state: user.farmer_profile?.state || '',
        phone: user.farmer_profile?.phone || user.buyer_profile?.phone || '',
        bio: user.farmer_profile?.bio || '',
        address: user.buyer_profile?.address || '',
        city: user.buyer_profile?.city || '',
        pincode: user.buyer_profile?.pincode || '',
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.patch('/auth/profile/', form)
      updateUser(data)
      toast.success('Profile updated successfully! ✅')
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const f = (field) => ({
    value: form[field],
    onChange: (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  })

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={24} className="text-green-400" /> My Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your personal information and account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar card */}
          <div className="glass p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-4"
              style={{ background: user?.role === 'farmer' ? 'linear-gradient(135deg,#16a34a,#15803d)' : user?.role === 'admin' ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <h2 className="text-lg font-bold text-white">{user?.first_name} {user?.last_name}</h2>
            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
            <span className={`badge mt-3 ${user?.role === 'farmer' ? 'badge-green' : user?.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
              {user?.role === 'farmer' && <Leaf size={10} />}
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
            {user?.role === 'farmer' && (
              <span className={`badge mt-2 ${user?.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                {user?.is_approved ? '✓ Verified Farmer' : '⏳ Pending Approval'}
              </span>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal info */}
              <div className="glass p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <User size={14} className="text-slate-400" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
                    <input className="input-field" {...f('first_name')} placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
                    <input className="input-field" {...f('last_name')} placeholder="Last name" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <Mail size={11} /> Email Address
                  </label>
                  <input className="input-field opacity-60" value={user?.email || ''} disabled
                    title="Email cannot be changed" />
                </div>
              </div>

              {/* Farmer-specific */}
              {user?.role === 'farmer' && (
                <div className="glass p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Leaf size={14} className="text-green-400" /> Farm Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Briefcase size={11} /> Farm Name
                      </label>
                      <input className="input-field" {...f('farm_name')} placeholder="e.g. Green Valley Farm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                          <MapPin size={11} /> Location / City
                        </label>
                        <input className="input-field" {...f('location')} placeholder="e.g. Nashik" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
                        <input className="input-field" {...f('state')} placeholder="e.g. Maharashtra" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Phone size={11} /> Phone Number
                      </label>
                      <input className="input-field" {...f('phone')} placeholder="10-digit mobile number" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Bio / Description</label>
                      <textarea className="input-field" rows={3} {...f('bio')}
                        placeholder="Tell buyers about your farm and farming practices..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Buyer-specific */}
              {user?.role === 'buyer' && (
                <div className="glass p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <MapPin size={14} className="text-blue-400" /> Delivery Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Default Delivery Address</label>
                      <textarea className="input-field" rows={2} {...f('address')}
                        placeholder="House No., Street, Area" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                        <input className="input-field" {...f('city')} placeholder="Mumbai" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">PIN Code</label>
                        <input className="input-field" {...f('pincode')} placeholder="400001" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                        <Phone size={11} /> Phone Number
                      </label>
                      <input className="input-field" {...f('phone')} placeholder="10-digit mobile number" />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary py-3 px-6">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
