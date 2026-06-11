'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import zxcvbn from 'zxcvbn'

export default function Dashboard() {
  const [passwords, setPasswords] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [showPassword, setShowPassword] = useState({})
  const [strength, setStrength] = useState(null)
  const [form, setForm] = useState({
    site_name: '', site_url: '', username: '', password: '', category: 'General', notes: ''
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { fetchPasswords() }, [])

  const fetchPasswords = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('passwords').select('*').eq('user_id', user.id)
    setPasswords(data || [])
  }

  const handleAdd = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('passwords').insert([{ ...form, user_id: user.id }])
    setForm({ site_name: '', site_url: '', username: '', password: '', category: 'General', notes: '' })
    setShowAdd(false)
    setStrength(null)
    fetchPasswords()
  }

  const handleDelete = async (id) => {
    await supabase.from('passwords').delete().eq('id', id)
    fetchPasswords()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let pwd = ''
    for (let i = 0; i < 16; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    setForm({ ...form, password: pwd })
    setStrength(zxcvbn(pwd))
  }

  const checkStrength = (pwd) => {
    setForm({ ...form, password: pwd })
    if (pwd) setStrength(zxcvbn(pwd))
    else setStrength(null)
  }

  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  const strengthLabel = ['Very Weak 🔴', 'Weak 🟠', 'Fair 🟡', 'Strong 🔵', 'Very Strong 🟢']
  const categories = ['All', 'General', 'Social', 'Work', 'Banking', 'Shopping']

  const filtered = passwords.filter(p =>
    (category === 'All' || p.category === category) &&
    (p.site_name.toLowerCase().includes(search.toLowerCase()) ||
     p.username.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🔐 My Passwords</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowAdd(!showAdd)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              + Add Password
            </button>
            <button onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
              Logout
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search passwords..."
            className="flex-1 bg-gray-800 px-4 py-2 rounded-lg outline-none" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-lg outline-none">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Add Password Form */}
        {showAdd && (
          <div className="bg-gray-900 p-6 rounded-xl mb-6">
            <h2 className="text-xl font-bold mb-4">Add New Password</h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Site Name *" value={form.site_name}
                onChange={e => setForm({...form, site_name: e.target.value})}
                className="bg-gray-800 px-4 py-2 rounded-lg outline-none" />
              <input placeholder="Site URL" value={form.site_url}
                onChange={e => setForm({...form, site_url: e.target.value})}
                className="bg-gray-800 px-4 py-2 rounded-lg outline-none" />
              <input placeholder="Username *" value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="bg-gray-800 px-4 py-2 rounded-lg outline-none" />
              <select value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                className="bg-gray-800 px-4 py-2 rounded-lg outline-none">
                {categories.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
              <div className="col-span-2">
                <div className="flex gap-2 mb-2">
                  <input placeholder="Password *" value={form.password}
                    onChange={e => checkStrength(e.target.value)}
                    className="flex-1 bg-gray-800 px-4 py-2 rounded-lg outline-none" />
                  <button onClick={generatePassword}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm">
                    ⚡ Generate
                  </button>
                </div>
                {/* Strength Meter */}
                {strength && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`h-2 flex-1 rounded ${i <= strength.score ? strengthColor[strength.score] : 'bg-gray-700'}`} />
                      ))}
                    </div>
                    <p className="text-sm">{strengthLabel[strength.score]} — Crack time: <span className="text-yellow-400">{strength.crack_times_display.offline_slow_hashing_1e4_per_second}</span></p>
                    {strength.feedback.warning && <p className="text-red-400 text-sm">⚠️ {strength.feedback.warning}</p>}
                  </div>
                )}
              </div>
              <textarea placeholder="Notes" value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                className="col-span-2 bg-gray-800 px-4 py-2 rounded-lg outline-none resize-none" rows={2} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAdd}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg">
                Save Password
              </button>
              <button onClick={() => setShowAdd(false)}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Password List */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-10">No passwords yet. Click "+ Add Password" to get started!</p>
          )}
          {filtered.map(p => (
            <div key={p.id} className="bg-gray-900 p-4 rounded-xl flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{p.site_name}</h3>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">{p.category}</span>
                </div>
                <p className="text-gray-400 text-sm">{p.username}</p>
                <p className="text-gray-500 text-sm font-mono">
                  {showPassword[p.id] ? p.password : '••••••••••••'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPassword({...showPassword, [p.id]: !showPassword[p.id]})}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">
                  {showPassword[p.id] ? '🙈 Hide' : '👁️ Show'}
                </button>
                <button onClick={() => navigator.clipboard.writeText(p.password)}
                  className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-sm">
                  📋 Copy
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}