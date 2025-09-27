import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { bookingsAPI } from "../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      if (user) {
        const response = await bookingsAPI.getMyBookings();
        setBookings(response.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
          My Bookings
        </h1>

        <p className="text-gray-600">
          {user ? `Welcome back, ${user.name}!` : "Your booking history"}
        </p>
      </div>

      {searchParams.get("booking") && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-md">
          <div className="flex items-center">
            <Ticket className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Booking Confirmed!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Your booking has been successfully confirmed. Booking ID:{" "}
                {searchParams.get("booking")}
              </p>
            </div>
          </div>
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-3xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {booking.showtime?.movie?.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(
                            booking.showtime?.startTime
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(
                            booking.showtime?.startTime
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <div className="mt-2 text-lg font-semibold text-gray-900">
                      ₹{booking.amount}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Theater Details
                    </h4>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {booking.showtime?.theater}, {booking.showtime?.city}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Seats</h4>
                    <div className="text-gray-600">
                      {booking.seats ? (
                        JSON.parse(booking.seats).map((seat, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 px-2 py-1 rounded text-sm mr-1"
                          >
                            {String.fromCharCode(64 + seat.row)}
                            {seat.seat}
                          </span>
                        ))
                      ) : (
                        <span>No seats selected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between text-sm text-gray-600">
                  <span>Booking ID: {booking.id}</span>
                  <span>
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't made any bookings yet. Start by browsing our movies!
          </p>
          <a
            href="/"
            className="
    inline-flex items-center px-5 py-2 text-sm font-medium rounded-xl
    text-white bg-gradient-to-r from-purple-600 via-pink-500 to-red-500
    shadow-[0_4px_6px_rgba(0,0,0,0.3),0_0_10px_rgba(255,255,255,0.2)]
    hover:shadow-[0_6px_8px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.4)]
    transform transition-transform duration-300 hover:scale-105
  "
          >
            Browse Movies
          </a>
        </div>
      )}
    </div>
  );
};

export default Profile;
