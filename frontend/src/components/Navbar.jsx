import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Home, Ticket } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 shadow-2xl">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-3xl font-extrabold text-white transform transition-transform duration-500 hover:scale-110 hover:rotate-2"
          >
            <Ticket className="h-10 w-10 text-yellow-300 drop-shadow-lg" />
            <span className="text-white drop-shadow-md">MovieBooking</span>
          </Link>

          {/* Menu */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-white hover:text-yellow-300 transition-transform duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <Home className="h-6 w-6" />
              <span className="font-medium">Home</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-white hover:text-yellow-300 transition-transform duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <User className="h-6 w-6" />
                  <span className="font-medium">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-white hover:text-red-400 transition-transform duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <LogOut className="h-6 w-6" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-300 transition-transform duration-300 transform hover:scale-105 hover:-translate-y-1 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-yellow-500 text-gray-900 px-5 py-2 rounded-2xl font-semibold shadow-lg transform transition-transform duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-2xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
