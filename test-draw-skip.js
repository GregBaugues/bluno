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
    
    // Function to simulate drawing cards when required
    const drawRequiredCards = async () => {
      const requiredDraws = await getRequiredDraws();
      if (requiredDraws > 0) {
        console.log(`Human needs to draw ${requiredDraws} cards`);
        
        // Click the deck to draw cards
        for (let i = 0; i < requiredDraws; i++) {
          await page.click('#deck');
          await page.waitForTimeout(500); // Small delay between draws
          console.log(`Drew card ${i + 1} of ${requiredDraws}`);
        }
        
        // Wait a bit for the game state to update
        await page.waitForTimeout(2000);
        
        // Check if turn was properly skipped
        const isStillHumanTurn = await isHumanTurn();
        const finalRequiredDraws = await getRequiredDraws();
        
        console.log(`After drawing: Human turn = ${isStillHumanTurn}, Required draws = ${finalRequiredDraws}`);
        
        if (isStillHumanTurn && finalRequiredDraws === 0) {
          console.error('❌ BUG FOUND: Human player can still play after drawing from Draw 2/4!');
          return false;
        } else if (!isStillHumanTurn && finalRequiredDraws === 0) {
          console.log('✅ SUCCESS: Human turn was properly skipped after drawing!');
          return true;
        }
      }
      return null;
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
        console.error('Error during test:', error);
        testCompleted = true;
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
    console.error('Test failed with error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\nTest completed. Browser will remain open for manual verification.');
    console.log('Close browser manually when done.');
    // await browser.close();
  }
}

// Run the test
testDrawSkipMechanics().catch(console.error);