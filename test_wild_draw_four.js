const puppeteer = require('puppeteer');

// Utility function to wait a specified amount of time
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Main testing function
async function testWildDrawFour() {
  console.log('Starting Wild Draw 4 card test...');
  
  // Launch browser with DevTools for easier debugging
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
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'screenshots/01_initial_game.png' });
    
    // Wait for game to initialize
    await sleep(2000);
    
    // Start a game with 2 players (Julia vs. Dad)
    console.log('Modifying game state to set up a 2-player game');
    await page.evaluate(() => {
      // This modifies the game state directly in the browser
      const gameState = window.gameState = {
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
      
      // Create players: Julia (human) and Dad (AI)
      gameState.players = [
        {
          name: 'Julia',
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
          name: 'Dad',
          hand: [
            // Dad has a Wild Draw 4 card that we want to test
            { color: 'wild', value: 'Wild Draw 4', emoji: '💩' },
            { color: 'red', value: '5', emoji: '😎' },
            { color: 'blue', value: '6', emoji: '🙂' }
          ],
          isAI: true,
          hasCalledUno: false
        }
      ];
      
      // Set up the discard pile with a blue 3
      gameState.discardPile = [
        { color: 'blue', value: '3', emoji: '😍' }
      ];
      
      // Add some cards to the deck
      for (let i = 0; i < 10; i++) {
        gameState.deck.push({ color: 'red', value: i.toString(), emoji: '😊' });
        gameState.deck.push({ color: 'blue', value: i.toString(), emoji: '😇' });
        gameState.deck.push({ color: 'green', value: i.toString(), emoji: '😁' });
        gameState.deck.push({ color: 'yellow', value: i.toString(), emoji: '😠' });
      }
      
      // Force update the display
      window.dispatchEvent(new CustomEvent('gameStateUpdated'));
      
      return "Game state modified successfully";
    });
    
    // Take a screenshot of the initial game state
    await page.screenshot({ path: 'screenshots/02_game_setup.png' });
    console.log('Game setup complete');
    
    // Force Dad to play the Wild Draw 4 card (first card in his hand)
    console.log('Making Dad play the Wild Draw 4 card...');
    await page.evaluate(() => {
      // First set the current player to Dad
      window.gameState.currentPlayerIndex = 1;
      
      // Call the playCard function with Dad's index (1) and the Wild Draw 4 card index (0)
      window.playCard(window.gameState, 1, 0);
      
      // Force Dad to choose red as the color
      window.gameState.currentColor = 'red';
      window.gameState.waitingForColorChoice = false;
      
      // Force update the display
      window.dispatchEvent(new CustomEvent('gameStateUpdated'));
      
      return "Dad played Wild Draw 4 and chose red";
    });
    
    // Wait for animations to complete
    await sleep(1000);
    
    // Take a screenshot after Dad plays Wild Draw 4
    await page.screenshot({ path: 'screenshots/03_dad_plays_wild_draw_4.png' });
    console.log('Dad played Wild Draw 4 card');
    
    // Check the game state to see if Julia is required to draw cards
    const gameStateAfterWildDraw4 = await page.evaluate(() => {
      return {
        requiredDraws: window.gameState.requiredDraws,
        isDrawingCards: window.gameState.isDrawingCards,
        currentPlayerIndex: window.gameState.currentPlayerIndex,
        pendingDrawPlayerIndex: window.gameState.pendingDrawPlayerIndex,
        players: window.gameState.players.map(p => ({ 
          name: p.name, 
          handSize: p.hand.length
        }))
      };
    });
    
    console.log('Game state after Wild Draw 4:', gameStateAfterWildDraw4);
    
    // Julia needs to draw 4 cards - we'll simulate clicking the deck 4 times
    console.log('Julia drawing 4 cards...');
    
    for (let i = 0; i < 4; i++) {
      // Click the deck element
      await page.click('#deck');
      
      // Wait a bit between clicks
      await sleep(500);
      
      // Take a screenshot after each card is drawn
      await page.screenshot({ path: `screenshots/04_julia_draws_card_${i+1}.png` });
      
      // Check Julia's hand size after each draw
      const handSize = await page.evaluate(() => window.gameState.players[0].hand.length);
      console.log(`Julia's hand size after draw ${i+1}: ${handSize}`);
    }
    
    // Wait for the turn skip to complete
    await sleep(2000);
    
    // Take a screenshot of the final state
    await page.screenshot({ path: 'screenshots/05_after_drawing_cards.png' });
    
    // Check the game state after all cards are drawn
    const finalGameState = await page.evaluate(() => {
      return {
        currentPlayerIndex: window.gameState.currentPlayerIndex,
        currentPlayer: window.gameState.players[window.gameState.currentPlayerIndex].name,
        requiredDraws: window.gameState.requiredDraws,
        isDrawingCards: window.gameState.isDrawingCards,
        players: window.gameState.players.map(p => ({ 
          name: p.name, 
          handSize: p.hand.length
        }))
      };
    });
    
    console.log('Final game state after Julia draws all cards:', finalGameState);
    
    // Check if Julia's turn was correctly skipped (currentPlayerIndex should be 1 - Dad's turn)
    if (finalGameState.currentPlayerIndex === 1) {
      console.log('SUCCESS: Turn was correctly skipped - Dad is the current player');
    } else {
      console.log('FAILURE: Turn was not skipped correctly - current player is', finalGameState.currentPlayer);
    }
    
    // Check if Julia received all 4 cards
    if (finalGameState.players[0].handSize === 8) {
      console.log('SUCCESS: Julia correctly drew 4 cards (hand size increased from 4 to 8)');
    } else {
      console.log('FAILURE: Julia has incorrect number of cards:', finalGameState.players[0].handSize);
    }
    
    // Check if Dad's hand size is still 2 (had 3, played 1)
    if (finalGameState.players[1].handSize === 2) {
      console.log('SUCCESS: Dad correctly has 2 cards left');
    } else {
      console.log('FAILURE: Dad has incorrect number of cards:', finalGameState.players[1].handSize);
    }
    
    // Final summary
    console.log('\n=== TEST SUMMARY ===');
    console.log('1. Dad played Wild Draw 4 card');
    console.log(`2. Julia's hand size: ${finalGameState.players[0].handSize} cards`);
    console.log(`3. Dad's hand size: ${finalGameState.players[1].handSize} cards`);
    console.log(`4. Current player: ${finalGameState.currentPlayer}`);
    console.log('5. Screenshots captured in the screenshots/ directory');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('Test complete. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to close the browser when done.');
    
    // Uncomment to auto-close browser
    // await browser.close();
  }
}

// Create the screenshots directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run the test
testWildDrawFour();