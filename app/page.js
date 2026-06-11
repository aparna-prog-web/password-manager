import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">🔐 Password Manager</h1>
        <p className="text-gray-400 text-lg mb-8">
          Store and manage your passwords securely
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
            Login
          </Link>
          <Link href="/signup"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  )
}