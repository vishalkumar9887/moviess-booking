import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      toast.success('Login successful!')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center mr-4 px-4">
  <div className="max-w-md w-full space-y-15 bg-white rounded-2xl shadow-2xl p-8 transform transition-transform duration-500 hover:scale-105">
    <div className="text-center">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-md">
        Sign in to your account
      </h2>
      <p className="text-gray-600 text-sm">
        Or{' '}
        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
          create a new account
        </Link>
      </p>
    </div>
    <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 bg-gray-100 placeholder-gray-500"
          />
        </div>
        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 bg-gray-100 placeholder-gray-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform transition-transform duration-300 hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      {/* Demo Account Info */}
      <div className="bg-purple-50 p-4 rounded-xl text-purple-900 text-sm">
        <h4 className="font-medium mb-1">Demo Account</h4>
        <p>Email: demo@movie.com<br />Password: Password123</p>
      </div>
    </form>
  </div>
</div>
  )
}
export default Login
