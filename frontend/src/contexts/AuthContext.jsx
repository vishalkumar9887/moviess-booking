import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Try to get user info from token (you could decode JWT here)
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        setUser(JSON.parse(userInfo))
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, email: userEmail, name, userId } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify({ email: userEmail, name, userId }))
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser({ email: userEmail, name, userId })
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password })
      const { token, email: userEmail, name: userName, userId } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify({ email: userEmail, name: userName, userId }))
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser({ email: userEmail, name: userName, userId })
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}