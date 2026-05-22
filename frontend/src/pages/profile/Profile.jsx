import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { User, Save, MapPin, Phone, Briefcase, Mail, Leaf, ShieldAlert, Award } from 'lucide-react'

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
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content">
        
        {/* Header */}
        <div style={{ marginBottom: '28px' }} className="animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <User size={18} style={{ color: '#34D399' }} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: 800, color: '#EEF2FF' }}>
              My Profile
            </h1>
          </div>
          <p style={{ color: 'var(--text-sec)', fontSize: '14px', marginLeft: '50px' }}>Manage your account settings and contact preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          
          {/* Avatar / Profile Summary Card */}
          <div className="glass animate-fade-in-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{
              width: '88px', height: '88px', borderRadius: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 900, color: '#EEF2FF', marginBottom: '16px',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 12px 24px rgba(0,0,0,0.25)',
              background: user?.role === 'farmer' 
                ? 'linear-gradient(135deg, #10B981, #047857)' 
                : user?.role === 'admin' 
                ? 'linear-gradient(135deg, #8B5CF6, #5B21B6)' 
                : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#EEF2FF', marginBottom: '4px' }}>
              {user?.first_name} {user?.last_name}
            </h2>
            
            <p style={{ color: 'var(--text-sec)', fontSize: '12.5px', marginBottom: '14px', wordBreak: 'break-all' }}>
              {user?.email}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: 'center' }}>
              <span className={`badge ${user?.role === 'farmer' ? 'badge-green' : user?.role === 'admin' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '10px', padding: '4px 12px' }}>
                {user?.role === 'farmer' && <Leaf size={10} style={{ marginRight: '4px' }} />}
                {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
              </span>

              {user?.role === 'farmer' && (
                <span className={`badge ${user?.is_approved ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '10px', padding: '4px 12px' }}>
                  {user?.is_approved ? (
                    <>
                      <Award size={10} style={{ marginRight: '4px' }} /> Verified Farmer
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={10} style={{ marginRight: '4px' }} /> Pending Verification
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Configuration Form Card */}
          <div className="animate-fade-in-up">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Personal Info */}
              <div className="glass" style={{ padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '14.5px', fontWeight: 800, color: '#EEF2FF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={15} style={{ color: 'var(--text-sec)' }} /> Account Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] mb-4">
                  <div>
                    <label className="field-label">First Name</label>
                    <input className="input-field" {...f('first_name')} placeholder="First name" />
                  </div>
                  <div>
                    <label className="field-label">Last Name</label>
                    <input className="input-field" {...f('last_name')} placeholder="Last name" />
                  </div>
                </div>

                <div>
                  <label className="field-label">Registered Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: '40px', opacity: 0.55, cursor: 'not-allowed' }} value={user?.email || ''} disabled title="Registered email address cannot be edited." />
                  </div>
                </div>
              </div>

              {/* Farmer Profile Settings */}
              {user?.role === 'farmer' && (
                <div className="glass" style={{ padding: '24px' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '14.5px', fontWeight: 800, color: '#EEF2FF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Leaf size={15} style={{ color: '#34D399' }} /> Farm Information
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="field-label">Farm / Business Name</label>
                      <div style={{ position: 'relative' }}>
                        <Briefcase size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={{ paddingLeft: '40px' }} {...f('farm_name')} placeholder="e.g. Green Acres Organic Farm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                      <div>
                        <label className="field-label">Location / City</label>
                        <div style={{ position: 'relative' }}>
                          <MapPin size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input className="input-field" style={{ paddingLeft: '40px' }} {...f('location')} placeholder="e.g. Nashik" />
                        </div>
                      </div>
                      <div>
                        <label className="field-label">State</label>
                        <input className="input-field" {...f('state')} placeholder="e.g. Maharashtra" />
                      </div>
                    </div>

                    <div>
                      <label className="field-label">Mobile Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={{ paddingLeft: '40px' }} {...f('phone')} placeholder="10-digit mobile number" />
                      </div>
                    </div>

                    <div>
                      <label className="field-label">About the Farm / Organic Bio</label>
                      <textarea className="input-field" rows={3} {...f('bio')} placeholder="Tell customers about your fresh harvests, organic certifications, farming methodologies..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Buyer Profile Settings */}
              {user?.role === 'buyer' && (
                <div className="glass" style={{ padding: '24px' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '14.5px', fontWeight: 800, color: '#EEF2FF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} style={{ color: '#93C5FD' }} /> Default Shipping Address
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="field-label">Home Address</label>
                      <textarea className="input-field" rows={2} {...f('address')} placeholder="House/Flat No., Building Name, Street Area" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                      <div>
                        <label className="field-label">City</label>
                        <input className="input-field" {...f('city')} placeholder="e.g. Mumbai" />
                      </div>
                      <div>
                        <label className="field-label">PIN Code</label>
                        <input className="input-field" {...f('pincode')} placeholder="e.g. 400001" />
                      </div>
                    </div>

                    <div>
                      <label className="field-label">Contact Phone Number</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" style={{ paddingLeft: '40px' }} {...f('phone')} placeholder="10-digit mobile number" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary" style={{ width: 'fit-content', padding: '12px 24px', fontSize: '14px' }}>
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {saving ? 'Saving changes...' : 'Save Settings'}
              </button>

            </form>
          </div>

        </div>
      </main>
    </div>
  )
}
