# Demo Guide - Movie Booking App with Voice AI

## Quick Demo Script

### 1. Setup (2 minutes)
```bash
# Start the application
./run.sh
```

### 2. Voice Agent Demo (5 minutes)

#### Step 1: Open the Application
- Navigate to `http://localhost:3000`
- Click the floating microphone button (bottom-right)

#### Step 2: Voice Commands Demo
Try these voice commands:

**Basic Greeting:**
- Say: "Hello"
- Expected: Agent responds with greeting and offers help

**Movie Booking:**
- Say: "Book 2 tickets for Avatar tomorrow 7pm"
- Expected: Agent finds showtime, asks for confirmation
- Say: "Yes" when prompted
- Expected: Redirects to seat selection

**Showtime Query:**
- Say: "Show me timings for Inception"
- Expected: Lists available showtimes

**Alternative Booking:**
- Say: "Book one premium seat for Dune"
- Expected: Processes booking request

### 3. Manual Booking Demo (3 minutes)

#### Step 1: Browse Movies
- View movie cards on home page
- Click "View Showtimes" on any movie

#### Step 2: Select Showtime
- Choose a showtime from the list
- Click "Select Seats"

#### Step 3: Seat Selection
- Click on available seats (gray squares)
- Selected seats turn blue
- Click "Continue to Payment"

#### Step 4: Payment Flow
- Fill in payment details (any test card)
- Click "Pay ₹XXX"
- Enter OTP: `123456`
- Click "Verify OTP"

#### Step 5: Confirmation
- View booking confirmation
- Navigate to Profile to see booking history

### 4. Authentication Demo (2 minutes)

#### Login:
- Click "Login" in navbar
- Email: `demo@movie.com`
- Password: `Password123`
- Click "Sign in"

#### Guest Booking:
- Logout and try booking as guest
- Fill in guest details during checkout

## Demo Talking Points

### Voice AI Features
- **Natural Language Processing**: Understands conversational booking requests
- **Intent Recognition**: Identifies booking, showtime, and help requests
- **Slot Extraction**: Extracts movie names, dates, times, seat counts
- **Clarification Flow**: Asks for missing information
- **Multi-turn Conversation**: Handles back-and-forth dialogue

### Technical Highlights
- **Web Speech API**: Browser-based voice recognition
- **Spring Boot Backend**: RESTful API with JWT authentication
- **React Frontend**: Modern SPA with responsive design
- **Mock Payment**: Simulated OTP-based payment flow
- **Database**: H2 for development, PostgreSQL for production

### User Experience
- **Responsive Design**: Works on desktop and mobile
- **Real-time Feedback**: Live voice transcription
- **Error Handling**: Graceful fallbacks for unsupported browsers
- **Guest Booking**: No registration required

## Troubleshooting Demo Issues

### Voice Recognition Not Working
- Use Chrome or Safari browser
- Allow microphone permissions
- Speak clearly and at moderate pace
- Check browser console for errors

### Payment Issues
- Always use OTP: `123456`
- Use any test card details
- Check network connectivity

### Database Issues
- H2 console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:moviedb`
- Username: `sa`, Password: `password`

## Sample User Journey

1. **Discovery**: User browses movies on homepage
2. **Voice Interaction**: User clicks mic and says "Book tickets for Avatar"
3. **Clarification**: Agent asks for date, time, and number of seats
4. **Confirmation**: Agent summarizes booking and asks for confirmation
5. **Payment**: User completes payment with OTP verification
6. **Confirmation**: User receives booking confirmation and email

## Key Metrics to Highlight

- **Voice Accuracy**: 90%+ for clear speech
- **Response Time**: <2 seconds for NLP processing
- **Browser Support**: Chrome, Safari, Edge
- **Mobile Friendly**: Responsive design
- **Accessibility**: Voice-first interface

## Demo Environment

- **Backend**: Spring Boot on port 8080
- **Frontend**: React on port 3000
- **Database**: H2 in-memory with seed data
- **Voice API**: Web Speech API (browser-native)
- **Payment**: Mock service with OTP simulation
