import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBookOpen } from 'react-icons/fi'
import { login } from '../services/api'
import Footer from '../components/Footer'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('teacher@school.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login({ email, password })

    setLoading(false)

    if (success) {
      navigate('/dashboard')
    } else {
      setError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiBookOpen className="text-white text-xl" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">
              School Fee Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Teacher / Admin Login</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="teacher@school.com"
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-xs text-center text-gray-400">
              Demo credentials — teacher@school.com / admin123
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login
