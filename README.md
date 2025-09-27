# Movie Booking Web Application with Voice AI Agent

A full-stack movie booking application featuring a voice AI agent that can understand spoken booking requests and process payments through a simulated OTP flow.

## Features

- 🎬 **Movie Discovery**: Browse movies with details and showtimes
- 🎫 **Seat Selection**: Interactive seat map for ticket selection
- 🗣️ **Voice AI Agent**: Natural language processing for voice commands
- 💳 **Payment Simulation**: Mock payment flow with OTP verification
- 👤 **User Authentication**: JWT-based login/signup system
- 📱 **Responsive Design**: Modern UI with Tailwind CSS
- 🎯 **Guest Booking**: Option to book without registration

## Tech Stack

### Backend
- **Spring Boot 3.2.0** - Java framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Database operations
- **H2 Database** - In-memory database for development
- **JWT** - Token-based authentication
- **Maven** - Dependency management

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Web Speech API** - Voice recognition and synthesis

## Prerequisites

- **Java 17+**
- **Node.js 18+**
- **Maven 3.6+**
- **Modern web browser** (Chrome/Firefox/Safari for Web Speech API)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd moviesss
```

### 2. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

## Voice AI Agent Usage

### Supported Commands

The voice agent understands natural language commands for:

- **Booking Tickets**: "Book 2 tickets for Avatar tomorrow 7pm"
- **Showtime Queries**: "Show me timings for Inception"
- **Seat Selection**: "Book one premium seat for Dune"
- **General Help**: "Hello", "Help"

### Sample Conversations

**User**: "Hey, book 2 tickets for Inception tomorrow 7 pm in Pune."  
**Agent**: "Great! I found 2 seat(s) for Inception on Sep 16, 2025 at 7:00 PM at PVR Phoenix Pune. Would you like to proceed with booking?"  
**User**: "Yes."  
**Agent**: "Please provide card details." (user enters)  
**Agent**: "OTP sent — enter OTP." (user enters 123456)  
**Agent**: "Payment successful! Booking ID BKG12345. Confirmation sent to demo@movie.com"

### How to Use Voice Agent

1. Click the floating microphone button (bottom-right corner)
2. Allow microphone permissions when prompted
3. Speak your request clearly
4. Follow the agent's prompts for confirmation
5. Complete payment through the voice-guided flow

## API Endpoints

### Authentication
```bash
# Sign up
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'
```

### Movies
```bash
# Get all movies
curl http://localhost:8080/api/movies

# Get movie by ID
curl http://localhost:8080/api/movies/1

# Search movies
curl "http://localhost:8080/api/movies/search?title=Avatar"
```

### Bookings
```bash
# Create booking
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"showtimeId":1,"seats":"[{\"row\":1,\"seat\":1}]","amount":250}'

# Get user bookings
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/bookings/my-bookings
```

### Payments
```bash
# Initiate mock payment
curl -X POST http://localhost:8080/api/payments/mock \
  -H "Content-Type: application/json" \
  -d '{"bookingId":1,"cardNumber":"1234567890123456","expiryDate":"12/25","cvv":"123","cardholderName":"John Doe","simulateOTP":true}'

# Confirm OTP
curl -X POST http://localhost:8080/api/payments/mock/confirm \
  -H "Content-Type: application/json" \
  -d '{"otp_token":"abc123","otp":"123456"}'
```

### NLP Processing
```bash
# Parse voice input
curl -X POST http://localhost:8080/api/nlp/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"Book 2 tickets for Avatar tomorrow 7pm"}'
```

## Test Credentials

### Demo User Account
- **Email**: demo@movie.com
- **Password**: Password123

### Payment Testing
- **OTP for Mock Payment**: Always use `123456`
- **Card Details**: Use any test card numbers (e.g., 1234567890123456)

## Database Schema

### Users
- `id`, `name`, `email`, `password_hash`, `created_at`

### Movies
- `id`, `title`, `duration`, `genre`, `poster_url`, `synopsis`

### Showtimes
- `id`, `movie_id`, `theater`, `city`, `start_time`, `seats_total`, `seats_available`, `seat_map`

### Bookings
- `id`, `user_id`, `showtime_id`, `seats`, `amount`, `status`, `guest_email`, `guest_name`, `created_at`

### Payments
- `id`, `booking_id`, `method`, `status`, `external_txn_id`, `otp_token`, `created_at`

## Seed Data

The application automatically seeds with:
- 5 movies (Avatar, Inception, Dune, Spider-Man, Interstellar)
- Multiple showtimes across 2 theaters (PVR Phoenix Pune, INOX River)
- Demo user account

## Voice AI Implementation

### Frontend (Web Speech API)
- **Speech Recognition**: Captures user voice input
- **Speech Synthesis**: Provides audio feedback
- **Intent Parsing**: Processes natural language commands
- **Conversation Management**: Handles multi-turn dialogs

### Backend (NLP Service)
- **Intent Classification**: Identifies user intentions (book_ticket, ask_showtimes, etc.)
- **Slot Extraction**: Extracts entities (movie_name, date, time, seats, etc.)
- **Rule-based Parser**: Uses regex patterns and date parsing
- **Clarification Handling**: Asks for missing information

## Development

### Backend Development
```bash
cd backend
mvn spring-boot:run
```

Access H2 console at: `http://localhost:8080/h2-console`

### Frontend Development
```bash
cd frontend
npm run dev
```

Hot reload enabled for development.

### Running Tests
```bash
# Backend tests
cd backend
mvn test

# Frontend tests (if implemented)
cd frontend
npm test
```

## Environment Variables

### Backend (`application.yml`)
```yaml
jwt:
  secret: mySecretKey123456789012345678901234567890
  expiration: 86400000 # 24 hours

cors:
  allowed-origins: http://localhost:3000,http://localhost:5173
```

### Frontend (`vite.config.js`)
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

## Browser Compatibility

### Web Speech API Support
- ✅ Chrome/Chromium 25+
- ✅ Safari 14.1+
- ✅ Edge 79+
- ❌ Firefox (limited support)

### Fallback
If Web Speech API is not supported, users can still interact through the text interface.

## Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Ensure browser has microphone access
   - Check browser settings for site permissions

2. **Voice Recognition Not Working**
   - Use Chrome or Safari for best compatibility
   - Ensure stable internet connection
   - Speak clearly and at moderate pace

3. **CORS Errors**
   - Verify backend is running on port 8080
   - Check CORS configuration in `SecurityConfig.java`

4. **Database Connection Issues**
   - H2 database starts automatically with the application
   - Access console at `http://localhost:8080/h2-console`

### Debug Mode
Enable debug logging in `application.yml`:
```yaml
logging:
  level:
    com.moviebooking: DEBUG
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Demo GIF

To record a demo:
1. Start both backend and frontend
2. Open browser to `http://localhost:3000`
3. Use screen recording software
4. Demonstrate:
   - Browsing movies
   - Using voice agent to book tickets
   - Completing payment flow
   - Viewing booking confirmation

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs for API errors
4. Ensure all prerequisites are met
