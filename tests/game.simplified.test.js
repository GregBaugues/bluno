/**
 * Simplified test suite for Bluey Uno game
 * 
 * This minimal test suite focuses on core game functionality
 * rather than implementation details.
 */

// Mock the sound system to avoid AudioContext errors
jest.mock('../src/sounds.js', () => ({
  initialize: jest.fn(),
  play: jest.fn(),
  toggle: jest.fn(),
  enabled: true
}));

// Import game components
import { startGame, drawCard, playCard, chooseColor } from '../src/game.js';
import gameState from '../src/gameState.js';
import { CARD_COLORS, CARD_VALUES } from '../src/constants.js';
import { canPlayCard } from '../src/gameRules.js';

// Basic test helpers - minimal and straightforward
function createTestCard(color, value) {
  return { 
    color, 
    value, 
    emoji: '🃏' 
  };
}

describe('Bluey Uno Game', () => {
  // Reset game state before each test
  beforeEach(() => {
    // Clean up any previous game state
    gameState.initializeEmptyGame();
  });

  describe('Game Initialization', () => {
    test('should start a game with the correct number of players', () => {
      // Start a 3-player game (1 human + 2 AI)
      startGame(3);
      
      // Verify the game started
      expect(gameState.state.isGameStarted).toBe(true);
      
      // Check correct number of players
      expect(gameState.state.players.length).toBe(3);
      
      // First player should be human, others should be AI
      expect(gameState.state.players[0].isAI).toBe(false);
      expect(gameState.state.players[1].isAI).toBe(true);
      expect(gameState.state.players[2].isAI).toBe(true);
    });

    test('should deal 7 cards to each player', () => {
      startGame(2);
      
      // Each player should have 7 cards
      gameState.state.players.forEach(player => {
        expect(player.hand.length).toBe(7);
      });
    });

    test('should place initial card on discard pile', () => {
      startGame(2);
      
      // Discard pile should have one card
      expect(gameState.state.discardPile.length).toBe(1);
      
      // Card should have valid properties
      const initialCard = gameState.state.discardPile[0];
      expect(initialCard).toHaveProperty('color');
      expect(initialCard).toHaveProperty('value');
    });
  });

  describe('Card Rules', () => {
    test('should allow playing matching color', () => {
      // Setup a simple test scenario
      const topDiscard = createTestCard('red', '7');
      const cardToPlay = createTestCard('red', '5');
      
      // Card of matching color should be playable
      expect(canPlayCard(cardToPlay, topDiscard, 'red', [])).toBe(true);
    });

    test('should allow playing matching value', () => {
      const topDiscard = createTestCard('red', '7');
      const cardToPlay = createTestCard('blue', '7');
      
      // Card of matching value should be playable
      expect(canPlayCard(cardToPlay, topDiscard, 'red', [])).toBe(true);
    });

    test('should allow playing wild cards', () => {
      const topDiscard = createTestCard('red', '7');
      const wildCard = createTestCard('wild', 'Wild');
      
      // Wild card should be playable on any card
      expect(canPlayCard(wildCard, topDiscard, 'red', [])).toBe(true);
    });

    test('should allow playing wild draw 4 when no matching color', () => {
      const topDiscard = createTestCard('red', '7');
      const wildDraw4 = createTestCard('wild', 'Wild Draw 4');
      const hand = [
        createTestCard('blue', '5'),
        createTestCard('green', '9'),
        wildDraw4
      ];
      
      // Wild Draw 4 should be playable when no matching colors in hand
      expect(canPlayCard(wildDraw4, topDiscard, 'red', hand)).toBe(true);
    });

    test('should not allow playing wild draw 4 when matching color in hand', () => {
      const topDiscard = createTestCard('red', '7');
      const wildDraw4 = createTestCard('wild', 'Wild Draw 4');
      const hand = [
        createTestCard('red', '5'), // Matching color
        createTestCard('green', '9'),
        wildDraw4
      ];
      
      // Wild Draw 4 should not be playable when matching colors in hand
      expect(canPlayCard(wildDraw4, topDiscard, 'red', hand)).toBe(false);
    });
  });

  describe('Deck Creation', () => {
    test('should create a proper Uno deck', () => {
      startGame(2);
      
      // Combine all cards (deck + hands + discard pile) to check deck composition
      const allCards = [
        ...gameState.state.deck,
        ...gameState.state.players[0].hand,
        ...gameState.state.players[1].hand,
        ...gameState.state.discardPile
      ];
      
      // Should have 108 cards total
      expect(allCards.length).toBe(108);
      
      // Check wild cards (should be 8 total - 4 Wild and 4 Wild Draw 4)
      const wildCards = allCards.filter(card => card.color === 'wild');
      expect(wildCards.length).toBe(8);
      
      // Verify each colored card has an emoji
      allCards.forEach(card => {
        expect(card).toHaveProperty('emoji');
      });
    });
  });
});