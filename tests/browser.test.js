/**
 * Simple browser-based tests for Bluey Uno
 * 
 * These tests ensure the game loads and performs basic functions in the browser.
 * Tests are designed to be simple and non-brittle.
 */

describe('Bluey Uno Browser Tests', () => {
  // Using global test setup
  beforeAll(async () => {
    // This uses the test setup defined in jest.config.js
    // No special setup needed here
  });

  test('Game loads and shows welcome screen', async () => {
    // Simplified DOM test to check if the welcome screen renders
    document.body.innerHTML = '<div id="game-container"></div>';
    
    // Import modules that will initialize the game
    const gameUI = require('../src/ui.js');
    
    // Check that elements were created
    expect(document.querySelector('.welcome-screen')).not.toBeNull();
  });

  test('Can start game with 2 players', async () => {
    // Setup test DOM
    document.body.innerHTML = '<div id="game-container"></div>';
    
    // Import game components
    const gameUI = require('../src/ui.js');
    const game = require('../src/game.js');
    
    // Start a 2-player game
    game.startGame(2);
    
    // Check that the game state was updated
    expect(game.gameState.state.players.length).toBe(2);
    expect(game.gameState.state.isGameStarted).toBe(true);
    
    // Game UI should show player hand
    expect(document.querySelector('#player-hand')).not.toBeNull();
  });

  test('Playing a card updates game state', async () => {
    // Setup test DOM
    document.body.innerHTML = '<div id="game-container"></div>';
    
    // Import game components
    const gameUI = require('../src/ui.js');
    const game = require('../src/game.js');
    
    // Start game
    game.startGame(2);
    
    // Get initial discard card
    const initialTopCard = game.gameState.state.discardPile[0];
    
    // Find a card in player's hand that can be played
    const { canPlayCard } = require('../src/gameRules.js');
    const playerHand = game.gameState.state.players[0].hand;
    
    const playableCardIndex = playerHand.findIndex(card => 
      canPlayCard(card, initialTopCard, game.gameState.state.currentColor, playerHand)
    );
    
    // Skip test if no playable card found
    if (playableCardIndex === -1) {
      console.log('No playable card found, skipping test');
      return;
    }
    
    // Record initial hand size
    const initialHandSize = playerHand.length;
    
    // Play the card
    game.playCard(0, playableCardIndex);
    
    // Verify hand size decreased
    expect(game.gameState.state.players[0].hand.length).toBe(initialHandSize - 1);
    
    // Verify discard pile has new card
    expect(game.gameState.state.discardPile.length).toBeGreaterThan(1);
  });

  test('Drawing a card increases hand size', async () => {
    // Setup test DOM
    document.body.innerHTML = '<div id="game-container"></div>';
    
    // Import game components
    const gameUI = require('../src/ui.js');
    const game = require('../src/game.js');
    
    // Start game
    game.startGame(2);
    
    // Record initial hand size
    const initialHandSize = game.gameState.state.players[0].hand.length;
    
    // Create a situation where drawing is allowed
    // Set player to have no legal moves
    const currentColor = 'red';
    game.gameState.updateState({ currentColor });
    
    // Replace player's hand with cards that can't be played
    const mockHand = Array(initialHandSize).fill().map(() => ({
      color: 'blue',
      value: '5',
      emoji: '🃏'
    }));
    
    game.gameState.state.players[0].hand = mockHand;
    
    // Make sure it's player's turn
    game.gameState.updateState({
      currentPlayerIndex: 0
    });
    
    // Draw a card
    game.drawCard();
    
    // Verify hand size increased
    expect(game.gameState.state.players[0].hand.length).toBeGreaterThan(initialHandSize);
  });
});