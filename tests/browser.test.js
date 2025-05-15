/**
 * Simple browser-based tests for Bluey Uno
 * 
 * These tests ensure the game works correctly even without a DOM.
 * We test the game logic only, not the UI rendering.
 */

// Mock the UI components since we're only testing game logic
jest.mock('../src/ui.js', () => ({
  renderGame: jest.fn(),
  updateUI: jest.fn(),
  updatePlayerHand: jest.fn(),
  showWinScreen: jest.fn(),
  setupColorChoiceUI: jest.fn()
}));

// Mock the sound system
jest.mock('../src/sounds.js', () => ({
  initialize: jest.fn(),
  play: jest.fn(),
  toggle: jest.fn(),
  enabled: true
}));

describe('Bluey Uno Game Logic Tests', () => {
  test('Can start game with 2 players', () => {
    // Import game components after mocking dependencies
    const game = require('../src/game.js');
    
    // Start a 2-player game
    game.startGame(2);
    
    // Check that the game state was updated correctly
    expect(game.gameState.state.players.length).toBe(2);
    expect(game.gameState.state.isGameStarted).toBe(true);
    expect(game.gameState.state.players[0].isAI).toBe(false); // First player is human
    expect(game.gameState.state.players[1].isAI).toBe(true);  // Second player is AI
  });

  test('Game initializes with correct deck and hands', () => {
    // Import game components
    const game = require('../src/game.js');
    
    // Start game
    game.startGame(2);
    
    // Verify initial state
    expect(game.gameState.state.deck.length).toBeGreaterThan(0);
    expect(game.gameState.state.discardPile.length).toBe(1);
    expect(game.gameState.state.players[0].hand.length).toBe(7);
    expect(game.gameState.state.players[1].hand.length).toBe(7);
    
    // Verify there are 108 cards total in the game (deck + hands + discard)
    const totalCards = 
      game.gameState.state.deck.length + 
      game.gameState.state.players[0].hand.length + 
      game.gameState.state.players[1].hand.length +
      game.gameState.state.discardPile.length;
    
    expect(totalCards).toBe(108);
  });

  test('Playing a card updates game state', () => {
    // Import game components
    const game = require('../src/game.js');
    
    // Start game
    game.startGame(2);
    
    // Find a card in player's hand that can be played
    const { canPlayCard } = require('../src/gameRules.js');
    const state = game.gameState.state;
    const playerHand = state.players[0].hand;
    const topDiscard = state.discardPile[0];
    
    const playableCardIndex = playerHand.findIndex(card => 
      canPlayCard(card, topDiscard, state.currentColor, playerHand)
    );
    
    // Skip test if no playable card found (unlikely but possible with random dealing)
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
    expect(game.gameState.state.discardPile.length).toBe(2);
  });

  test('Drawing a card when no legal moves increases hand size', () => {
    // Import game components
    const game = require('../src/game.js');
    
    // Start game
    game.startGame(2);
    
    // Create a situation where drawing is allowed
    const state = game.gameState.state;
    const initialHandSize = state.players[0].hand.length;
    
    // Replace player's hand with cards that can't be played
    // We set current color to red and give the player only blue cards
    game.gameState.updateState({ currentColor: 'red' });
    
    // Create a hand with no playable cards
    const mockHand = Array(initialHandSize).fill().map(() => ({
      color: 'blue',
      value: '5',
      emoji: '🃏'
    }));
    
    // Replace the player's hand and make sure it's their turn
    state.players[0].hand = mockHand;
    game.gameState.updateState({ currentPlayerIndex: 0 });
    
    // Mock the top discard to be a red card
    state.discardPile = [{
      color: 'red',
      value: '7',
      emoji: '🃏'
    }];
    
    // Draw a card
    game.drawCard();
    
    // Verify hand size increased
    expect(game.gameState.state.players[0].hand.length).toBeGreaterThan(initialHandSize);
  });
});