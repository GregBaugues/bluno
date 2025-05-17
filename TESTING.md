# Bluey Uno Testing Guide

This guide provides detailed instructions for testing the Bluey Uno game using Puppeteer. It's specifically designed to help Claude understand the game structure and provide reliable testing methods.

## Table of Contents

1. [Game Structure](#game-structure)
2. [Key DOM Elements and Selectors](#key-dom-elements-and-selectors)
3. [Testing Setup](#testing-setup)
4. [Game Initialization](#game-initialization)
5. [Player Interactions](#player-interactions)
6. [Special Card Testing](#special-card-testing)
7. [Helper Functions](#helper-functions)
8. [Common Challenges and Workarounds](#common-challenges-and-workarounds)
9. [Complete Test Examples](#complete-test-examples)

## Game Structure

Bluey Uno is a JavaScript-based card game with the following structure:

- **Welcome Screen**: Player selects number of players (2-4)
- **Game Screen**: Main game interface with:
  - Player's hand (bottom)
  - Discard pile and deck (center)
  - Opponents/Bluey characters (top)
  - Turn indicators and color indicators (sides)
- **Special Screens**: Color selection UI for wild cards, victory screen

The game follows standard Uno rules with special cards (Skip, Reverse, Draw 2, Wild, Wild Draw 4).

## Key DOM Elements and Selectors

Here are the main elements and their selectors for Puppeteer testing:

### Game Containers
- `#game-container` - Main game container 
- `#opponents-area` - Area for opponent players (Bluey characters)
- `#side-indicators` - Contains color and direction indicators
- `#game-area` - Contains deck, discard pile and turn indicators
- `#player-hand` - Contains the human player's cards
- `#controls` - Contains game controls (usually hidden)
- `#color-choice` - UI for choosing colors after wild cards (hidden by default)

### Welcome Screen
- `.welcome-screen` - The welcome screen container
- `.welcome-content` - The content within the welcome screen
- Number selection buttons: No specific IDs, but can be selected via:
  ```javascript
  // Select 2-player button (first button)
  await page.evaluate(() => {
    document.querySelector('.welcome-screen button').click();
  });
  
  // Or select by text content
  const buttons = await page.$$('.welcome-screen button');
  for (const button of buttons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text.trim() === '2') { // Or '3' or '4'
      await button.click();
      break;
    }
  }
  ```

### Game Elements
- `#deck` - The deck of cards for drawing
- `#discard-pile` - Where played cards go
- `.turn-indicator` - Visual indicator for current turn
- `#color-indicator` - Shows the current active color
- `#direction-indicator` - Shows the direction of play
- `#name-turn-indicator` - Text indicator showing whose turn it is

### Player Hand
- `#player-hand` - Contains the human player's cards 
- `.player-cards` - Container for the cards in the player's hand
- `.card` - Individual card elements
- `.playable-card` - Class added to cards that can be played

Playing a card (by index in hand):
```javascript
// Play the first card in player's hand
const cards = await page.$$('#player-hand .card');
if (cards.length > 0) {
  await cards[0].click();
}

// To play a specific card type (e.g., red card), we need more complex logic:
const cards = await page.$$('#player-hand .card');
for (const card of cards) {
  const hasRedClass = await page.evaluate(el => el.classList.contains('red'), card);
  if (hasRedClass) {
    await card.click();
    break;
  }
}
```

### Opponent Players
- `.opponent` - Individual opponent containers
- `.character-image` - Character image containers
- `.opponent-cards` - Cards held by opponents
- `.opponent-card` - Individual opponent card elements
- `.card-badge` - Shows count of cards for opponents
- `.uno-indicator` - Shown when a player has one card and has called UNO

### Wild Card Color Choice
- `#color-choice` - Container for color choice UI
- `#color-buttons` - Container for color selection buttons
- `.color-button` - Individual color buttons (data-color attribute contains color value)

Selecting a color:
```javascript
// Select red color
const redButton = await page.$('[data-color="red"]');
if (redButton) await redButton.click();

// Alternative method using evaluation
await page.evaluate(() => {
  const buttons = document.querySelectorAll('.color-button');
  for (const button of buttons) {
    if (button.dataset.color === 'red') {
      button.click();
      break;
    }
  }
});
```

### Game State Access
The game state can be accessed and modified via `window.gameState`:

```javascript
// Get current game state
const gameState = await page.evaluate(() => window.gameState);

// Modify game state (for testing purposes)
await page.evaluate(() => {
  window.gameState.currentPlayerIndex = 0; // Set to human player's turn
  window.gameState.isDrawingCards = false; // Reset drawing state
});
```

## Testing Setup

This section covers how to set up Puppeteer to test the Bluey Uno game effectively.

### Basic Setup

Here's a basic template for setting up a Puppeteer test:

```javascript
const puppeteer = require('puppeteer');

// Utility function for sleep/delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testBlueyUno() {
  // Launch browser - non-headless is recommended for debugging
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
    args: ['--window-size=1200,800'],
    devtools: true  // Helpful for debugging
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the game
    await page.goto('http://localhost:1234/', { waitUntil: 'networkidle2' });
    console.log('Game loaded');
    
    // Screenshot for debugging
    await page.screenshot({ path: 'game-start.png' });
    
    // Your test logic goes here
    
    // Example: Wait for game elements to load
    await page.waitForSelector('#game-container', { visible: true });
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Keep browser open for inspection or close it
    // await browser.close();
    console.log('Test complete');
  }
}

// Create screenshots directory if needed
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the test
testBlueyUno();
```

## Common Challenges and Workarounds

Testing web-based games can be challenging, especially with timing and asynchronous actions. Here are solutions to common issues when testing Bluey Uno with Puppeteer.

### Race Conditions and Timing Issues

**Challenge**: The game uses animations and timed events that can cause race conditions during testing.

**Workarounds**:

1. **Use more reliable waiting strategies**:
   ```javascript
   // Instead of fixed waits:
   await sleep(1000);
   
   // Use waitForSelector or waitForFunction:
   await page.waitForSelector('#player-hand .card', { visible: true });
   await page.waitForFunction(() => window.gameState.currentPlayerIndex === 0);
   ```

2. **Combine waiting methods**:
   ```javascript
   // Use a combined approach for reliability
   await page.waitForSelector('#deck', { visible: true });
   await sleep(500); // Short additional wait for animations
   ```

3. **Create custom waiting functions**:
   ```javascript
   // Wait for any pending animations or state changes to complete
   async function waitForGameStability(page) {
     // Wait for no ongoing animations or state changes
     await page.waitForFunction(() => {
       return !window.gameState.waitingForColorChoice && 
              !window.gameState.isDrawingCards && 
              document.querySelector('#color-choice').style.display === 'none';
     }, { timeout: 5000 });
   }
   ```

### Unreliable Selectors

**Challenge**: Some elements lack stable IDs or could be affected by game state changes.

**Workarounds**:

1. **Access elements programmatically**:
   ```javascript
   // Instead of trying to find an element by selector:
   await page.click('#player-hand .card:nth-child(3)');
   
   // Use page.evaluate to find and interact with elements:
   await page.evaluate(() => {
     const cards = document.querySelectorAll('#player-hand .card');
     if (cards.length > 2) cards[2].click();
   });
   ```

2. **Manipulate gameState directly**:
   ```javascript
   // Instead of UI interactions, modify game state directly
   await page.evaluate(() => {
     // Play a card programmatically
     const cardIndex = 0; // First card in hand
     window.playCard(window.gameState, 0, cardIndex);
   });
   ```

### AI Player Actions

**Challenge**: AI players act automatically and may perform actions during testing that interfere with your test flow.

**Workarounds**:

1. **Pause AI behavior**:
   ```javascript
   // Temporarily disable AI behavior
   await page.evaluate(() => {
     // Save original AI function
     window._originalPlayAITurn = window.playAITurn;
     // Replace with empty function
     window.playAITurn = () => console.log('AI turn skipped by test');
   });
   
   // Run your test without AI interference
   
   // Restore AI behavior when needed
   await page.evaluate(() => {
     window.playAITurn = window._originalPlayAITurn;
   });
   ```

2. **Ensure human player's turn**:
   ```javascript
   // Force it to be human player's turn
   await page.evaluate(() => {
     window.gameState.currentPlayerIndex = 0;
     window.dispatchEvent(new CustomEvent('gameStateUpdated'));
   });
   ```

### Card Selection Difficulties

**Challenge**: Cards need to be clicked precisely, and sometimes playable cards are hard to identify.

**Workarounds**:

1. **Use the playable-card class**:
   ```javascript
   // Cards that can be played get the 'playable-card' class
   const playableCards = await page.$$('#player-hand .playable-card');
   if (playableCards.length > 0) {
     await playableCards[0].click();
   }
   ```

2. **Check card validity before clicking**:
   ```javascript
   // Before trying to play a card, check if it's valid
   const canPlay = await page.evaluate((cardIndex) => {
     const card = window.gameState.players[0].hand[cardIndex];
     const topDiscard = window.gameState.discardPile[window.gameState.discardPile.length - 1];
     
     // Check if card matches color or value
     return card.color === window.gameState.currentColor || 
            card.value === topDiscard.value ||
            card.color === 'wild';
   }, cardIndexToPlay);
   
   if (canPlay) {
     // Proceed with playing the card
     await page.click(`#player-hand .card:nth-child(${cardIndexToPlay + 1})`);
   }
   ```

### Wild Card Color Selection

**Challenge**: The color selection UI after playing a Wild card can be flaky to interact with.

**Workarounds**:

1. **Direct DOM manipulation**:
   ```javascript
   // After playing a Wild card, bypass the UI
   await page.evaluate((colorChoice) => {
     // Call the chooseColor function directly
     window.chooseColor(colorChoice);
   }, 'red');
   ```

2. **Wait explicitly for color choice UI**:
   ```javascript
   // Make sure color choice UI is fully visible before interacting
   await page.waitForFunction(() => {
     const colorChoice = document.querySelector('#color-choice');
     return colorChoice && 
            colorChoice.style.display !== 'none' && 
            colorChoice.querySelectorAll('.color-button').length === 4;
   }, { timeout: 5000 });
   
   // Then click a color button
   await page.click('[data-color="red"]');
   ```

### Special Card Effects

**Challenge**: Special cards like Skip, Draw 2, and Wild Draw 4 have complex effects that can be hard to test.

**Workarounds**:

1. **Setup game state with specific cards**:
   ```javascript
   // Set up a specific game state for testing Draw 2
   await page.evaluate(() => {
     // Ensure player has a Draw 2 card
     window.gameState.players[0].hand = [
       { color: 'red', value: 'Draw 2', emoji: '➕2️⃣' }
     ];
     
     // Set current color to match
     window.gameState.currentColor = 'red';
     
     // Force UI update
     window.dispatchEvent(new CustomEvent('gameStateUpdated'));
   });
   ```

2. **Check game state after special card effects**:
   ```javascript
   // After playing a Draw 2 card, check next player's hand size
   const nextPlayerHandSize = await page.evaluate(() => {
     const nextPlayerIndex = (window.gameState.currentPlayerIndex + window.gameState.direction) % window.gameState.players.length;
     if (nextPlayerIndex < 0) nextPlayerIndex += window.gameState.players.length;
     return window.gameState.players[nextPlayerIndex].hand.length;
   });
   
   console.log('Next player hand size:', nextPlayerHandSize);
   ```

### Handling Required Draws

**Challenge**: When a player needs to draw multiple cards (e.g., after a Wild Draw 4), it can be hard to determine when this process is complete.

**Workarounds**:

1. **Monitor the requiredDraws counter**:
   ```javascript
   // Wait until all required cards are drawn
   await page.waitForFunction(() => window.gameState.requiredDraws === 0, { timeout: 10000 });
   console.log('All required cards have been drawn');
   ```

2. **Draw cards in a loop**:
   ```javascript
   // Draw all required cards
   let requiredDraws;
   do {
     requiredDraws = await page.evaluate(() => window.gameState.requiredDraws);
     if (requiredDraws > 0) {
       await page.click('#deck');
       await sleep(500); // Give time for animation
     }
   } while (requiredDraws > 0);
   ```

### Testing in Headless Mode

**Challenge**: While headless mode is faster, visual elements and timing can behave differently than in headed mode.

**Workarounds**:

1. **Use headed mode for visual tests**:
   ```javascript
   const browser = await puppeteer.launch({
     headless: false, // Use headed mode for visual tests
     defaultViewport: { width: 1024, height: 768 }
   });
   ```

2. **Use screenshots for debugging**:
   ```javascript
   // Take frequent screenshots in headless mode
   await page.screenshot({ path: 'screenshot_before.png' });
   // ... perform action ...
   await page.screenshot({ path: 'screenshot_after.png' });
   ```

3. **Set longer timeouts for headless mode**:
   ```javascript
   // Use longer timeouts when running headless
   const isHeadless = true; // Change based on your launch config
   const timeoutMultiplier = isHeadless ? 2 : 1;
   await page.waitForSelector('#element', { 
     timeout: 5000 * timeoutMultiplier 
   });
   ```

### Specific Issues for Claude

Since this testing guide is specifically for Claude, here are some additional tips tailored to Claude's abilities:

1. **Use simpler selectors**: Claude works best with straightforward CSS selectors like `#element` or `.class-name` rather than complex CSS selectors.

2. **Provide clear success/failure criteria**: Use explicit logging and assertions that clearly show what's expected and what actually happened.

3. **Script breaking down**: When writing complex test scripts, break them into smaller functions with clear names and purposes.

4. **Favor evaluate() for complex operations**: When dealing with complex DOM manipulation or game state checks, `page.evaluate()` is often more reliable than trying to chain multiple Puppeteer actions.

5. **Capture and log errors**: Always include try/catch blocks and log detailed error information to help diagnose issues.

```javascript
try {
  await findAndPlayCard(page, { color: 'red' });
} catch (error) {
  console.error('Error details:', error);
  await page.screenshot({ path: 'error_screenshot.png' });
}
```

## Complete Test Examples

Here are some complete test examples showing how to test different aspects of the Bluey Uno game.

### Basic Game Flow Test

This test example plays a full round of the game, playing cards when possible and drawing when necessary:

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

// Utility function for sleep/delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testBasicGameFlow() {
  // Make screenshots directory
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
    args: ['--window-size=1200,800']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the game
    await page.goto('http://localhost:1234/', { waitUntil: 'networkidle2' });
    console.log('Game loaded');
    
    // Take a screenshot of initial state
    await page.screenshot({ path: 'screenshots/01_initial_state.png' });
    
    // Start a 2-player game (click first button)
    await page.waitForSelector('.welcome-screen button');
    await page.click('.welcome-screen button');
    
    // Wait for game to initialize
    await page.waitForSelector('#player-hand .card', { visible: true });
    await sleep(1000);
    
    // Take a screenshot of game start
    await page.screenshot({ path: 'screenshots/02_game_started.png' });
    
    // Get initial game state
    const initialState = await page.evaluate(() => ({
      currentPlayer: window.gameState.currentPlayerIndex,
      currentColor: window.gameState.currentColor,
      playerHand: window.gameState.players[0].hand.length,
      opponentHand: window.gameState.players[1].hand.length,
      discardTop: window.gameState.discardPile[window.gameState.discardPile.length - 1]
    }));
    
    console.log('Initial game state:', initialState);
    
    // Play up to 5 rounds
    for (let round = 1; round <= 5; round++) {
      console.log(`\n--- ROUND ${round} ---`);
      
      // Wait for it to be the player's turn
      await page.waitForFunction(() => 
        window.gameState.currentPlayerIndex === 0 && 
        !window.gameState.waitingForColorChoice && 
        !window.gameState.isDrawingCards,
        { timeout: 5000 }
      ).catch(() => console.log('Waiting for player turn timed out'));
      
      // Check if we have a playable card
      const hasPlayable = await page.evaluate(() => {
        return document.querySelectorAll('#player-hand .playable-card').length > 0;
      });
      
      if (hasPlayable) {
        // Play the first playable card
        console.log('Playing a card...');
        const playableCards = await page.$$('#player-hand .playable-card');
        await playableCards[0].click();
        
        // Check if played card was a wild card
        const needsColorChoice = await page.evaluate(() => 
          window.gameState.waitingForColorChoice
        );
        
        if (needsColorChoice) {
          // Choose a color (red)
          console.log('Choosing color for wild card...');
          await page.waitForSelector('#color-choice', { visible: true });
          await page.click('[data-color="red"]');
        }
      } else {
        // Draw a card
        console.log('No playable cards, drawing...');
        await page.click('#deck');
        
        // If we draw a playable card, we may get to play it
        await sleep(1000);
        
        // Check again if we have a playable card after drawing
        const canPlayAfterDraw = await page.evaluate(() => {
          return document.querySelectorAll('#player-hand .playable-card').length > 0;
        });
        
        if (canPlayAfterDraw) {
          console.log('Playing card after drawing...');
          const playableCards = await page.$$('#player-hand .playable-card');
          await playableCards[0].click();
          
          // Check for wild card again
          const needsColorChoice = await page.evaluate(() => 
            window.gameState.waitingForColorChoice
          );
          
          if (needsColorChoice) {
            console.log('Choosing color for wild card...');
            await page.waitForSelector('#color-choice', { visible: true });
            await page.click('[data-color="red"]');
          }
        }
      }
      
      // Take a screenshot after human player turn
      await page.screenshot({ path: `screenshots/03_round${round}_after_player.png` });
      
      // Wait for AI turn to complete
      await sleep(2000);
      
      // Take a screenshot after AI turn
      await page.screenshot({ path: `screenshots/04_round${round}_after_ai.png` });
      
      // Get current game state
      const roundState = await page.evaluate(() => ({
        currentPlayer: window.gameState.currentPlayerIndex,
        currentColor: window.gameState.currentColor,
        playerHand: window.gameState.players[0].hand.length,
        opponentHand: window.gameState.players[1].hand.length,
        discardTop: window.gameState.discardPile[window.gameState.discardPile.length - 1]
      }));
      
      console.log(`Round ${round} state:`, roundState);
      
      // Check if game has ended
      const gameEnded = await page.evaluate(() => 
        window.gameState.winningPlayerIndex !== undefined
      );
      
      if (gameEnded) {
        const winner = await page.evaluate(() => 
          window.gameState.players[window.gameState.winningPlayerIndex].name
        );
        console.log(`Game ended! Winner: ${winner}`);
        await page.screenshot({ path: 'screenshots/05_game_ended.png' });
        break;
      }
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Keep browser open for inspection
    console.log('Test complete. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to close the browser when done.');
  }
}

// Run the test
testBasicGameFlow();
```

### Testing Special Card: Wild Draw 4

This example shows how to test the Wild Draw 4 card functionality:

```javascript
const puppeteer = require('puppeteer');

// Utility function for sleep/delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testWildDrawFour() {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
    args: ['--window-size=1200,800']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the game
    await page.goto('http://localhost:1234/', { waitUntil: 'networkidle2' });
    console.log('Game loaded');
    
    // Setup a specific game state for testing Wild Draw 4
    await page.evaluate(() => {
      // Reset game state
      window.gameState = {
        deck: [],
        discardPile: [],
        players: [],
        currentPlayerIndex: 0,
        direction: 1,
        isGameStarted: true,
        currentColor: 'blue',
        waitingForColorChoice: false,
        pendingDrawPlayerIndex: null,
        pendingDrawCount: 0,
        requiredDraws: 0,
        isDrawingCards: false,
        winningPlayerIndex: undefined
      };
      
      // Create specific players with cards we want to test
      window.gameState.players = [
        {
          name: 'Julia', // Human player
          hand: [
            { color: 'wild', value: 'Wild Draw 4', emoji: '💩' },
            { color: 'red', value: '7', emoji: '😊' }
          ],
          isAI: false,
          hasCalledUno: false
        },
        {
          name: 'Bluey', // AI opponent
          hand: [
            { color: 'red', value: '5', emoji: '😎' },
            { color: 'blue', value: '6', emoji: '🙂' },
            { color: 'green', value: '3', emoji: '😄' }
          ],
          isAI: true,
          hasCalledUno: false
        }
      ];
      
      // Set initial discard card
      window.gameState.discardPile = [
        { color: 'blue', value: '3', emoji: '😍' }
      ];
      
      // Add cards to deck
      for (let i = 0; i < 20; i++) {
        window.gameState.deck.push({ color: 'red', value: i.toString(), emoji: '😊' });
      }
      
      // Force UI update
      window.dispatchEvent(new CustomEvent('gameStateUpdated'));
    });
    
    // Wait for UI to update
    await sleep(1000);
    
    // Get Bluey's initial hand size
    const initialAIHandSize = await page.evaluate(() => 
      window.gameState.players[1].hand.length
    );
    console.log('Bluey initial hand size:', initialAIHandSize);
    
    // Play Wild Draw 4 card
    console.log('Playing Wild Draw 4 card...');
    await page.click('#player-hand .card');
    await sleep(1000);
    
    // Select a color
    console.log('Selecting red color...');
    await page.waitForSelector('#color-choice', { visible: true });
    await page.click('[data-color="red"]');
    await sleep(2000);
    
    // Get Bluey's final hand size
    const finalAIHandSize = await page.evaluate(() => 
      window.gameState.players[1].hand.length
    );
    console.log('Bluey final hand size:', finalAIHandSize);
    
    // Verify Bluey drew 4 cards
    if (finalAIHandSize === initialAIHandSize + 4) {
      console.log('SUCCESS: Bluey correctly drew 4 cards');
    } else {
      console.log('FAILURE: Bluey did not draw 4 cards');
    }
    
    // Check current player - should be player's turn again in 2-player game
    const currentPlayer = await page.evaluate(() => 
      window.gameState.currentPlayerIndex
    );
    console.log('Current player index:', currentPlayer);
    
    if (currentPlayer === 0) {
      console.log('SUCCESS: Turn correctly returned to player');
    } else {
      console.log('FAILURE: Turn did not return to player');
    }
    
    // Verify color was changed
    const currentColor = await page.evaluate(() => 
      window.gameState.currentColor
    );
    console.log('Current color:', currentColor);
    
    if (currentColor === 'red') {
      console.log('SUCCESS: Color was correctly changed to red');
    } else {
      console.log('FAILURE: Color was not changed correctly');
    }
    
    console.log('Wild Draw 4 test completed successfully');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Keep browser open for inspection
    console.log('Test complete.');
  }
}

// Run the test
testWildDrawFour();
```

### Running With Local Server

To test the game, you need to have the game server running. You can automate this in your test script:

```javascript
// Start server and run test
const { spawn } = require('child_process');
const serverProcess = spawn('npm', ['start']);

// Wait for server to start
setTimeout(async () => {
  await testBlueyUno();
  // Kill server when done
  serverProcess.kill();
}, 5000);
```

Alternatively, use a shell script like the example in `run_wild_draw_four_test.sh`:

```bash
#!/bin/bash
mkdir -p screenshots
npm start &
SERVER_PID=$!
sleep 5  # Wait for server
node your_test_script.js
kill $SERVER_PID
```

### Waiting Strategies

Puppeteer tests frequently need to wait for elements or animations. Here are effective waiting strategies:

1. **Fixed Delays**:
   ```javascript
   // Wait 2 seconds for animation
   await sleep(2000);
   ```

2. **Wait for Selectors**:
   ```javascript
   // Wait for element to be visible
   await page.waitForSelector('#deck', { visible: true });
   ```

3. **Wait for Network Idle**:
   ```javascript
   // Wait for network to be idle (for initial page load)
   await page.goto('http://localhost:1234/', { waitUntil: 'networkidle2' });
   ```

4. **Wait for Function Conditions**:
   ```javascript
   // Wait for game to start
   await page.waitForFunction(() => window.gameState.isGameStarted === true);
   ```

## Game Initialization

Testing the game initialization process is the first step in any Bluey Uno test.

### Starting a New Game

The game starts with a welcome screen where the player selects the number of players (2-4).

```javascript
// Wait for welcome screen to appear
await page.waitForSelector('.welcome-screen', { visible: true });

// Select number of players (2, 3, or 4)
// Option 1: Click the first button (2 players)
await page.click('.welcome-screen button');

// Option 2: Select by specific player count
const playerCount = 3; // Choose 3 players
const buttons = await page.$$('.welcome-screen button');
for (let i = 0; i < buttons.length; i++) {
  const text = await page.evaluate(el => el.textContent.trim(), buttons[i]);
  if (text === playerCount.toString()) {
    await buttons[i].click();
    break;
  }
}

// Wait for game to initialize
await page.waitForSelector('#player-hand', { visible: true });
await sleep(1000); // Allow time for cards to be dealt
```

### Verifying Game State

After initialization, verify the game state is correct:

```javascript
// Check if game has started
const gameStarted = await page.evaluate(() => window.gameState.isGameStarted);
console.log('Game started:', gameStarted);

// Check player count
const playerCount = await page.evaluate(() => window.gameState.players.length);
console.log('Number of players:', playerCount);

// Check if player has cards
const playerHandSize = await page.evaluate(() => window.gameState.players[0].hand.length);
console.log('Player hand size:', playerHandSize);

// Check if discard pile has the initial card
const discardPileSize = await page.evaluate(() => window.gameState.discardPile.length);
console.log('Discard pile size:', discardPileSize);
```

### Setting Up a Specific Game State for Testing

For testing specific scenarios, you can modify the game state directly:

```javascript
// Set up a specific game state for testing
await page.evaluate(() => {
  // Reset game state
  window.gameState = {
    deck: [],
    discardPile: [],
    players: [],
    currentPlayerIndex: 0,
    direction: 1,
    isGameStarted: true,
    currentColor: 'blue',
    waitingForColorChoice: false,
    pendingDrawPlayerIndex: null,
    pendingDrawCount: 0,
    requiredDraws: 0,
    isDrawingCards: false,
    winningPlayerIndex: undefined
  };
  
  // Create specific players
  window.gameState.players = [
    {
      name: 'Julia', // Human player
      hand: [
        { color: 'red', value: '7', emoji: '😊' },
        { color: 'blue', value: '4', emoji: '😇' },
        { color: 'green', value: '2', emoji: '😁' },
        { color: 'yellow', value: '9', emoji: '😠' }
      ],
      isAI: false,
      hasCalledUno: false
    },
    {
      name: 'Bluey', // AI opponent
      hand: [
        { color: 'wild', value: 'Wild', emoji: '🌈' },
        { color: 'red', value: '5', emoji: '😎' },
        { color: 'blue', value: '6', emoji: '🙂' }
      ],
      isAI: true,
      hasCalledUno: false
    }
  ];
  
  // Set initial discard card
  window.gameState.discardPile = [
    { color: 'blue', value: '3', emoji: '😍' }
  ];
  
  // Add cards to deck
  for (let i = 0; i < 10; i++) {
    window.gameState.deck.push({ color: 'red', value: i.toString(), emoji: '😊' });
    window.gameState.deck.push({ color: 'blue', value: i.toString(), emoji: '😇' });
  }
  
  // Force UI update
  window.dispatchEvent(new CustomEvent('gameStateUpdated'));
});

// Wait for UI to update with new game state
await sleep(1000);
```

### Taking Screenshots

Screenshots are invaluable for debugging and documenting test results:

```javascript
// Take a screenshot of the current game state
await page.screenshot({ path: 'screenshots/game-initialized.png' });

// Take a screenshot of a specific element
const deck = await page.$('#deck');
if (deck) {
  await deck.screenshot({ path: 'screenshots/deck.png' });
}
```

## Player Interactions

This section covers how to test basic player interactions with the game, including playing cards, drawing cards, and responding to game events.

### Playing Cards

Playing cards is the most common interaction in the game. Here's how to test it:

```javascript
// Wait for game to be initialized with cards
await page.waitForSelector('#player-hand .card', { visible: true });

// Play a card from the player's hand
// Method 1: Play first card in hand (may not be valid)
const cards = await page.$$('#player-hand .card');
if (cards.length > 0) {
  await cards[0].click();
}

// Method 2: Find and play a valid card (playable cards have the 'playable-card' class)
const playableCards = await page.$$('#player-hand .playable-card');
if (playableCards.length > 0) {
  // Play the first valid card
  await playableCards[0].click();
  console.log('Played a valid card');
} else {
  console.log('No valid cards to play');
}

// Method 3: Find a card of a specific color
const redCards = await page.$$eval('#player-hand .card', cards => {
  return cards.filter(card => card.classList.contains('red'))
    .map((_, index) => index);
});

if (redCards.length > 0) {
  // Click the first red card
  await page.evaluate((index) => {
    document.querySelectorAll('#player-hand .card')[index].click();
  }, redCards[0]);
  console.log('Played a red card');
}

// Wait for the card to be played
await sleep(1000);

// Verify the card was played by checking discard pile
const topDiscard = await page.evaluate(() => {
  const pile = window.gameState.discardPile;
  return pile.length > 0 ? pile[pile.length - 1] : null;
});
console.log('Top discard card:', topDiscard);
```

### Drawing Cards

Drawing cards happens when a player has no valid play or as a result of special cards like Draw 2 or Wild Draw 4:

```javascript
// Method 1: Basic draw - click on deck
await page.click('#deck');
console.log('Drew a card');

// Method 2: Check if drawing is required and draw appropriate number of cards
const requiredDraws = await page.evaluate(() => window.gameState.requiredDraws);
if (requiredDraws > 0) {
  console.log(`Need to draw ${requiredDraws} cards`);
  
  // Draw required number of cards one by one
  for (let i = 0; i < requiredDraws; i++) {
    await page.click('#deck');
    console.log(`Drew card ${i+1} of ${requiredDraws}`);
    // Wait between draws
    await sleep(500);
  }
}

// Wait for drawing to complete
await page.waitForFunction(() => window.gameState.requiredDraws === 0);

// Verify hand size has increased
const handSizeAfter = await page.evaluate(() => window.gameState.players[0].hand.length);
console.log('Hand size after drawing:', handSizeAfter);
```

### Verifying Turn Progression

After playing a card or drawing when required, turns should progress. Here's how to verify:

```javascript
// Get initial player index
const initialPlayer = await page.evaluate(() => window.gameState.currentPlayerIndex);
console.log('Initial player:', initialPlayer);

// Play a card or draw
// ...

// Verify turn has progressed
const currentPlayer = await page.evaluate(() => window.gameState.currentPlayerIndex);
console.log('Current player:', currentPlayer);

// With normal cards in 2+ player games, the turn should progress
// In a 2-player game with a Skip or Reverse, it might return to the initial player
// In a 3+ player game, Skip should skip the next player
```

### Handling Color Choice for Wild Cards

When a Wild or Wild Draw 4 card is played, the player must choose a color:

```javascript
// Play a wild card
// ...

// After playing, check if color choice is required
const waitingForColorChoice = await page.evaluate(() => window.gameState.waitingForColorChoice);

if (waitingForColorChoice) {
  console.log('Need to choose a color');
  
  // Wait for color choice UI to be visible
  await page.waitForSelector('#color-choice', { visible: true });
  
  // Method 1: Click a specific color button (e.g., red)
  await page.click('[data-color="red"]');
  
  // Method 2: Using evaluate to find and click a color button
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('.color-button');
    for (const button of buttons) {
      if (button.dataset.color === 'blue') {
        button.click();
        break;
      }
    }
  });
  
  // Verify color was set
  const newColor = await page.evaluate(() => window.gameState.currentColor);
  console.log('New color set:', newColor);
}
```

### Dealing with AI Turns

The game automatically handles AI turns, but you might need to wait for them to complete:

```javascript
// Check if it's AI's turn
const isAITurn = await page.evaluate(() => {
  const currentPlayerIndex = window.gameState.currentPlayerIndex;
  return currentPlayerIndex !== 0 && window.gameState.players[currentPlayerIndex].isAI;
});

if (isAITurn) {
  console.log('Waiting for AI to take their turn');
  
  // Wait for turn to come back to human player (index 0)
  // Use a timeout to prevent infinite waiting
  const maxWaitTime = 10000; // 10 seconds
  const startTime = Date.now();
  
  // Keep checking until it's the human's turn again or timeout
  while (Date.now() - startTime < maxWaitTime) {
    const currentPlayerIndex = await page.evaluate(() => window.gameState.currentPlayerIndex);
    if (currentPlayerIndex === 0) {
      console.log('Turn returned to human player');
      break;
    }
    await sleep(500); // Check every half second
  }
}
```

### Monitoring Card Counts

Keeping track of card counts is important for verifying game mechanics:

```javascript
// Get all player card counts
const cardCounts = await page.evaluate(() => {
  return window.gameState.players.map(player => ({
    name: player.name,
    cardCount: player.hand.length,
    isAI: player.isAI
  }));
});

console.log('Player card counts:', cardCounts);

// Check deck size
const deckSize = await page.evaluate(() => window.gameState.deck.length);
console.log('Cards left in deck:', deckSize);

// Check discard pile size
const discardSize = await page.evaluate(() => window.gameState.discardPile.length);
console.log('Cards in discard pile:', discardSize);
```

## Special Card Testing

Testing special card functionality is crucial for ensuring the game works properly. Each special card type requires specific verification steps.

### Testing Skip Cards

Skip cards cause the next player to miss their turn:

```javascript
// Set up a game state with a Skip card for testing
await page.evaluate(() => {
  // Ensure player has a Skip card
  window.gameState.players[0].hand = [
    { color: 'red', value: 'Skip', emoji: '🚫' },
    // Other cards...
  ];
  
  // Set initial discard card (e.g., a red card to match)
  window.gameState.discardPile = [
    { color: 'red', value: '5', emoji: '😎' }
  ];
  
  // Force UI update
  window.dispatchEvent(new CustomEvent('gameStateUpdated'));
});

// Get current player before playing Skip
const initialPlayerIndex = await page.evaluate(() => window.gameState.currentPlayerIndex);
console.log('Initial player index:', initialPlayerIndex);

// Get next player that should be skipped
const nextPlayerIndex = await page.evaluate(() => {
  const current = window.gameState.currentPlayerIndex;
  const direction = window.gameState.direction;
  const playerCount = window.gameState.players.length;
  
  // Calculate next player index based on direction
  let next = (current + direction) % playerCount;
  if (next < 0) next += playerCount;
  
  return next;
});
console.log('Player to be skipped:', nextPlayerIndex);

// Play the Skip card
await page.click('#player-hand .card'); // Click the first card (Skip)
await sleep(1000);

// Get current player after Skip
const afterSkipPlayerIndex = await page.evaluate(() => window.gameState.currentPlayerIndex);
console.log('Player after Skip:', afterSkipPlayerIndex);

// In a 2-player game, it should return to the original player
// In a 3+ player game, it should skip to the player after next
if (await page.evaluate(() => window.gameState.players.length) === 2) {
  console.assert(initialPlayerIndex === afterSkipPlayerIndex, 
    'In 2-player game, Skip should return to original player');
} else {
  // Calculate expected player index after skip (should skip one player)
  const expectedAfterSkip = await page.evaluate(() => {
    const current = window.gameState.currentPlayerIndex;
    const direction = window.gameState.direction;
    const playerCount = window.gameState.players.length;
    
    // Skip one player and go to the next
    let expected = (current + direction * 2) % playerCount;
    if (expected < 0) expected += playerCount;
    
    return expected;
  });
  
  console.assert(afterSkipPlayerIndex === expectedAfterSkip, 
    'Skip should move to the player after next');
}
```

### Testing Reverse Cards

Reverse cards change the direction of play:

```javascript
// Set up a game state with a Reverse card
await page.evaluate(() => {
  // Ensure player has a Reverse card
  window.gameState.players[0].hand = [
    { color: 'blue', value: 'Reverse', emoji: '↩️' },
    // Other cards...
  ];
  
  // Set initial direction
  window.gameState.direction = 1; // 1 for clockwise, -1 for counter-clockwise
  
  // Set initial discard card (e.g., a blue card to match)
  window.gameState.discardPile = [
    { color: 'blue', value: '7', emoji: '😇' }
  ];
  
  // Force UI update
  window.dispatchEvent(new CustomEvent('gameStateUpdated'));
});

// Get direction before playing Reverse
const initialDirection = await page.evaluate(() => window.gameState.direction);
console.log('Initial direction:', initialDirection === 1 ? 'clockwise' : 'counter-clockwise');

// Play the Reverse card
await page.click('#player-hand .card'); // Click the first card (Reverse)
await sleep(1000);

// Get direction after playing Reverse
const newDirection = await page.evaluate(() => window.gameState.direction);
console.log('New direction:', newDirection === 1 ? 'clockwise' : 'counter-clockwise');

// Verify direction changed
console.assert(initialDirection === -newDirection, 'Direction should be reversed');

// In a 2-player game, Reverse acts like Skip
if (await page.evaluate(() => window.gameState.players.length) === 2) {
  // Get current player after Reverse
  const currentPlayer = await page.evaluate(() => window.gameState.currentPlayerIndex);
  console.log('Current player after Reverse in 2-player game:', currentPlayer);
  
  // Should be the same player in a 2-player game (acts like Skip)
  console.assert(currentPlayer === 0, 'In 2-player game, Reverse should act like Skip');
}
```

### Testing Draw 2 Cards

Draw 2 cards make the next player draw two cards and skip their turn:

```javascript
// Set up a game state with a Draw 2 card
await page.evaluate(() => {
  // Ensure player has a Draw 2 card
  window.gameState.players[0].hand = [
    { color: 'green', value: 'Draw 2', emoji: '➕2️⃣' },
    // Other cards...
  ];
  
  // Set initial discard card (e.g., a green card to match)
  window.gameState.discardPile = [
    { color: 'green', value: '4', emoji: '😁' }
  ];
  
  // Force UI update
  window.dispatchEvent(new CustomEvent('gameStateUpdated'));
});

// Get next player's initial hand size
const nextPlayerInitialCardCount = await page.evaluate(() => {
  const nextPlayerIndex = (window.gameState.currentPlayerIndex + window.gameState.direction) % window.gameState.players.length;
  return window.gameState.players[nextPlayerIndex < 0 ? nextPlayerIndex + window.gameState.players.length : nextPlayerIndex].hand.length;
});
console.log('Next player initial card count:', nextPlayerInitialCardCount);

// Play the Draw 2 card
await page.click('#player-hand .card'); // Click the first card (Draw 2)
await sleep(1500); // Wait longer as AI needs to draw cards

// Check if next player's hand size increased by 2
const nextPlayerFinalCardCount = await page.evaluate(() => {
  // Calculate next player index
  const currentPlayerIndex = window.gameState.currentPlayerIndex;
  const direction = window.gameState.direction;
  const playerCount = window.gameState.players.length;
  
  // We need to find who the next player was before the card was played
  // After the card is played, the turn might have moved
  let nextPlayerIndex = currentPlayerIndex; // Start from current player
  
  // Move in the opposite direction to determine who was skipped
  let oppositeDirection = -direction;
  nextPlayerIndex = (nextPlayerIndex + oppositeDirection) % playerCount;
  if (nextPlayerIndex < 0) nextPlayerIndex += playerCount;
  
  return window.gameState.players[nextPlayerIndex].hand.length;
});
console.log('Next player final card count:', nextPlayerFinalCardCount);

// Verify next player drew 2 cards
console.assert(nextPlayerFinalCardCount === nextPlayerInitialCardCount + 2, 
  'Next player should draw 2 cards');

// Verify turn was skipped (check if it's the original player's turn or the player after next)
const currentPlayerIndex = await page.evaluate(() => window.gameState.currentPlayerIndex);
console.log('Current player after Draw 2:', currentPlayerIndex);

// In a 2-player game, it should return to the original player
if (await page.evaluate(() => window.gameState.players.length) === 2) {
  console.assert(currentPlayerIndex === 0, 
    'In 2-player game, Draw 2 should return to original player');
}
```

### Testing Wild Cards

Wild cards allow the player to choose the next color:

```javascript
// Set up a game state with a Wild card
await page.evaluate(() => {
  // Ensure player has a Wild card
  window.gameState.players[0].hand = [
    { color: 'wild', value: 'Wild', emoji: '🌈' },
    // Other cards...
  ];
  
  // Force UI update
  window.dispatchEvent(new CustomEvent('gameStateUpdated'));
});

// Get current color before playing Wild
const initialColor = await page.evaluate(() => window.gameState.currentColor);
console.log('Initial color:', initialColor);

// Play the Wild card
await page.click('#player-hand .card'); // Click the first card (Wild)
await sleep(1000);

// Verify color choice UI appears
const colorChoiceVisible = await page.evaluate(() => {
  return document.querySelector('#color-choice').style.display !== 'none';
});
console.log('Color choice UI visible:', colorChoiceVisible);

// Choose a different color than initial color
const colorToChoose = initialColor === 'red' ? 'blue' : 'red';
await page.evaluate((color) => {
  const buttons = document.querySelectorAll('.color-button');
  for (const button of buttons) {
    if (button.dataset.color === color) {
      button.click();
      break;
    }
  }
}, colorToChoose);

await sleep(1000);

// Verify color was changed
const newColor = await page.evaluate(() => window.gameState.currentColor);
console.log('New color:', newColor);
console.assert(newColor === colorToChoose, 'Color should be changed to selected color');
```

### Testing Wild Draw 4 Cards

Wild Draw 4 cards are the most complex - they change the color and make the next player draw 4 cards and lose their turn:

```javascript
// Set up a game state with a Wild Draw 4 card
await page.evaluate(() => {
  // Ensure player has a Wild Draw 4 card and no cards matching the current color
  // This is important because Wild Draw 4 can only be played legally if player has no matching cards
  window.gameState.currentColor = 'yellow';
  window.gameState.players[0].hand = [
    { color: 'wild', value: 'Wild Draw 4', emoji: '💩' },
    { color: 'red', value: '7', emoji: '😊' },
    { color: 'blue', value: '4', emoji: '😇' },
    { color: 'green', value: '2', emoji: '😁' },
  ];
  
  // Set initial discard card
  window.gameState.discardPile = [
    { color: 'yellow', value: '9', emoji: '😠' }
  ];
  
  // Force UI update
  window.dispatchEvent(new CustomEvent('gameStateUpdated'));
});

// Get next player's initial hand size
const nextPlayerInitialCardCount = await page.evaluate(() => {
  const nextPlayerIndex = (window.gameState.currentPlayerIndex + window.gameState.direction) % window.gameState.players.length;
  return window.gameState.players[nextPlayerIndex < 0 ? nextPlayerIndex + window.gameState.players.length : nextPlayerIndex].hand.length;
});
console.log('Next player initial card count:', nextPlayerInitialCardCount);

// Play the Wild Draw 4 card
await page.click('#player-hand .card'); // Click the first card (Wild Draw 4)
await sleep(1000);

// Choose a color
await page.evaluate(() => {
  const buttons = document.querySelectorAll('.color-button');
  for (const button of buttons) {
    if (button.dataset.color === 'red') {
      button.click();
      break;
    }
  }
});

await sleep(1500); // Wait longer as AI needs to draw cards

// For 2 player game, if next player is AI, they should draw automatically
// For human players (us in this case), we would need to draw cards manually

// Special case: if next player is human (us), we need to draw cards
const isDrawingCards = await page.evaluate(() => window.gameState.isDrawingCards);
const requiredDraws = await page.evaluate(() => window.gameState.requiredDraws);

if (isDrawingCards && requiredDraws > 0) {
  console.log(`Need to draw ${requiredDraws} cards`);
  
  // Draw required number of cards
  for (let i = 0; i < 4; i++) { // Wild Draw 4 should require 4 cards
    await page.click('#deck');
    console.log(`Drew card ${i+1} of 4`);
    await sleep(500);
  }
}

await sleep(1000);

// Check final hand size of next player
const nextPlayerFinalCardCount = await page.evaluate(() => {
  // Calculate next player index (similar to Draw 2 logic)
  const currentPlayerIndex = window.gameState.currentPlayerIndex;
  const direction = window.gameState.direction;
  const playerCount = window.gameState.players.length;
  
  let nextPlayerIndex = currentPlayerIndex;
  let oppositeDirection = -direction;
  nextPlayerIndex = (nextPlayerIndex + oppositeDirection) % playerCount;
  if (nextPlayerIndex < 0) nextPlayerIndex += playerCount;
  
  return window.gameState.players[nextPlayerIndex].hand.length;
});
console.log('Next player final card count:', nextPlayerFinalCardCount);

// Verify next player drew 4 cards
console.assert(nextPlayerFinalCardCount === nextPlayerInitialCardCount + 4, 
  'Next player should draw 4 cards after Wild Draw 4');

// Verify color was changed
const newColor = await page.evaluate(() => window.gameState.currentColor);
console.log('New color after Wild Draw 4:', newColor);
console.assert(newColor === 'red', 'Color should be changed to selected color');

// Verify current player (turn should be skipped)
const currentPlayerIndex = await page.evaluate(() => window.gameState.currentPlayerIndex);
console.log('Current player after Wild Draw 4:', currentPlayerIndex);

// In a 2-player game, it should return to the original player
if (await page.evaluate(() => window.gameState.players.length) === 2) {
  console.assert(currentPlayerIndex === 0, 
    'In 2-player game, Wild Draw 4 should return to original player');
}
```

## Helper Functions

To make testing more efficient and maintainable, here are some useful helper functions for common testing patterns.

### Game State Manipulation

```javascript
/**
 * Set up a specific game state for testing
 * @param {Object} page - Puppeteer page object
 * @param {Object} options - Options for game state setup
 * @param {number} options.playerCount - Number of players (2-4)
 * @param {string} options.currentColor - Current game color ('red', 'blue', 'green', 'yellow')
 * @param {boolean} options.setSpecificCards - Whether to set specific cards for players
 * @param {Object[]} options.humanPlayerCards - Cards for human player
 * @param {Object[]} options.aiPlayerCards - Cards for AI players
 * @param {Object} options.discardCard - Top card on discard pile
 */
async function setupGameState(page, options = {}) {
  const {
    playerCount = 2,
    currentColor = 'blue',
    setSpecificCards = false,
    humanPlayerCards = null,
    aiPlayerCards = null,
    discardCard = null
  } = options;
  
  // Set default human player cards if not provided
  const defaultHumanCards = [
    { color: 'red', value: '7', emoji: '😊' },
    { color: 'blue', value: '4', emoji: '😇' },
    { color: 'green', value: '2', emoji: '😁' },
    { color: 'yellow', value: '9', emoji: '😠' }
  ];
  
  // Set default AI player cards if not provided
  const defaultAICards = [
    { color: 'red', value: '5', emoji: '😎' },
    { color: 'blue', value: '6', emoji: '🙂' },
    { color: 'green', value: '3', emoji: '😄' }
  ];
  
  // Set default discard card if not provided
  const defaultDiscardCard = { color: currentColor, value: '3', emoji: '😍' };
  
  // Setup game state
  await page.evaluate((setup) => {
    // Reset game state
    window.gameState = {
      deck: [],
      discardPile: [],
      players: [],
      currentPlayerIndex: 0,
      direction: 1,
      isGameStarted: true,
      currentColor: setup.currentColor,
      waitingForColorChoice: false,
      pendingDrawPlayerIndex: null,
      pendingDrawCount: 0,
      requiredDraws: 0,
      isDrawingCards: false,
      winningPlayerIndex: undefined
    };
    
    // Set up human player
    const humanPlayer = {
      name: 'Julia',
      hand: setup.setSpecificCards ? setup.humanPlayerCards : setup.defaultHumanCards,
      isAI: false,
      hasCalledUno: false
    };
    
    window.gameState.players.push(humanPlayer);
    
    // Set up AI players based on player count
    const characterNames = ['Bluey', 'Bingo', 'Dad'];
    for (let i = 0; i < setup.playerCount - 1; i++) {
      window.gameState.players.push({
        name: characterNames[i],
        hand: setup.setSpecificCards ? setup.aiPlayerCards : setup.defaultAICards,
        isAI: true,
        hasCalledUno: false
      });
    }
    
    // Set discard pile
    window.gameState.discardPile = [setup.setSpecificCards ? setup.discardCard : setup.defaultDiscardCard];
    
    // Add some random cards to the deck
    const colors = ['red', 'blue', 'green', 'yellow'];
    for (let i = 0; i < 20; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomValue = Math.floor(Math.random() * 10).toString();
      const randomEmoji = ['😊', '😇', '😁', '😠'][Math.floor(Math.random() * 4)];
      
      window.gameState.deck.push({
        color: randomColor,
        value: randomValue,
        emoji: randomEmoji
      });
    }
    
    // Force UI update
    window.dispatchEvent(new CustomEvent('gameStateUpdated'));
    
    return "Game state initialized successfully";
  }, {
    playerCount,
    currentColor,
    setSpecificCards,
    humanPlayerCards: humanPlayerCards || defaultHumanCards,
    aiPlayerCards: aiPlayerCards || defaultAICards,
    discardCard: discardCard || defaultDiscardCard,
    defaultHumanCards,
    defaultAICards,
    defaultDiscardCard
  });
  
  // Wait for UI to update
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Game state initialized with ${playerCount} players`);
}
```

### Player Actions

```javascript
/**
 * Find and play a card of a specific color or value
 * @param {Object} page - Puppeteer page object
 * @param {Object} options - Card search options
 * @param {string} options.color - Color to match ('red', 'blue', 'green', 'yellow', 'wild')
 * @param {string} options.value - Value to match (number or special card name)
 * @returns {Promise<boolean>} - Whether a matching card was found and played
 */
async function findAndPlayCard(page, options = {}) {
  const { color, value } = options;
  
  // Get all cards in player's hand
  const cardIndices = await page.evaluate((search) => {
    const cards = document.querySelectorAll('#player-hand .card');
    const matches = [];
    
    // Search through cards for matches
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const hasColor = !search.color || card.classList.contains(search.color);
      const hasValue = !search.value || card.getAttribute('data-value') === search.value;
      
      // If both color and value match (or weren't specified), add to matches
      if ((hasColor && hasValue) || 
          (search.color && hasColor && !search.value) || 
          (search.value && hasValue && !search.color)) {
        matches.push(i);
      }
    }
    
    return matches;
  }, { color, value });
  
  // If no matching cards, return false
  if (cardIndices.length === 0) {
    console.log(`No cards found matching: ${color || 'any color'} ${value || 'any value'}`);
    return false;
  }
  
  // Click the first matching card
  await page.evaluate((index) => {
    const cards = document.querySelectorAll('#player-hand .card');
    if (cards[index]) {
      cards[index].click();
    }
  }, cardIndices[0]);
  
  // Wait for card to be played
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Played card matching: ${color || 'any color'} ${value || 'any value'}`);
  return true;
}

/**
 * Draw cards from the deck
 * @param {Object} page - Puppeteer page object
 * @param {number} count - Number of cards to draw
 * @returns {Promise<number>} - Number of cards successfully drawn
 */
async function drawCards(page, count = 1) {
  let drawnCount = 0;
  
  for (let i = 0; i < count; i++) {
    // Click the deck
    await page.click('#deck').catch(err => {
      console.error('Error clicking deck:', err);
      return false;
    });
    
    // Wait between draws
    await new Promise(resolve => setTimeout(resolve, 500));
    drawnCount++;
  }
  
  // Wait for all animations to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Drew ${drawnCount} cards`);
  return drawnCount;
}

/**
 * Select a color after playing a wild card
 * @param {Object} page - Puppeteer page object
 * @param {string} color - Color to select ('red', 'blue', 'green', 'yellow')
 * @returns {Promise<boolean>} - Whether color was successfully selected
 */
async function selectWildCardColor(page, color) {
  // Wait for color choice UI to be visible
  await page.waitForSelector('#color-choice', { 
    visible: true, 
    timeout: 5000 
  }).catch(err => {
    console.error('Color choice UI did not appear:', err);
    return false;
  });
  
  // Select the specified color
  const success = await page.evaluate((selectedColor) => {
    const buttons = document.querySelectorAll('.color-button');
    for (const button of buttons) {
      if (button.dataset.color === selectedColor) {
        button.click();
        return true;
      }
    }
    return false;
  }, color);
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (success) {
    console.log(`Selected color: ${color}`);
    return true;
  } else {
    console.error(`Failed to select color: ${color}`);
    return false;
  }
}
```

### Game State Verification

```javascript
/**
 * Get current game state information
 * @param {Object} page - Puppeteer page object
 * @returns {Promise<Object>} - Game state information
 */
async function getGameState(page) {
  return await page.evaluate(() => {
    const { 
      currentPlayerIndex, 
      direction, 
      currentColor, 
      isGameStarted, 
      waitingForColorChoice,
      requiredDraws,
      isDrawingCards,
      players,
      deck,
      discardPile
    } = window.gameState;
    
    return {
      currentPlayerIndex,
      currentPlayerName: players[currentPlayerIndex].name,
      direction: direction === 1 ? 'clockwise' : 'counter-clockwise',
      currentColor,
      isGameStarted,
      waitingForColorChoice,
      requiredDraws,
      isDrawingCards,
      playerCount: players.length,
      deckSize: deck.length,
      discardPileSize: discardPile.length,
      topDiscard: discardPile.length > 0 ? discardPile[discardPile.length - 1] : null,
      players: players.map(p => ({
        name: p.name,
        isAI: p.isAI,
        handSize: p.hand.length,
        hasCalledUno: p.hasCalledUno
      }))
    };
  });
}

/**
 * Take a screenshot with descriptive filename
 * @param {Object} page - Puppeteer page object
 * @param {string} name - Base name for the screenshot
 * @param {string} dir - Directory to save screenshots (default: 'screenshots')
 */
async function takeScreenshot(page, name, dir = 'screenshots') {
  // Ensure directory exists
  const fs = require('fs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Add timestamp to filename to prevent overwriting
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const filename = `${dir}/${name}_${timestamp}.png`;
  
  await page.screenshot({ path: filename });
  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

/**
 * Wait for human player's turn
 * @param {Object} page - Puppeteer page object
 * @param {number} timeout - Maximum wait time in milliseconds
 * @returns {Promise<boolean>} - Whether it's human player's turn
 */
async function waitForHumanTurn(page, timeout = 10000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const isHumanTurn = await page.evaluate(() => {
      return window.gameState.currentPlayerIndex === 0 && 
             !window.gameState.waitingForColorChoice &&
             !window.gameState.isDrawingCards;
    });
    
    if (isHumanTurn) {
      console.log('It is now human player\'s turn');
      return true;
    }
    
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Timed out waiting for human player\'s turn');
  return false;
}
```

### Complete Test Example

Here's a complete example that puts it all together:

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

// Utility function for sleep/delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Main test function
async function testBlueyUno() {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
    args: ['--window-size=1200,800'],
    devtools: true
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the game
    await page.goto('http://localhost:1234/', { waitUntil: 'networkidle2' });
    console.log('Game loaded');
    
    // Take initial screenshot
    await takeScreenshot(page, 'initial_load');
    
    // Start a new game (2 players)
    console.log('Starting a new 2-player game');
    await page.waitForSelector('.welcome-screen button', { visible: true });
    await page.click('.welcome-screen button');
    
    // Wait for game to initialize
    await page.waitForSelector('#player-hand .card', { visible: true });
    await sleep(1000);
    
    // Get and log initial game state
    const initialState = await getGameState(page);
    console.log('Initial game state:', JSON.stringify(initialState, null, 2));
    await takeScreenshot(page, 'game_started');
    
    // Play a valid card
    const foundCard = await findAndPlayCard(page, { color: initialState.currentColor });
    if (foundCard) {
      console.log('Successfully played a card');
      await takeScreenshot(page, 'after_play_card');
      
      // Wait for AI response
      await sleep(2000);
      await takeScreenshot(page, 'after_ai_turn');
      
      // Wait for it to be human player's turn again
      await waitForHumanTurn(page);
      
      // Draw a card
      await drawCards(page, 1);
      await takeScreenshot(page, 'after_draw_card');
    } else {
      // If no valid card, draw and then play if possible
      console.log('No valid card to play, drawing a card');
      await drawCards(page, 1);
      await takeScreenshot(page, 'after_draw_no_valid_cards');
      
      // Try to play a valid card again
      await findAndPlayCard(page, {});
    }
    
    // Get final game state
    const finalState = await getGameState(page);
    console.log('Final game state:', JSON.stringify(finalState, null, 2));
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Keep browser open for manual inspection or close it
    console.log('Test complete. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to close the browser when done.');
    
    // Uncomment to auto-close browser
    // await browser.close();
  }
}

// Ensure screenshots directory exists
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the test
testBlueyUno();
```