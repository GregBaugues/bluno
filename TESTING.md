# Bluey Uno Testing Plan

This document outlines a testing plan for the Bluey Uno game, which can be executed via Puppeteer to ensure the application still works correctly after refactoring.

## Automated Testing with Puppeteer

The following test scenarios should be executed using Puppeteer to verify core game functionality:

### Basic Game Flow Tests

1. **Game Initialization**
   - Navigate to the game URL
   - Verify welcome screen appears
   - Verify player count options (2-4) are visible

2. **Game Setup**
   - Click on player count selection (e.g., 2 players)
   - Verify game starts with correct number of players
   - Verify player's cards are shown
   - Verify discard pile shows a card
   - Verify deck is visible

3. **Core Gameplay**
   - Verify it's the player's turn initially
   - Test playing a valid card:
     - Find a playable card in the player's hand (matching color or value)
     - Click the card to play it
     - Verify the card moves to the discard pile
     - Verify turn passes to the AI

   - Test drawing a card:
     - Wait for player's turn
     - Click on the deck
     - Verify a new card is added to the player's hand

4. **Special Card Effects**
   - Test "Skip" card:
     - Play a Skip card (if available)
     - Verify opponent's turn is skipped
   
   - Test "Reverse" card:
     - Play a Reverse card (if available)
     - Verify direction indicator changes
     - Verify turn order is reversed

   - Test "Wild" card:
     - Play a Wild card (if available)
     - Verify color selection UI appears
     - Select a color
     - Verify current color changes

   - Test "Draw 2" card:
     - Play a Draw 2 card (if available)
     - Verify opponent draws 2 cards
     - Verify opponent's turn is skipped

5. **Game Completion**
   - Continue playing until a player has one card left
   - Verify "UNO" indicator appears
   - Play final card (or verify AI winning)
   - Verify winner announcement appears
   - Verify option to play again is shown

## Test Script for Puppeteer

The following test script can be executed by Claude using Puppeteer to verify the game works correctly:

```javascript
// Test script for Bluey Uno using Puppeteer
async function testBlueyUno() {
  console.log("Starting Bluey Uno test...");
  
  // Test 1: Navigate to game and verify welcome screen
  await page.goto('http://haihai.ngrok.io');
  await page.waitForSelector('.welcome-screen', { timeout: 5000 });
  console.log("✅ Welcome screen loaded successfully");
  
  // Take screenshot of welcome screen
  await page.setViewport({ width: 1024, height: 768 }); // iPad Mini in landscape
  await page.screenshot({ path: 'welcome_screen.png' });
  
  // Test 2: Start a 2-player game
  const playerButtons = await page.$$('.welcome-screen button');
  if (playerButtons && playerButtons.length > 0) {
    await playerButtons[0].click(); // Select 2 players
    await page.waitForSelector('#player-hand', { timeout: 5000 });
    console.log("✅ Game started successfully with 2 players");
  } else {
    console.error("❌ Player selection buttons not found");
    return;
  }
  
  // Take screenshot of game board
  await page.screenshot({ path: 'game_board.png' });
  
  // Test 3: Play a card
  await page.waitForTimeout(1000); // Wait for animations
  
  // Find a playable card
  const cards = await page.$$('.card.playable-card');
  if (cards && cards.length > 0) {
    console.log(`Found ${cards.length} playable cards`);
    await cards[0].click();
    await page.waitForTimeout(1000); // Wait for card play animation
    console.log("✅ Successfully played a card");
  } else {
    console.log("No playable cards found, will try to draw");
  }
  
  // Take screenshot after playing a card
  await page.screenshot({ path: 'after_card_play.png' });
  
  // Test 4: Draw a card if it's the player's turn
  await page.waitForTimeout(2000); // Wait for AI turn
  
  // Check if it's player's turn
  const isTurn = await page.evaluate(() => {
    return window.gameState && window.gameState.currentPlayerIndex === 0;
  });
  
  if (isTurn) {
    const deck = await page.$('#deck');
    if (deck) {
      await deck.click();
      await page.waitForTimeout(1000); // Wait for draw animation
      console.log("✅ Successfully drew a card");
    } else {
      console.error("❌ Deck not found");
    }
  } else {
    console.log("Not player's turn, skipping draw test");
  }
  
  // Take screenshot after drawing a card
  await page.screenshot({ path: 'after_draw.png' });
  
  // Test 5: Wild card color selection
  // Play a few more rounds to try to get a wild card
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(2000); // Wait for AI turn
    
    // Check if color selection is showing
    const colorChoice = await page.$('#color-choice[style*="display: block"]');
    if (colorChoice) {
      const colorButtons = await page.$$('#color-buttons button');
      if (colorButtons && colorButtons.length > 0) {
        await colorButtons[0].click(); // Select first color
        await page.waitForTimeout(1000);
        console.log("✅ Successfully selected color for wild card");
        break; // Exit the loop
      }
    }
    
    // Try to play a card if it's our turn
    const isPlayerTurn = await page.evaluate(() => {
      return window.gameState && window.gameState.currentPlayerIndex === 0;
    });
    
    if (isPlayerTurn) {
      const playableCards = await page.$$('.card.playable-card');
      // Try to find a wild card
      let wildCardFound = false;
      for (const card of playableCards) {
        const isWild = await page.evaluate(el => {
          return el.getAttribute('data-value') === 'Wild' || 
                 el.getAttribute('data-value') === 'Wild Draw 4';
        }, card);
        
        if (isWild) {
          await card.click();
          console.log("Found and played a wild card");
          wildCardFound = true;
          break;
        }
      }
      
      // If no wild card, just play any card or draw
      if (!wildCardFound && playableCards.length > 0) {
        await playableCards[0].click();
      } else if (!wildCardFound) {
        const deck = await page.$('#deck');
        if (deck) await deck.click();
      }
    }
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'game_progress.png' });
  
  console.log("Bluey Uno test completed!");
}

// Execute the test
testBlueyUno();
```

## Puppeteer Test Execution Guide

1. **Set up Puppeteer**:
   ```javascript
   await mcp__puppeteer__puppeteer_navigate({ url: 'http://haihai.ngrok.io' });
   await mcp__puppeteer__puppeteer_evaluate({ script: '/* test script code here */' });
   ```

2. **Analyze Results**:
   - Check for any console errors
   - Review the screenshots to verify UI elements
   - Ensure proper game flow

3. **Report Findings**:
   - Document successful test cases
   - Note any functionality issues
   - Highlight any regressions after refactoring

## Manual Testing Checklist

In addition to automated testing, the following elements should be manually verified:

- [ ] Game starts with correct number of players (test 2, 3, and 4 player modes)
- [ ] Player's cards are displayed correctly
- [ ] AI opponents are shown with correct characters
- [ ] Cards can be played according to Uno rules
- [ ] Special card effects work correctly
- [ ] Direction changes are indicated properly
- [ ] Winning conditions are detected correctly
- [ ] Sound effects play at appropriate times
- [ ] Game flow handles edge cases (empty deck, etc.)

## Regression Testing Priority

Focus testing efforts on:

1. Game initialization and UI rendering
2. Card playing mechanics
3. Special card effects (particularly Wild and Draw cards)
4. Turn management
5. Win condition detection

These areas were heavily refactored and should be carefully verified to ensure no functionality was lost.