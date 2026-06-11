'use client'
import { useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">🔐 Welcome Back</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        <p className="text-center text-gray-400 mt-4">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:underline">Sign Up</Link>
        </p>
      </div>
    </main>
  )
}