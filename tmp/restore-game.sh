#!/bin/bash

# Back up the current index.html
cp /Users/greg/code/bluey-uno/index.html /Users/greg/code/bluey-uno/index.html.custom

# Copy the restored original version
cp /Users/greg/code/bluey-uno/tmp/original-index.html /Users/greg/code/bluey-uno/index.html

echo "Game restored to original functionality!"
echo "The modified version has been backed up to index.html.custom"
echo ""
echo "To run the game, use: npm start"