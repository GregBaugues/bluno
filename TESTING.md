# Testing the Bluey Uno Game

This document provides detailed instructions for testing the Bluey Uno game, with a specific focus on using Puppeteer for automated testing.

## Table of Contents

1. [Game Overview](#game-overview)
2. [Testing Environment Setup](#testing-environment-setup)
3. [Key Game Elements and Selectors](#key-game-elements-and-selectors)
4. [Basic Game Testing Procedures](#basic-game-testing-procedures)
5. [Testing Special Card Actions](#testing-special-card-actions)
6. [Known Limitations with Puppeteer](#known-limitations-with-puppeteer)
7. [Example Test Scripts](#example-test-scripts)

## Game Overview

Bluey Uno is a digital adaptation of the classic Uno card game, themed with characters from the Bluey cartoon. The game allows players to:
- Play against 1-3 AI opponents (Bluey characters)
- Play and match cards by color or number
- Use special action cards (Skip, Reverse, Draw 2, Wild, Wild Draw 4)
- Win by playing all cards in their hand

## Testing Environment Setup

The game runs on a local server (typically localhost:1234). Before testing:

1. Ensure the development server is running
2. Verify the game is accessible at http://localhost:1234

## Key Game Elements and Selectors

### Welcome Screen
- Welcome screen container: `.welcome-screen`
- Player count buttons are direct `button` elements in the welcome screen
  - To select 2 players, click the first button: `button`

### Game Board
- Game container: `#game-container`
- Opponents area: `#opponents-area`
- Bluey character: `#opponent-bluey .opponent`
- Deck: `#deck`
- Discard pile: `#discard-pile`
- Player's hand: `#player-hand`
- Player's cards: `.player-cards .card`
  - First card: `.player-cards .card:first-child`
  - Specific card: `.player-cards .card:nth-child(2)` (for the second card)
  - Last card: `.player-cards .card:last-child`
- Current color indicator: `#color-indicator`
- Direction indicator: `#direction-indicator`

### Special UI Elements
- Color choice UI (after playing Wild cards): `#color-choice`
- Color buttons: 
  - Red color button: `.color-button[data-color="red"]`
  - Blue color button: `.color-button[data-color="blue"]`
  - Green color button: `.color-button[data-color="green"]`
  - Yellow color button: `.color-button[data-color="yellow"]`

## Basic Game Testing Procedures

### Starting a New Game

```javascript
// Navigate to the game
await puppeteer.navigate('http://localhost:1234');

// Take a screenshot of the welcome screen
await puppeteer.screenshot({ name: 'welcome-screen' });

// Click the first button to start a 2-player game
await puppeteer.click('button');

// Take a screenshot to verify the game started
await puppeteer.screenshot({ name: 'game-started' });
```

### Playing a Card

```javascript
// Click on the first card in player's hand
await puppeteer.click('.player-cards .card:first-child');

// Take a screenshot to verify if the card was played
await puppeteer.screenshot({ name: 'after-card-play' });
```

### Drawing a Card

```javascript
// Click on the deck to draw a card
await puppeteer.click('#deck');

// Take a screenshot to verify the card was drawn
await puppeteer.screenshot({ name: 'after-card-draw' });
```

## Testing Special Card Actions

### Testing Wild Card Color Selection

```javascript
// Click on a Wild card in player's hand
// Note: This may not work consistently due to Puppeteer limitations
await puppeteer.click('.player-cards .card[data-value="Wild"]');

// Take a screenshot to see if color choice UI appeared
await puppeteer.screenshot({ name: 'wild-card-color-choice' });

// Try to select red color
await puppeteer.click('.color-button[data-color="red"]');

// Take a screenshot to verify color selection
await puppeteer.screenshot({ name: 'after-color-selection' });
```

### Testing Draw 2 Card Effect

```javascript
// First player must play a Draw 2 card
// Then check if the player is required to draw cards
await puppeteer.screenshot({ name: 'draw-requirement' });

// Click on deck to draw required cards
await puppeteer.click('#deck');
await puppeteer.click('#deck');

// Take screenshot to verify drawing completed
await puppeteer.screenshot({ name: 'after-drawing-required-cards' });
```

## Known Limitations with Puppeteer

When testing the Bluey Uno game with Puppeteer, be aware of these limitations:

1. **JavaScript Evaluation Issues**
   - The `puppeteer_evaluate` function often fails with undefined errors
   - This prevents checking game state or element properties programmatically

2. **Interaction Challenges**
   - Card playing doesn't always work as expected
   - Wild card color selection UI may not appear or respond correctly
   - The game may not provide visual feedback for invalid moves

3. **Game State Visibility**
   - It's difficult to determine whose turn it is
   - Can't easily determine if actions were successful
   - Must rely on visual inspection of screenshots

4. **Timing Issues**
   - AI moves happen after delays
   - Without JavaScript evaluation, we can't effectively wait for specific game states

## Best Practices for Testing with Puppeteer

1. **Keep Tests Simple**
   - Focus on basic navigation and UI verification
   - Use screenshots liberally to verify game state visually

2. **Use Direct Selectors**
   - Prefer direct and specific CSS selectors
   - Avoid complex selectors that may not work consistently

3. **Step-by-Step Testing**
   - Break testing into small, sequential steps
   - Take screenshots after each step to verify results

4. **Manual Verification**
   - Have a human verify screenshots for correct game behavior
   - Don't rely solely on automated assertions

## Example Test Scripts

### Basic Game Flow Test

```javascript
// Start the game
await puppeteer.navigate('http://localhost:1234');
await puppeteer.screenshot({ name: '01-welcome-screen' });
await puppeteer.click('button'); // Click first button (2 players)
await puppeteer.screenshot({ name: '02-game-started' });

// Try playing a card
await puppeteer.click('.player-cards .card:first-child');
await puppeteer.screenshot({ name: '03-after-card-play' });

// Try drawing a card
await puppeteer.click('#deck');
await puppeteer.screenshot({ name: '04-after-drawing-card' });
```

### Complete Game Test Script

For a more complex test, see the attached test script that attempts to play a complete game, but be aware of the limitations mentioned above.

## Conclusion

Testing the Bluey Uno game with Puppeteer presents several challenges. Focus on basic interface testing, use screenshots for verification, and be prepared for inconsistent behavior with more complex game interactions.

For reliable testing, consider supplementing Puppeteer tests with manual testing or unit tests that directly interact with the game's JavaScript functions.