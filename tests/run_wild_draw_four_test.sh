#!/bin/bash

# Make sure the screenshots directory exists
mkdir -p screenshots

# Start the development server in the background
echo "Starting the development server..."
npm start &
SERVER_PID=$!

# Wait for the server to be ready (adjust timeout as needed)
echo "Waiting for the server to start..."
sleep 5

# Run the Wild Draw 4 test
echo "Running the Wild Draw 4 test..."
node test_wild_draw_four.js

# Cleanup: Kill the server process
echo "Shutting down the development server..."
kill $SERVER_PID

echo "Test completed. Check the screenshots directory for visual results."