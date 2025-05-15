// Test script to reproduce the Wild Draw 4 issue
// This script will run a game and verify the Wild Draw 4 functionality

async function createControlledGame(page) {
  console.log('Setting up a controlled game environment...');
  
  // Navigate to the game
  await page.goto('http://localhost:1234');
  
  // Wait for the welcome screen to be fully loaded
  await page.waitForSelector('.welcome-screen', { timeout: 5000 });
  
  // Start a 4-player game to include Dad
  await page.click('button[textContent="4"]');
  
  // Wait for the game to load
  await page.waitForSelector('#player-hand', { timeout: 5000 });
  
  console.log('Game started with 4 players');
  
  return page;
}

async function setupWildDraw4Scenario(page) {
  // Inject code to modify the game state to create a scenario 
  // where Dad is about to play a Wild Draw 4 on the player
  await page.evaluate(() => {
    console.log('Setting up Wild Draw 4 scenario...');
    
    // Get access to gameState
    const gameState = window.gameState || {};
    
    if (!gameState.players || !gameState.players.length) {
      console.error('Game state not available');
      return;
    }
    
    // Make Dad the current player (index 3)
    gameState.currentPlayerIndex = 3;
    const dadPlayer = gameState.players[3];
    
    // Clear Dad's hand and give him a Wild Draw 4 card
    dadPlayer.hand = [{ 
      color: 'wild', 
      value: 'Wild Draw 4', 
      emoji: '🌈+4' 
    }];
    
    // Force Dad to play the card
    setTimeout(() => {
      console.log('Making Dad play Wild Draw 4...');
      window.playCard(gameState, 3, 0);
    }, 1000);
    
    // Update the UI
    window.updateGameDisplay(gameState);
  });
  
  console.log('Wild Draw 4 scenario set up');
  
  // Give time for Dad to play the card
  await page.waitForTimeout(2000);
  
  // Wait for the color choice UI
  await page.waitForSelector('#color-choice', { timeout: 5000 });
  
  // Dad chooses red as the color
  await page.click('.color-button[data-color="red"]');
  
  console.log('Dad played Wild Draw 4 and chose red');
  
  // Give time for the game to process the color choice
  await page.waitForTimeout(1000);
}

async function verifyDrawCardsBehavior(page) {
  // Capture the initial state for verification
  const initialState = await page.evaluate(() => {
    const gameState = window.gameState || {};
    return {
      humanPlayerCardCount: gameState.players[0].hand.length,
      dadPlayerCardCount: gameState.players[3].hand.length,
      currentPlayerIndex: gameState.currentPlayerIndex,
      requiredDraws: gameState.requiredDraws,
      isDrawingCards: gameState.isDrawingCards
    };
  });
  
  console.log('Initial state:', initialState);
  
  // Draw the 4 required cards
  for (let i = 0; i < 4; i++) {
    console.log(`Drawing card ${i+1}...`);
    
    // Click on the deck
    await page.click('#deck');
    
    // Wait a moment for the card draw to complete
    await page.waitForTimeout(500);
  }
  
  // Capture the final state after drawing cards
  const finalState = await page.evaluate(() => {
    const gameState = window.gameState || {};
    return {
      humanPlayerCardCount: gameState.players[0].hand.length,
      dadPlayerCardCount: gameState.players[3].hand.length,
      currentPlayerIndex: gameState.currentPlayerIndex,
      requiredDraws: gameState.requiredDraws,
      isDrawingCards: gameState.isDrawingCards
    };
  });
  
  console.log('Final state:', finalState);
  
  // Verify the drawn cards were added to the human player's hand
  const cardsAddedToHuman = finalState.humanPlayerCardCount - initialState.humanPlayerCardCount;
  const cardsAddedToDad = finalState.dadPlayerCardCount - initialState.dadPlayerCardCount;
  
  console.log(`Cards added to human player: ${cardsAddedToHuman}`);
  console.log(`Cards added to Dad: ${cardsAddedToDad}`);
  
  if (cardsAddedToHuman === 4) {
    console.log('SUCCESS: Cards were correctly added to human player\'s hand');
  } else {
    console.log('FAILURE: Cards were not correctly added to human player\'s hand');
  }
  
  if (finalState.currentPlayerIndex !== 0) {
    console.log('SUCCESS: Human player\'s turn was correctly skipped after drawing');
  } else {
    console.log('FAILURE: Human player\'s turn was not skipped after drawing');
  }
}

async function runTest(page) {
  try {
    await createControlledGame(page);
    await setupWildDraw4Scenario(page);
    await verifyDrawCardsBehavior(page);
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export the test function
module.exports = { runTest };