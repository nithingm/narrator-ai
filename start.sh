#!/bin/bash

# Start the backend server
echo "Starting Narrator AI backend server..."
cd backend
node index.js &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Start the frontend development server
echo "Starting Narrator AI frontend..."
cd ../frontend
npx next dev &
FRONTEND_PID=$!

# Handle graceful shutdown
function cleanup {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Set up trap for cleanup on exit
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "Narrator AI is running!"
echo "Backend server: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop all servers"

# Wait for user to press Ctrl+C
wait