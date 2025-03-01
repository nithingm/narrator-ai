#!/usr/bin/env bash
#
# start.sh
#
# 1) Kills any processes on ports 5000 & 3000
# 2) Removes the .next folder (if any) in frontend/
# 3) Starts the backend (listening on port 5000)
# 4) Waits 2 seconds
# 5) Starts the frontend (listening on port 3000)
# 6) Waits for user input
# 7) Gracefully kills the two Node processes it started
#
# Usage:
#   chmod +x start.sh   # make it executable
#   ./start.sh

###################################
# 1) Kill processes on port 5000 & 3000 (Optional)
###################################
echo "Killing processes on port 5000..."
PIDS_5000=$(lsof -ti :5000 2>/dev/null)  # Mac/Linux command to find PIDs on port 5000
if [ -n "$PIDS_5000" ]; then
  kill -9 $PIDS_5000
  echo "Killed processes on port 5000."
else
  echo "No processes running on port 5000."
fi

echo "Killing processes on port 3000..."
PIDS_3000=$(lsof -ti :3000 2>/dev/null)
if [ -n "$PIDS_3000" ]; then
  kill -9 $PIDS_3000
  echo "Killed processes on port 3000."
else
  echo "No processes running on port 3000."
fi

###################################
# 2) Delete the .next folder
###################################
if [ -d "./frontend/.next" ]; then
  echo "Deleting .next folder..."
  rm -rf "./frontend/.next"
  echo ".next folder deleted successfully."
else
  echo ".next folder does not exist; skipping deletion."
fi

###################################
# 3) Start backend in the background
###################################
echo "Starting Narrator AI backend server..."
(
  cd backend || exit 1
  npm run dev
) &
BACKEND_PID=$!

###################################
# 4) Wait briefly before starting frontend
###################################
sleep 2

###################################
# 5) Start frontend in the background
###################################
echo "Starting Narrator AI frontend..."
(
  cd frontend || exit 1
  npm run dev
) &
FRONTEND_PID=$!

###################################
# 6) Output info & wait for user
###################################
echo "========================================="
echo "Narrator AI is running!"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "========================================="
echo "Press [ENTER] to stop all servers..."
read -r

###################################
# 7) Gracefully kill the two PIDs
###################################
echo "Stopping Narrator AI..."

# Send SIGTERM (default) to each process
kill "$BACKEND_PID" "$FRONTEND_PID"

# Wait for them to exit
wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null

echo "All servers stopped gracefully."