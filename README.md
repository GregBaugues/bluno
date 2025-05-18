# Bluey Uno

A Bluey-themed Uno card game built for a 4-year-old to play against Bluey characters!

## Features

- Play Uno against 1-3 Bluey characters
- Emoji-themed Uno cards with special 💩 for Draw 4
- Simple interface designed for young children
- All the classic Uno rules

## How to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:1234
   ```

## Game Rules

- Match cards by color or number
- Special cards:
  - Skip (🚫): Next player misses their turn
  - Reverse (↩️): Reverses direction of play
  - Draw 2 (➕2️⃣): Next player draws 2 cards and misses their turn
  - Wild (🌈): Change the current color
  - Wild Draw 4 (💩): Next player draws 4 cards, misses their turn, and you change the color

- When you have only one card left, remember to click "Say UNO!"
- First player to get rid of all their cards wins!

## Adding Bluey Character Images

To add character images:
1. Place image files in the `/public/images/` directory
2. Update the `characterImages` object in `/src/images.js`

## Development

This game is built using:
- HTML5
- CSS3
- JavaScript
- Parcel bundler

## Repository Structure

- `/src/` - Source code files
- `/public/` - Public assets
  - `/public/images/` - Character and UI images
  - `/public/audio/` - Sound files
- `/tests/` - Test files and scripts
- `/screenshots/` - Game screenshots for documentation
- `/claude/` - Documentation files for Claude AI
- `CLAUDE.md` - Instructions for Claude AI

Enjoy playing Uno with Bluey and friends!