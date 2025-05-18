# Bluey Uno - UI Elements and Selectors

## Key Game Containers
- `#game-container` - Main game container 
- `#opponents-area` - Area for opponent players (Bluey characters)
- `#side-indicators` - Contains color and direction indicators
- `#game-area` - Contains deck, discard pile and turn indicators
- `#player-hand` - Contains the human player's cards
- `#controls` - Contains game controls (usually hidden)
- `#color-choice` - UI for choosing colors after wild cards (hidden by default)

## Welcome Screen Elements
- `.welcome-screen` - The welcome screen container
- `.welcome-content` - The content within the welcome screen
- The game has player count selector buttons (no specific IDs, 2-4 player buttons)

## Game Elements
- `#deck` - The deck of cards for drawing
- `#discard-pile` - Where played cards go
- `.turn-indicator` - Visual indicator for current turn
- `#color-indicator` - Shows the current active color
- `#direction-indicator` - Shows the direction of play
- `#name-turn-indicator` - Text indicator showing whose turn it is

## Player Hand
- `#player-hand` - Contains the human player's cards 
- `.player-cards` - Container for the cards in the player's hand
- `.card` - Individual card elements
- `.playable-card` - Class added to cards that can be played

## Opponent Players
- `.opponent` - Individual opponent containers
- `.character-image` - Character image containers
- `.opponent-cards` - Cards held by opponents
- `.opponent-card` - Individual opponent card elements
- `.card-badge` - Shows count of cards for opponents
- `.uno-indicator` - Shown when a player has one card and has called UNO

## Character Displays
- `#opponent-bluey` - Container for Bluey
- `#opponent-bingo` - Container for Bingo
- `#opponent-bandit` - Container for Dad/Bandit
- `#julia-display` - Special container for Julia

## Wild Card Color Choice
- `#color-choice` - Container for color choice UI
- `#color-buttons` - Container for color selection buttons
- `.color-button` - Individual color buttons (data-color attribute contains color value)

## Game End Screen
- Victory screen is generated dynamically with no fixed ID

## Special States
- `isGameStarted` - Boolean in gameState that tracks if game is in progress
- `waitingForColorChoice` - Boolean in gameState that tracks if waiting for color selection
- `isDrawingCards` - Boolean in gameState that tracks if player is drawing cards
- `requiredDraws` - Number in gameState tracking how many cards must be drawn

## Notes on Element Selection
1. Cards in player's hand are dynamically created with no fixed IDs
2. The most reliable way to select them is by index in the `.player-cards` container
3. Playable cards get the `.playable-card` class and click handlers
4. Opponent cards have no individual identifiers
5. For wild card color selection, buttons have data-color attributes
6. Game state can be accessed and modified via window.gameState