#!/bin/bash

echo "🎬 Movie Booking Application Setup"
echo "=================================="

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven 3.6+ and try again."
    exit 1
fi

echo "✅ All prerequisites are installed"
echo ""

# Start backend
echo "🚀 Starting backend server..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Start frontend
echo "🚀 Starting frontend server..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Application is starting up!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo "H2 Console: http://localhost:8080/h2-console"
echo ""
echo "Demo credentials:"
echo "Email: demo@movie.com"
echo "Password: Password123"
echo "OTP: 123456"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping services..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ All services stopped"
