import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { bookingsAPI, paymentsAPI } from '../services/api'
import toast from 'react-hot-toast'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookingData, setBookingData] = useState(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [guestData, setGuestData] = useState({ name: '', email: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otpToken, setOtpToken] = useState('')
  const [otp, setOtp] = useState('')

  useEffect(() => {
    const storedBookingData = localStorage.getItem('bookingData')
    if (storedBookingData) {
      const data = JSON.parse(storedBookingData)
      setBookingData({
        movie: {
          title: data?.movie?.title || ' Movie',
          ...data?.movie
        },
        showtime: {
          startTime: data?.showtime?.startTime || '',
          theater: data?.showtime?.theater || '',
          city: data?.showtime?.city || ''
        },
        seats: data?.seats || [],
        amount: data?.amount || 0,
        showtimeId: data?.showtimeId
      })
    } else {
      toast.error('No booking data found')
      navigate('/')
    }
  }, [navigate])

  const handlePayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const bookingRequest = {
        showtimeId: bookingData.showtimeId,
        seats: JSON.stringify(bookingData.seats),
        amount: bookingData.amount
      }

      if (!user) {
        if (!guestData.name || !guestData.email) {
          toast.error('Please fill in your details')
          setIsProcessing(false)
          return
        }
        bookingRequest.guestName = guestData.name
        bookingRequest.guestEmail = guestData.email
      }

      const bookingResponse = await bookingsAPI.create(bookingRequest)
      const booking = bookingResponse.data

      const updatedBookingData = { ...bookingData, id: booking.id }
      setBookingData(updatedBookingData)
      localStorage.setItem('bookingData', JSON.stringify(updatedBookingData))

      const paymentRequest = {
        bookingId: booking.id,
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        cardholderName: paymentData.cardholderName,
        simulateOTP: true
      }

      const paymentResponse = await paymentsAPI.initiateMock(paymentRequest)

      if (paymentResponse.data.status === 'OTP_REQUIRED') {
        setOtpToken(paymentResponse.data.otp_token)
        setShowOTP(true)
        toast.success('OTP sent to your mobile number')
      } else {
        handlePaymentSuccess(paymentResponse.data)
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.error || 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOTPConfirmation = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const response = await paymentsAPI.confirmOTP({ otp_token: otpToken, otp })
      if (response.data.status === 'SUCCESS') {
        handlePaymentSuccess(response.data)
      } else {
        toast.error(response.data.message || 'Payment failed')
      }
    } catch (error) {
      console.error('OTP confirmation error:', error)
      toast.error(error.response?.data?.error || 'OTP verification failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = (paymentResult) => {
    toast.success('Payment successful! Booking confirmed.')
    localStorage.removeItem('bookingData')
    navigate(`/profile?booking=${paymentResult.booking_id}`)
  }

  if (!bookingData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-12">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 mr-6"
        >
          <ArrowLeft className="h-6 w-6 inline-block mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Checkout
        </h1>
      </div>

      {/* Combined Container */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Payment Form */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
          {showOTP ? (
            <form onSubmit={handleOTPConfirmation} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use OTP: <strong>123456</strong> for testing</p>
              </div>
              <button
                type="submit"
                disabled={isProcessing || !/^\d{6}$/.test(otp)}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePayment} className="space-y-5">
              {!user && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Your Details</h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={guestData.name}
                    onChange={(e) => setGuestData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={guestData.email}
                    onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              )}
              <input
                type="text"
                placeholder="Card Number"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Expiry Date"
                  value={paymentData.expiryDate}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={paymentData.cardholderName}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Pay ₹${bookingData.amount || 0}`}
              </button>
            </form>
          )}
        </div>

        {/* Booking Summary */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{bookingData.movie?.title}</h3>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium text-sm">
                {bookingData.showtime?.startTime
                  ? new Date(bookingData.showtime.startTime).toLocaleDateString() +
                    ' ' +
                    new Date(bookingData.showtime.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theater:</span>
              <span className="font-medium text-sm">
                {bookingData.showtime?.theater || 'N/A'}, {bookingData.showtime?.city || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seats:</span>
              <span className="font-medium text-sm">
                {bookingData.seats.map(seat => `${String.fromCharCode(64 + seat.row)}${seat.seat}`).join(', ')}
              </span>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <span>Total Amount:</span>
              <span>₹{bookingData.amount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
