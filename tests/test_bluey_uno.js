const puppeteer = require('puppeteer');

// Utility function for sleep/delay
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testBlueyUno() {
  // Launch browser - non-headless for better visibility
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1024, height: 768 },
    args: ['--window-size=1200,800']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Starting Bluey Uno test...');
    
    // Navigate to the game
    await page.goto('http://localhost:1234/', { waitUntil: 'networkidle2' });
    console.log('Game loaded');
    
    // Take a screenshot of initial state
    await page.screenshot({ path: 'game-start.png' });
    
    // Start a 2-player game (click first button)
    console.log('Starting a 2-player game');
    await page.waitForSelector('.welcome-screen button');
    await page.click('.welcome-screen button');
    
    // Wait for game to initialize
    await page.waitForSelector('#player-hand .card', { visible: true });
    await sleep(1000);
    
    // Take a screenshot of game start
    await page.screenshot({ path: 'game-started.png' });
    
    // Get initial game state
    const initialState = await page.evaluate(() => ({
      currentPlayer: window.gameState.currentPlayerIndex,
      currentColor: window.gameState.currentColor,
      playerHand: window.gameState.players[0].hand.length,
      opponentHand: window.gameState.players[1].hand.length,
      discardTop: window.gameState.discardPile[window.gameState.discardPile.length - 1]
    }));
    
    console.log('Initial game state:', initialState);
    
    // Wait to ensure it's player's turn
    await page.waitForFunction(() => 
      window.gameState.currentPlayerIndex === 0 && 
      !window.gameState.waitingForColorChoice && 
      !window.gameState.isDrawingCards,
      { timeout: 5000 }
    ).catch(() => console.log('Waiting for player turn timed out'));
    
    // Test 1: Play a card using data-playable attribute
    console.log('\nTEST 1: Playing a playable card');
    const hasPlayable = await page.evaluate(() => {
      return document.querySelectorAll('[data-playable="true"]').length > 0;
    });
    
    if (hasPlayable) {
      // Play the first playable card using data-playable attribute
      console.log('Playing a playable card...');
      await page.click('[data-playable="true"]');
      
      // Check if played card was a wild card
      const needsColorChoice = await page.evaluate(() => 
        window.gameState.waitingForColorChoice
      );
      
      if (needsColorChoice) {
        // Choose a color (red) using data-testid
        console.log('Choosing color for wild card...');
        await page.waitForSelector('#color-choice', { visible: true });
        await page.click('[data-testid="color-button-red"]');
      }
      
      console.log('Card played successfully');
    } else {
      console.log('No playable cards found, skipping play test');
    }
    
    // Wait for AI turn to complete
    await sleep(2000);
    
    // Make sure it's player's turn again
    await page.waitForFunction(() => 
      window.gameState.currentPlayerIndex === 0 && 
      !window.gameState.waitingForColorChoice && 
      !window.gameState.isDrawingCards,
      { timeout: 5000 }
    ).catch(() => console.log('Waiting for player turn timed out'));
    
    // Test 2: Draw a card from the deck
    console.log('\nTEST 2: Drawing a card from the deck');
    const handSizeBefore = await page.evaluate(() => 
      window.gameState.players[0].hand.length
    );
    console.log('Hand size before drawing:', handSizeBefore);
    
    // Draw a card using data-testid
    await page.click('[data-testid="deck"]');
    await sleep(1000);
    
    // Verify hand size increased
    const handSizeAfter = await page.evaluate(() => 
      window.gameState.players[0].hand.length
    );
    console.log('Hand size after drawing:', handSizeAfter);
    
    if (handSizeAfter > handSizeBefore) {
      console.log('Successfully drew a card');
    } else {
      console.log('Failed to draw a card or card draw not reflected in hand size');
    }
    
    // Test 3: Try to find and play a Wild card if available
    console.log('\nTEST 3: Finding and playing a Wild card (if available)');
    const hasWildCard = await page.evaluate(() => {
      return document.querySelectorAll('[data-color="wild"][data-playable="true"]').length > 0;
    });
    
    if (hasWildCard) {
      console.log('Found a Wild card, playing it...');
      await page.click('[data-color="wild"][data-playable="true"]');
      
      // Wait for color choice UI
      await page.waitForSelector('#color-choice[data-active="true"]', { visible: true, timeout: 5000 })
        .catch(() => console.log('Color choice UI did not appear'));
      
      // Choose blue color
      console.log('Choosing blue color...');
      await page.click('[data-testid="color-button-blue"]');
      
      // Verify color was set
      await sleep(1000);
      const newColor = await page.evaluate(() => window.gameState.currentColor);
      console.log('New color set:', newColor);
      
      if (newColor === 'blue') {
        console.log('Successfully set color to blue');
      } else {
        console.log('Failed to set color to blue');
      }
    } else {
      console.log('No Wild card available to play');
    }
    
    // Test 4: Using testHelpers to get game state
    console.log('\nTEST 4: Using testHelpers to access game state');
    const gameState = await page.evaluate(() => {
      return window.testHelpers ? window.testHelpers.getGameState() : 'testHelpers not available';
    });
    
    console.log('Game state via testHelpers:', 
      typeof gameState === 'string' ? gameState : JSON.stringify(gameState, null, 2));
    
    // Take a final screenshot
    await page.screenshot({ path: 'test-completed.png' });
    console.log('\nTest completed successfully');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Keep browser open for a moment so we can see the final state
    await sleep(5000);
    await browser.close();
    console.log('Test complete. Browser closed.');
  }
}

// Run the test
testBlueyUno();