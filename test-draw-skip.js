// Test script to verify draw + skip turn mechanics
// This test ensures that when AI plays Draw 2/4 on human, the human's turn is skipped after drawing

const puppeteer = require('puppeteer');

async function testDrawSkipMechanics() {
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    devtools: true 
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to the game...');
    await page.goto('http://localhost:1234', { waitUntil: 'networkidle2' });
    
    console.log('Starting the game...');
    // Look for the start game button/area and click it
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Click to start the game (the game starts when you tap anywhere)
    await page.click('body');
    await page.waitForTimeout(2000); // Wait for game to initialize
    
    console.log('Game started, monitoring for Draw 2/4 scenario...');
    
    // Monitor console logs to track game events
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('draws') || text.includes('Turn:') || text.includes('skip')) {
        console.log('Game Log:', text);
      }
    });
    
    // Function to check if it's human player's turn
    const isHumanTurn = async () => {
      return await page.evaluate(() => {
        // Check if currentPlayerIndex is 0 (human player)
        return window.gameState && window.gameState.currentPlayerIndex === 0;
      });
    };
    
    // Function to check required draws
    const getRequiredDraws = async () => {
      return await page.evaluate(() => {
        return window.gameState ? window.gameState.requiredDraws : 0;
      });
    };
    
    // Function to get detailed game state for debugging
    const getGameState = async () => {
      return await page.evaluate(() => {
        if (!window.gameState) return null;
        return {
          currentPlayerIndex: window.gameState.currentPlayerIndex,
          requiredDraws: window.gameState.requiredDraws,
          turnDirection: window.gameState.turnDirection,
          gamePhase: window.gameState.gamePhase,
          playersCount: window.gameState.players ? window.gameState.players.length : 0,
          currentPlayerHand: window.gameState.players && window.gameState.players[window.gameState.currentPlayerIndex] 
            ? window.gameState.players[window.gameState.currentPlayerIndex].hand.length 
            : 0
        };
      });
    };
    
    // Function to validate game state assertions
    const validateGameState = async (context = '') => {
      const gameState = await getGameState();
      const errors = [];
      
      if (!gameState) {
        errors.push('Game state is null or undefined');
        return { valid: false, errors, gameState };
      }
      
      if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.playersCount) {
        errors.push(`Invalid currentPlayerIndex: ${gameState.currentPlayerIndex} (should be 0-${gameState.playersCount - 1})`);
      }
      
      if (gameState.requiredDraws < 0) {
        errors.push(`Invalid requiredDraws: ${gameState.requiredDraws} (should be >= 0)`);
      }
      
      if (gameState.currentPlayerHand < 0) {
        errors.push(`Invalid current player hand size: ${gameState.currentPlayerHand} (should be >= 0)`);
      }
      
      if (errors.length > 0) {
        console.error(`❌ Game state validation failed ${context}:`, errors);
        console.error('Current game state:', gameState);
      }
      
      return { valid: errors.length === 0, errors, gameState };
    };
    
    // Function to simulate drawing cards when required
    const drawRequiredCards = async () => {
      // Validate game state before starting
      const initialValidation = await validateGameState('before drawing cards');
      if (!initialValidation.valid) {
        throw new Error(`Invalid game state before drawing: ${initialValidation.errors.join(', ')}`);
      }
      
      const requiredDraws = await getRequiredDraws();
      if (requiredDraws > 0) {
        console.log(`Human needs to draw ${requiredDraws} cards`);
        
        // Validate that deck element exists
        const deckExists = await page.$('#deck');
        if (!deckExists) {
          throw new Error('Deck element (#deck) not found on page');
        }
        
        // Click the deck to draw cards
        for (let i = 0; i < requiredDraws; i++) {
          try {
            await page.click('#deck');
            await page.waitForTimeout(500); // Small delay between draws
            console.log(`Drew card ${i + 1} of ${requiredDraws}`);
            
            // Validate state after each draw
            const drawValidation = await validateGameState(`after drawing card ${i + 1}`);
            if (!drawValidation.valid) {
              console.warn(`Game state issues after drawing card ${i + 1}:`, drawValidation.errors);
            }
          } catch (error) {
            throw new Error(`Failed to draw card ${i + 1}: ${error.message}`);
          }
        }
        
        // Wait a bit for the game state to update
        await page.waitForTimeout(2000);
        
        // Final validation after all draws
        const finalValidation = await validateGameState('after completing all draws');
        if (!finalValidation.valid) {
          console.warn('Game state issues after drawing all cards:', finalValidation.errors);
        }
        
        // Check if turn was properly skipped
        const isStillHumanTurn = await isHumanTurn();
        const finalRequiredDraws = await getRequiredDraws();
        const finalGameState = finalValidation.gameState;
        
        console.log(`After drawing: Human turn = ${isStillHumanTurn}, Required draws = ${finalRequiredDraws}`);
        console.log('Final game state:', finalGameState);
        
        // More specific assertions
        if (finalRequiredDraws > 0) {
          throw new Error(`Cards not properly drawn - still ${finalRequiredDraws} required draws remaining`);
        }
        
        if (isStillHumanTurn && finalRequiredDraws === 0) {
          console.error('❌ BUG FOUND: Human player can still play after drawing from Draw 2/4!');
          console.error('Expected: Human turn should be skipped after drawing penalty cards');
          console.error('Actual: Human player still has the turn');
          return false;
        } else if (!isStillHumanTurn && finalRequiredDraws === 0) {
          console.log('✅ SUCCESS: Human turn was properly skipped after drawing!');
          return true;
        } else {
          throw new Error(`Unexpected game state: humanTurn=${isStillHumanTurn}, requiredDraws=${finalRequiredDraws}`);
        }
      }
      return null;
    };
    
    // Function to determine error type for better debugging
    const determineErrorType = (error) => {
      const message = error.message.toLowerCase();
      
      if (message.includes('timeout') || message.includes('waiting for')) {
        return { type: 'TIMEOUT', category: 'Timeout' };
      } else if (message.includes('element') && (message.includes('not found') || message.includes('null'))) {
        return { type: 'ELEMENT_NOT_FOUND', category: 'UI Element' };
      } else if (message.includes('game state') || message.includes('invalid') || message.includes('assertion')) {
        return { type: 'GAME_STATE', category: 'Game Logic' };
      } else if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
        return { type: 'NETWORK', category: 'Network' };
      } else if (message.includes('puppeteer') || message.includes('browser') || message.includes('page')) {
        return { type: 'PUPPETEER', category: 'Browser/Puppeteer' };
      } else {
        return { type: 'UNKNOWN', category: 'Unknown' };
      }
    };
    
    // Monitor the game for up to 2 minutes looking for Draw 2/4 scenarios
    let testPassed = false;
    let testCompleted = false;
    const maxWaitTime = 120000; // 2 minutes
    const startTime = Date.now();
    
    const checkInterval = setInterval(async () => {
      try {
        const currentTime = Date.now();
        if (currentTime - startTime > maxWaitTime) {
          console.log('⏰ Test timeout - no Draw 2/4 scenario occurred within 2 minutes');
          testCompleted = true;
          clearInterval(checkInterval);
          return;
        }
        
        const requiredDraws = await getRequiredDraws();
        const humanTurn = await isHumanTurn();
        
        // If human needs to draw cards, test the scenario
        if (requiredDraws > 0 && humanTurn) {
          console.log('🎯 Found Draw 2/4 scenario! Testing...');
          const result = await drawRequiredCards();
          
          if (result === true) {
            testPassed = true;
            testCompleted = true;
            clearInterval(checkInterval);
          } else if (result === false) {
            testPassed = false;
            testCompleted = true;
            clearInterval(checkInterval);
          }
        }
      } catch (error) {
        // Enhanced error handling with specific error types
        const errorType = determineErrorType(error);
        console.error(`❌ ${errorType.category} Error:`, error.message);
        
        // Log current game state for debugging
        try {
          const currentState = await getGameState();
          console.error('Game state when error occurred:', currentState);
        } catch (stateError) {
          console.error('Could not retrieve game state:', stateError.message);
        }
        
        // Handle different error types appropriately
        switch (errorType.type) {
          case 'TIMEOUT':
            console.error('Suggestion: Increase timeout or check if game is loading properly');
            break;
          case 'ELEMENT_NOT_FOUND':
            console.error('Suggestion: Check if game UI elements have changed or are still loading');
            break;
          case 'GAME_STATE':
            console.error('Suggestion: Verify game logic and state management');
            break;
          case 'NETWORK':
            console.error('Suggestion: Check network connection and server status');
            break;
          case 'PUPPETEER':
            console.error('Suggestion: Check puppeteer configuration and browser compatibility');
            break;
          default:
            console.error('Suggestion: Review test logic and game implementation');
        }
        
        testCompleted = true;
        testPassed = false;
        clearInterval(checkInterval);
      }
    }, 1000);
    
    // Wait for test to complete
    await new Promise(resolve => {
      const waitForCompletion = setInterval(() => {
        if (testCompleted) {
          clearInterval(waitForCompletion);
          resolve();
        }
      }, 100);
    });
    
    if (testPassed) {
      console.log('\n🎉 TEST PASSED: Draw + skip turn mechanics work correctly!');
    } else if (testCompleted) {
      console.log('\n❌ TEST RESULT: Could not verify or bug found in draw + skip mechanics');
    }
    
  } catch (error) {
    // Enhanced top-level error handling
    console.error('\n❌ TEST SUITE FAILED');
    console.error('=====================================');
    
    const errorType = error.name || 'UnknownError';
    console.error(`Error Type: ${errorType}`);
    console.error(`Error Message: ${error.message}`);
    
    // Provide specific guidance based on error type
    if (error.message.includes('ECONNREFUSED') || error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('\n🔧 SOLUTION: The game server is not running.');
      console.error('   Please start the server with: npm start');
      console.error('   Then wait for "Server running at http://localhost:1234"');
    } else if (error.message.includes('timeout') || error.message.includes('Navigation timeout')) {
      console.error('\n🔧 SOLUTION: Page loading timeout.');
      console.error('   - Check if the server is responding at http://localhost:1234');
      console.error('   - Increase timeout values if the game loads slowly');
      console.error('   - Check browser console for JavaScript errors');
    } else if (error.message.includes('Target page, context or browser has been closed')) {
      console.error('\n🔧 SOLUTION: Browser closed unexpectedly.');
      console.error('   - Check if browser crashes during test');
      console.error('   - Try running with headless: false for debugging');
    } else {
      console.error('\n🔧 SOLUTION: Review the error above and check:');
      console.error('   - Game implementation for logical errors');
      console.error('   - Test script compatibility with current game version');
      console.error('   - Browser console for additional error details');
    }
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  } finally {
    // Keep browser open for manual inspection
    console.log('\nTest completed. Browser will remain open for manual verification.');
    console.log('Close browser manually when done.');
    // await browser.close();
  }
}

// Run the test
testDrawSkipMechanics().catch(console.error);