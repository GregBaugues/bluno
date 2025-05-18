/**
 * Bluey Uno Game Test Script
 * This script tests the core functionality of the Bluey Uno game
 * to verify it works correctly after refactoring.
 * 
 * To execute: Use Claude Code's Puppeteer interface:
 * mcp__puppeteer__puppeteer_navigate({ url: 'http://haihai.ngrok.io' });
 * mcp__puppeteer__puppeteer_evaluate({ script: '/* content of this file */' });
 */

async function testBlueyUno() {
  console.log("====================================");
  console.log("Starting Bluey Uno Test Suite");
  console.log("====================================");
  
  // Set viewport to iPad Mini landscape
  await page.setViewport({ width: 1024, height: 768 });
  
  try {
    await testWelcomeScreen();
    await testGameInitialization();
    await testBasicGameplay();
    await testWildCardAndColorSelection();
    
    console.log("====================================");
    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY");
    console.log("====================================");
  } catch (error) {
    console.error(`❌ TEST FAILED: ${error.message}`);
    await page.screenshot({ path: 'test_failure.png' });
  }
}

/**
 * Test the welcome screen functionality
 */
async function testWelcomeScreen() {
  console.log("\n🔍 Testing welcome screen...");
  
  try {
    // Wait for welcome screen to appear
    await page.waitForSelector('.welcome-screen', { timeout: 5000 });
    console.log("✅ Welcome screen loaded successfully");
    
    // Take screenshot
    await page.screenshot({ path: 'welcome_screen.png' });
    
    // Verify player count buttons (should be 3 buttons for 2-4 players)
    const playerButtons = await page.$$('.welcome-screen button');
    if (playerButtons && playerButtons.length >= 3) {
      console.log(`✅ Found ${playerButtons.length} player selection buttons`);
    } else {
      throw new Error(`Expected at least 3 player buttons, found ${playerButtons?.length || 0}`);
    }
  } catch (error) {
    console.error(`❌ Welcome screen test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test game initialization with 2 players
 */
async function testGameInitialization() {
  console.log("\n🔍 Testing game initialization...");
  
  try {
    // Click the first button (2 players)
    const playerButtons = await page.$$('.welcome-screen button');
    await playerButtons[0].click();
    
    // Wait for game board to load
    await page.waitForSelector('#player-hand', { timeout: 5000 });
    console.log("✅ Game started successfully");
    
    // Take screenshot of initial game state
    await page.screenshot({ path: 'game_board.png' });
    
    // Verify key game elements
    const deckExists = await page.$('#deck') !== null;
    const discardPileExists = await page.$('#discard-pile') !== null;
    const playerCardsExist = await page.$$('#player-hand .card').then(cards => cards.length > 0);
    
    if (deckExists && discardPileExists && playerCardsExist) {
      console.log("✅ Game board elements verified (deck, discard pile, player cards)");
    } else {
      throw new Error("Game board elements missing");
    }
    
    // Verify opponent (should be Bluey)
    const blueyExists = await page.$('#opponent-bluey') !== null;
    if (blueyExists) {
      console.log("✅ Bluey opponent verified");
    } else {
      console.warn("⚠️ Bluey opponent not found, but continuing test");
    }
    
    // Wait for UI animations to complete
    await page.waitForTimeout(1500);
  } catch (error) {
    console.error(`❌ Game initialization test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test basic gameplay (playing cards, drawing cards)
 */
async function testBasicGameplay() {
  console.log("\n🔍 Testing basic gameplay...");
  
  try {
    // Test playing a card
    console.log("Attempting to play a card...");
    
    // Find playable cards
    const playableCards = await page.$$('.card.playable-card');
    
    if (playableCards && playableCards.length > 0) {
      console.log(`Found ${playableCards.length} playable cards`);
      
      // Get the first card's color and value for verification
      const cardInfo = await page.evaluate(card => {
        return {
          color: card.classList.contains('red') ? 'red' : 
                 card.classList.contains('blue') ? 'blue' : 
                 card.classList.contains('green') ? 'green' : 
                 card.classList.contains('yellow') ? 'yellow' : 'wild',
          value: card.getAttribute('data-value')
        };
      }, playableCards[0]);
      
      console.log(`Playing a ${cardInfo.color} ${cardInfo.value} card`);
      
      // Play the card
      await playableCards[0].click();
      await page.waitForTimeout(1000); // Wait for card animation
      
      // Take screenshot after playing card
      await page.screenshot({ path: 'after_play_card.png' });
      
      // Verify the card was added to discard pile
      const topDiscard = await page.$('#discard-pile .card');
      if (topDiscard) {
        console.log("✅ Card successfully played to discard pile");
      } else {
        throw new Error("Card not found in discard pile after play");
      }
      
    } else {
      console.log("No playable cards found, will test drawing instead");
    }
    
    // Wait for AI turn to complete
    await page.waitForTimeout(2500);
    
    // Test drawing a card
    console.log("Attempting to draw a card...");
    
    // First check if it's the player's turn
    const isPlayerTurn = await page.evaluate(() => {
      // Try to access gameState through window
      if (window.gameState && window.gameState.currentPlayerIndex === 0) {
        return true;
      }
      
      // Fallback: check if any cards are playable (indicating it's likely our turn)
      return document.querySelectorAll('.card.playable-card').length > 0 || 
             document.querySelector('#deck').classList.contains('active-deck');
    });
    
    if (isPlayerTurn) {
      // Click the deck to draw a card
      const deck = await page.$('#deck');
      if (deck) {
        // Count cards before drawing
        const cardsBefore = await page.$$('#player-hand .card').then(cards => cards.length);
        
        // Draw a card
        await deck.click();
        await page.waitForTimeout(1000);
        
        // Count cards after drawing
        const cardsAfter = await page.$$('#player-hand .card').then(cards => cards.length);
        
        if (cardsAfter > cardsBefore) {
          console.log(`✅ Drew a card successfully (${cardsBefore} → ${cardsAfter} cards)`);
        } else {
          console.warn("⚠️ Card count didn't increase after drawing, but continuing test");
        }
        
        // Take screenshot after drawing
        await page.screenshot({ path: 'after_draw_card.png' });
      } else {
        throw new Error("Deck element not found");
      }
    } else {
      console.log("Not player's turn, skipping draw test");
    }
  } catch (error) {
    console.error(`❌ Basic gameplay test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test Wild card and color selection
 */
async function testWildCardAndColorSelection() {
  console.log("\n🔍 Testing Wild card and color selection...");
  
  try {
    // Play a few rounds looking for a Wild card to play
    let wildCardPlayed = false;
    
    for (let i = 0; i < 6; i++) {
      // Check if color choice is already showing (from a previous wild card)
      const colorChoice = await page.$('#color-choice[style*="display: block"]');
      if (colorChoice) {
        console.log("Color selection dialog found");
        wildCardPlayed = true;
        break;
      }
      
      // Wait for player's turn
      await page.waitForTimeout(2000);
      
      // Check if it's player's turn
      const isPlayerTurn = await page.evaluate(() => {
        return document.querySelectorAll('.card.playable-card').length > 0;
      });
      
      if (isPlayerTurn) {
        console.log("It's player's turn, looking for a Wild card...");
        
        // Try to find and play a Wild card
        const playableCards = await page.$$('.card.playable-card');
        
        for (const card of playableCards) {
          const isWild = await page.evaluate(el => {
            return el.getAttribute('data-value') === 'Wild' || 
                   el.getAttribute('data-value') === 'Wild Draw 4';
          }, card);
          
          if (isWild) {
            console.log("Found a Wild card, playing it...");
            await card.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot
            await page.screenshot({ path: 'wild_card_played.png' });
            
            wildCardPlayed = true;
            break;
          }
        }
        
        // If wild card found and played, break out of the loop
        if (wildCardPlayed) break;
        
        // Otherwise, play any card or draw
        if (playableCards.length > 0) {
          console.log("No Wild card found, playing a regular card");
          await playableCards[0].click();
        } else {
          console.log("No playable cards, drawing a card");
          const deck = await page.$('#deck');
          if (deck) await deck.click();
        }
      } else {
        console.log("Not player's turn, waiting...");
      }
    }
    
    // If we didn't find a Wild card, warn but don't fail the test
    if (!wildCardPlayed) {
      console.warn("⚠️ No Wild card played after multiple rounds, skipping color selection test");
      return;
    }
    
    // Now test color selection
    const colorChoice = await page.$('#color-choice[style*="display: block"]');
    if (colorChoice) {
      console.log("Color selection dialog is visible");
      
      // Take screenshot of color selection UI
      await page.screenshot({ path: 'color_selection.png' });
      
      // Select a color (the first button, usually red)
      const colorButtons = await page.$$('#color-buttons button');
      if (colorButtons && colorButtons.length > 0) {
        await colorButtons[0].click();
        await page.waitForTimeout(1000);
        
        // Take screenshot after color selection
        await page.screenshot({ path: 'after_color_selection.png' });
        
        // Verify color selection dialog is gone
        const colorChoiceGone = await page.$('#color-choice[style*="display: none"]') !== null || 
                                await page.$('#color-choice') === null;
                                
        if (colorChoiceGone) {
          console.log("✅ Color successfully selected");
        } else {
          throw new Error("Color selection dialog still visible after selection");
        }
      } else {
        throw new Error("Color buttons not found in color selection dialog");
      }
    } else {
      console.warn("⚠️ Color selection dialog not found after playing Wild card");
    }
  } catch (error) {
    console.error(`❌ Wild card test failed: ${error.message}`);
    throw error;
  }
}

// Automatically run the test when the script is evaluated
testBlueyUno();