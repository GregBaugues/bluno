# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Bluey-themed Uno card game designed for young children (specifically a 4-year-old) to play against Bluey cartoon characters. The game is built with vanilla JavaScript, HTML5, and CSS3, using Parcel as a bundler.

## Build and Run Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Game Architecture

The game is structured around several core modules that work together:

1. **Deck System** (`deck.js`):
   - Creates and manages the Uno card deck
   - Defines card colors, values, and emoji mappings
   - Provides functions for shuffling and dealing cards

2. **Game Logic** (`game.js`):
   - Manages the core game state
   - Handles turn management and game flow
   - Processes card plays and special card effects
   - Contains AI logic for computer players

3. **Player System** (`players.js`):
   - Creates human and AI players
   - Manages the Bluey character selection
   - Handles player-specific state like hands and "Uno" calls

4. **UI System** (`ui.js`):
   - Renders the game interface
   - Updates the display based on game state
   - Handles user interactions
   - Manages animations and visual feedback

5. **Sound System** (`sounds.js`):
   - Uses the Web Audio API to create game sounds
   - Provides different sound effects for game events
   - Handles sound toggling

6. **Character System** (`images.js`):
   - Manages Bluey character images
   - Provides fallback display with colored initials when images aren't available

## Game Flow

1. The game starts with a welcome screen
2. Player taps to start the game
3. Cards are dealt to the player and Bluey character opponents
4. Players take turns matching cards by color or number
5. Special cards trigger effects (Skip, Reverse, Draw 2, Wild, Wild Draw 4)
6. The first player to play all their cards wins

## Code Structure Notes

- The game uses a central game state object that's updated as the game progresses
- UI updates are triggered by changes to the game state
- The AI logic is simple and rule-based, focusing on matching cards when possible
- Touch events are used for card selection and game interactions, making it tablet/mobile friendly
- Responsive CSS adjusts the layout for different screen orientations and sizes