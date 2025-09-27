import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, MapPin, Calendar } from "lucide-react";
import { moviesAPI } from "../services/api";
import toast from "react-hot-toast";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await moviesAPI.getById(id);
      setMovie(response.data);
    } catch (error) {
      console.error("Error fetching movie:", error);
      toast.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const formatShowtime = (startTime) => {
    const date = new Date(startTime);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Movie not found</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          ← Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link to="/" className="text-primary-600 hover:text-primary-700 mb-6 inline-block">
        ← Back to Movies
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Movie Info */}
        <div className="lg:col-span-1 transform transition-transform duration-300 hover:scale-105">
          <img
            src={`http://localhost:8080/posters/${movie.posterUrl}`}
            alt={movie.title}
            className="w-full rounded-3xl shadow-2xl mb-6"
          />

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 drop-shadow-sm">
              {movie.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-4 space-x-3">
              <Clock className="h-5 w-5" />
              <span>{movie.duration} min</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {movie.genre}
              </span>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Synopsis</h3>
              <p className="text-gray-600 leading-relaxed">{movie.synopsis}</p>
            </div>
          </div>
        </div>

        {/* Showtimes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Showtimes
            </h2>

            {movie.showtimes && movie.showtimes.length > 0 ? (
              <div className="space-y-5">
                {movie.showtimes.map((showtime) => {
                  const { date, time } = formatShowtime(showtime.startTime);
                  return (
                    <div
                      key={showtime.id}
                      className="border border-gray-200 rounded-2xl p-5 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-300"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center text-gray-600 mb-2 space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{date}</span>
                            <span className="text-lg font-semibold text-primary-600">{time}</span>
                          </div>
                          <div className="flex items-center text-gray-600 space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {showtime.theater}, {showtime.city}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {showtime.seatsAvailable} seats available
                          </div>
                          <Link
                            to={`/seats/${showtime.id}`}
                            className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg border border-transparent hover:shadow-2xl hover:border-gray-800 transform transition-all duration-300 hover:scale-105"
                          >
                            Select Seats
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No showtimes available for this movie</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
