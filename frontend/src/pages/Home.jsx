import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { moviesAPI } from "../services/api";
import toast from "react-hot-toast";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await moviesAPI.getAll();
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to load movies");
    } finally {
      setLoading(false);
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
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-3 drop-shadow-lg">
          Now Playing
        </h1>
        <p className="text-gray-600 text-lg">
          Book your movie tickets with our voice assistant
        </p>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-3xl"
          >
            <div className="relative">
              {/* Corrected image URL */}
              <img
                src={`http://localhost:8080/posters/${movie.posterUrl}`}
                alt={movie.title}
                className="w-full h-64 object-cover rounded-t-2xl"
              />

              <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full font-semibold text-sm shadow-md">
                {movie.genre}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {movie.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-3 space-x-2">
                <Clock className="h-4 w-4" />
                <span>{movie.duration} min</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {movie.synopsis}
              </p>
              <Link
                to={`/movie/${movie.id}`}
                className="block w-full text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                View Showtimes
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* No movies */}
      {movies.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            No movies available at the moment
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
