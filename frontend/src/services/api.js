import axios from "axios";

// 🔹 Dynamic backend URL based on environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

// -------------------- Movies API --------------------
export const moviesAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/movies`),
  getById: (id) => axios.get(`${API_BASE_URL}/movies/${id}`),
  search: (title) => axios.get(`${API_BASE_URL}/movies/search?title=${title}`),
};

// -------------------- Posters API --------------------
export const postersAPI = {
  get: (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;

    // Base URL from environment
    const baseUrl = API_BASE_URL.replace("/api", ""); // remove /api for images path
    if (imagePath.startsWith("/posters/")) return `${baseUrl}${imagePath}`;

    return `${baseUrl}/posters/${imagePath.replace(/^\/+/, "")}`;
  },
};

// -------------------- Bookings API --------------------
export const bookingsAPI = {
  create: (bookingData) => axios.post(`${API_BASE_URL}/bookings`, bookingData),
  getById: (id) => axios.get(`${API_BASE_URL}/bookings/${id}`),
  getMyBookings: () => axios.get(`${API_BASE_URL}/bookings/my-bookings`),
  getGuestBookings: (email) =>
    axios.get(`${API_BASE_URL}/bookings/guest/${email}`),
};

// -------------------- Payments API --------------------
export const paymentsAPI = {
  initiateMock: (paymentData) =>
    axios.post(`${API_BASE_URL}/payments/mock`, paymentData),
  confirmOTP: (otpData) =>
    axios.post(`${API_BASE_URL}/payments/mock/confirm`, otpData),
};

// -------------------- NLP API --------------------
export const nlpAPI = {
  parse: (text) => axios.post(`${API_BASE_URL}/nlp/parse`, { text }),
};

// -------------------- Auth API --------------------
export const authAPI = {
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials),
  signup: (userData) => axios.post(`${API_BASE_URL}/auth/signup`, userData),
};

