import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { moviesAPI } from "../services/api";
import toast from "react-hot-toast";

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowtimeDetails();
  }, [showtimeId]);

  const fetchShowtimeDetails = async () => {
    try {
      const moviesResponse = await moviesAPI.getAll();
      const movies = moviesResponse.data;

      let foundShowtime = null;
      for (const movie of movies) {
        if (movie.showtimes) {
          foundShowtime = movie.showtimes.find(
            (st) => st.id === parseInt(showtimeId)
          );
          if (foundShowtime) {
            foundShowtime.movie = movie;
            break;
          }
        }
      }

      if (foundShowtime) {
        setShowtime(foundShowtime);
        setSeatMap(JSON.parse(foundShowtime.seatMap || "[]"));
      } else {
        toast.error("Showtime not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching showtime:", error);
      toast.error("Failed to load showtime details");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat?.available) {
      setSelectedSeats((prev) => {
        const isSelected = prev.some(
          (s) => s.row === seat.row && s.seat === seat.seat
        );
        return isSelected
          ? prev.filter((s) => !(s.row === seat.row && s.seat === seat.seat))
          : [...prev, seat];
      });
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    const bookingData = {
      showtimeId: showtime.id,
      movieTitle: showtime.movie.title,
      theater: showtime.theater,
      city: showtime.city,
      startTime: showtime.startTime,
      seats: selectedSeats,
      amount: selectedSeats.length * 250,
    };

    localStorage.setItem("bookingData", JSON.stringify(bookingData));
    navigate("/checkout");
  };

  const renderSeatMap = () => {
    if (!seatMap.length)
      return <p className="text-center text-gray-500">No seat map available</p>;

    const rows = Math.max(...seatMap.map((seat) => seat.row));
    const seatsPerRow = Math.max(...seatMap.map((seat) => seat.seat));

    return (
      <div className="space-y-4">
        {/* Screen */}
        <div className="text-center mb-8">
          <div className="bg-gray-800 text-white py-2 px-8 rounded-lg inline-block drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] font-semibold">
            SCREEN
          </div>
        </div>

        {/* Seat Map */}
        <div className="space-y-2">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex + 1} className="flex justify-center space-x-1">
              <span className="w-8 text-center text-sm font-medium text-gray-600 self-center">
                {String.fromCharCode(65 + rowIndex)}
              </span>
              {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                const seat = seatMap.find(
                  (s) => s.row === rowIndex + 1 && s.seat === seatIndex + 1
                );
                const isSelected = selectedSeats.some(
                  (s) => s.row === seat?.row && s.seat === seat?.seat
                );

                return (
                  <button
                    key={seatIndex + 1}
                    onClick={() => handleSeatClick(seat)}
                    disabled={!seat?.available}
                    className={`w-8 h-8 rounded text-xs font-medium transition-transform duration-300 transform
    ${
      !seat?.available
        ? "bg-red-700 text-red-700 cursor-not-allowed"
        : isSelected
        ? "bg-gradient-to-r from-green-500 via-green-500 to-green-500 text-white shadow-lg  hover:scale-110 hover:shadow-xl"
        : "bg-gray-200 text-gray-700 hover:scale-110 hover:shadow-md hover:bg-gradient-to-r hover:from-purple-400 hover:via-pink-400 hover:to-red-400"
    }`}
                  >
                    {seatIndex + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Showtime not found</p>
        <button
          onClick={() => navigate("/")}
          className="text-primary-600 hover:text-primary-700 mt-4"
        >
          ← Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.3)]">
            {showtime.movie.title}
          </h1>
          <p className="text-gray-600">
            {new Date(showtime.startTime).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(showtime.startTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          <p className="text-gray-600">
            {showtime.theater}, {showtime.city}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-2xl p-6 transform transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_12px_24px_rgba(0,0,0,0.25)]">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.2)]">
              Select Seats
            </h2>
            {renderSeatMap()}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-6 transform transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_12px_24px_rgba(0,0,0,0.25)]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 drop-shadow-[1px_1px_2px_rgba(0,0,0,0.2)]">
              Booking Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Movie:</span>
                <span className="font-medium">{showtime.movie.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium text-sm">
                  {new Date(showtime.startTime).toLocaleDateString()}{" "}
                  {new Date(showtime.startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Theater:</span>
                <span className="font-medium text-sm">{showtime.theater}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Selected Seats:</span>
                <span className="font-medium">
                  {selectedSeats.length > 0 ? selectedSeats.length : 0}
                </span>
              </div>

              {selectedSeats.length > 0 && (
                <div className="space-y-1 mb-4">
                  {selectedSeats.map((seat, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {String.fromCharCode(64 + seat.row)}
                        {seat.seat}
                      </span>
                      <span className="text-gray-900">₹250</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total:</span>
                <span>₹{selectedSeats.length * 250}</span>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-transform duration-300 transform ${
                selectedSeats.length > 0
                  ? "bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:scale-105 hover:shadow-[0_6px_12px_rgba(0,0,0,0.4)]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue to Payment
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can also use our voice assistant to book tickets!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
