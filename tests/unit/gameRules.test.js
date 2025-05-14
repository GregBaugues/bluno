/**
 * Game rules tests
 */

import { verifyCardPlayability } from './testUtils';
import { createCard } from './fixtures/gameFixtures';
import { CARD_VALUES } from '../../src/constants';

// No mocks needed for these pure function tests
describe('Game Rules', () => {
  // Import the module directly
  const gameRules = require('../../src/gameRules');
  
  describe('canPlayCard', () => {
    it('should allow playing a card matching the current color', () => {
      // Setup
      const card = createCard('red', '7');
      const topDiscard = createCard('red', '3');
      const currentColor = 'red';
      const hand = [card];
      
      // Verify
      verifyCardPlayability(gameRules.canPlayCard, card, topDiscard, currentColor, hand, true);
    });
    
    it('should allow playing a card matching the value of the top discard', () => {
      // Setup
      const card = createCard('blue', '5');
      const topDiscard = createCard('red', '5');
      const currentColor = 'red';
      const hand = [card];
      
      // Verify
      verifyCardPlayability(gameRules.canPlayCard, card, topDiscard, currentColor, hand, true);
    });
    
    it('should allow playing a regular Wild card regardless of color', () => {
      // Setup
      const card = createCard('wild', CARD_VALUES.WILD.STANDARD);
      const topDiscard = createCard('green', '2');
      const currentColor = 'green';
      const hand = [card];
      
      // Verify
      verifyCardPlayability(gameRules.canPlayCard, card, topDiscard, currentColor, hand, true);
    });
    
    it('should not allow playing Wild Draw 4 if player has matching color', () => {
      // Setup
      const wildDraw4 = createCard('wild', CARD_VALUES.WILD.DRAW_FOUR);
      const topDiscard = createCard('blue', '3');
      const currentColor = 'blue';
      const hand = [
        wildDraw4,
        createCard('blue', '5') // Player has a blue card
      ];
      
      // Verify
      verifyCardPlayability(gameRules.canPlayCard, wildDraw4, topDiscard, currentColor, hand, false);
    });
    
    it('should allow playing Wild Draw 4 if player has no matching color', () => {
      // Setup
      const wildDraw4 = createCard('wild', CARD_VALUES.WILD.DRAW_FOUR);
      const topDiscard = createCard('blue', '3');
      const currentColor = 'blue';
      const hand = [
        wildDraw4,
        createCard('red', '5'),
        createCard('green', '7')
        // No blue cards
      ];
      
      // Verify
      verifyCardPlayability(gameRules.canPlayCard, wildDraw4, topDiscard, currentColor, hand, true);
    });
    
    it('should not allow playing a card that does not match color or value', () => {
      // Setup
      const card = createCard('yellow', '7');
      const topDiscard = createCard('red', '3');
      const currentColor = 'red';
      const hand = [card];
      
      // Verify
      verifyCardPlayability(gameRules.canPlayCard, card, topDiscard, currentColor, hand, false);
    });
    
    it('should allow any card if there is no discard pile yet', () => {
      // Setup
      const card = createCard('yellow', '7');
      const topDiscard = null;
      const currentColor = null;
      const hand = [card];
      
      // Verify
      verifyCardPlayability(gameRules.canPlayCard, card, topDiscard, currentColor, hand, true);
    });
  });
  
  describe('playerHasLegalMoves', () => {
    it('should return true if player has a playable card', () => {
      // Setup
      const hand = [
        createCard('red', '3'),
        createCard('blue', '5'),
        createCard('green', '7')
      ];
      const topDiscard = createCard('red', '9');
      const currentColor = 'red';
      
      // Test
      const result = gameRules.playerHasLegalMoves(hand, topDiscard, currentColor);
      
      // Verify player has legal moves (red card matches color)
      expect(result).toBe(true);
    });
    
    it('should return true if player has a wild card', () => {
      // Setup
      const hand = [
        createCard('blue', '3'),
        createCard('wild', CARD_VALUES.WILD.STANDARD),
        createCard('green', '7')
      ];
      const topDiscard = createCard('red', '9');
      const currentColor = 'red';
      
      // Test
      const result = gameRules.playerHasLegalMoves(hand, topDiscard, currentColor);
      
      // Verify player has legal moves (wild card)
      expect(result).toBe(true);
    });
    
    it('should return false if player has no playable cards', () => {
      // Setup
      const hand = [
        createCard('blue', '3'),
        createCard('green', '7'),
        createCard('yellow', '2')
      ];
      const topDiscard = createCard('red', '9');
      const currentColor = 'red';
      
      // Test
      const result = gameRules.playerHasLegalMoves(hand, topDiscard, currentColor);
      
      // Verify player has no legal moves
      expect(result).toBe(false);
    });
  });
  
  describe('chooseAIColor', () => {
    it('should choose the most frequent color in AI hand', () => {
      // Setup - hand with mostly green cards
      const hand = [
        createCard('red', '3'),
        createCard('green', '5'),
        createCard('green', '7'),
        createCard('green', '9'),
        createCard('blue', '2')
      ];
      
      // Test
      const result = gameRules.chooseAIColor(hand);
      
      // Verify green was chosen
      expect(result).toBe('green');
    });
    
    it('should ignore wild cards when choosing color', () => {
      // Setup - hand with wild cards, but blue is most frequent
      const hand = [
        createCard('wild', CARD_VALUES.WILD.STANDARD),
        createCard('wild', CARD_VALUES.WILD.DRAW_FOUR),
        createCard('blue', '2'),
        createCard('blue', '5'),
        createCard('red', '7')
      ];
      
      // Test
      const result = gameRules.chooseAIColor(hand);
      
      // Verify blue was chosen
      expect(result).toBe('blue');
    });
    
    it('should choose any color if hand has no colored cards', () => {
      // Setup - hand with only wild cards
      const hand = [
        createCard('wild', CARD_VALUES.WILD.STANDARD),
        createCard('wild', CARD_VALUES.WILD.DRAW_FOUR)
      ];
      
      // Test
      const result = gameRules.chooseAIColor(hand);
      
      // Verify any color was chosen (red is the default)
      expect(['red', 'blue', 'green', 'yellow']).toContain(result);
    });
  });
  
  describe('checkWinCondition', () => {
    it('should return true if player has no cards', () => {
      // Setup - player with empty hand
      const player = {
        name: 'Player',
        hand: [],
        isAI: false,
        hasCalledUno: false
      };
      
      // Test
      const result = gameRules.checkWinCondition(player);
      
      // Verify win condition is true
      expect(result).toBe(true);
    });
    
    it('should return false if player has cards', () => {
      // Setup - player with cards
      const player = {
        name: 'Player',
        hand: [
          createCard('red', '3'),
          createCard('blue', '5')
        ],
        isAI: false,
        hasCalledUno: false
      };
      
      // Test
      const result = gameRules.checkWinCondition(player);
      
      // Verify win condition is false
      expect(result).toBe(false);
    });
  });
});