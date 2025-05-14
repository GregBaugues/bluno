/**
 * Player hand management tests
 */
import { createTestPlayer, createTestHand, createPlayerTestState } from '../fixtures/playerFixtures';
import { createCard } from '../fixtures/gameFixtures';
import { createMockGameState, createMockEventBus } from '../testUtils';
import { GameEvents } from '../../../src/events';

// Mock the game module to avoid circular dependency
jest.mock('../../../src/game', () => ({
  playAITurn: jest.fn()
}));

// Import modules
const gameRules = require('../../../src/gameRules');
const turnManager = require('../../../src/turnManager');
const gameState = require('../../../src/gameState');
const events = require('../../../src/events');

describe('Player Hand Management', () => {
  let mockGameState;
  let mockEventBus;
  
  beforeEach(() => {
    // Setup a fresh game state and event bus for each test
    mockGameState = createMockGameState(createPlayerTestState());
    mockEventBus = createMockEventBus();
    
    // Mock gameState
    gameState.state = mockGameState.state;
    gameState.updateState = jest.fn(updates => mockGameState.updateState(updates));
    
    // Mock events
    events.emit = jest.fn((event, data) => mockEventBus.emit(event, data));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Adding cards to player hand', () => {
    it('should add a card to player hand when drawn', () => {
      // Initial hand size
      const initialHandSize = mockGameState.state.players[0].hand.length;
      
      // Draw a card for player 0
      const drawnCard = turnManager.drawSingleCard(0);
      
      // Verify card was added to hand
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize + 1);
      expect(mockGameState.state.players[0].hand).toContainEqual(drawnCard);
      
      // Verify event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEvents.CARD_DRAWN,
        expect.objectContaining({ playerIndex: 0, card: drawnCard })
      );
    });
    
    it('should handle drawing multiple cards', () => {
      // Set up required draws
      mockGameState.updateState({ requiredDraws: 2 });
      const initialHandSize = mockGameState.state.players[0].hand.length;
      
      // Draw first card
      turnManager.drawSingleCard(0);
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize + 1);
      
      // Draw second card
      turnManager.drawSingleCard(0);
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize + 2);
    });
    
    it('should reshuffle the discard pile when deck is empty', () => {
      // Setup an empty deck with cards in discard pile
      mockGameState.updateState({
        deck: [],
        discardPile: [
          createCard('red', '1'),
          createCard('blue', '2'),
          createCard('green', '3')
        ]
      });
      
      // Draw a card
      const drawnCard = turnManager.drawSingleCard(0);
      
      // Verify a card was drawn
      expect(drawnCard).not.toBeNull();
      
      // Verify deck was reshuffled (deck should have at least one card from discard pile)
      expect(mockGameState.state.deck.length).toBeGreaterThan(0);
      
      // Verify only the top card remains in discard pile
      expect(mockGameState.state.discardPile.length).toBe(1);
    });
  });
  
  describe('Removing cards from player hand', () => {
    it('should remove a card from hand when played', () => {
      // Setup with a known card in player's hand
      const cardToPlay = createCard('red', '7');
      const initialHand = [...mockGameState.state.players[0].hand, cardToPlay];
      
      mockGameState.updateState({
        players: [{
          ...mockGameState.state.players[0],
          hand: initialHand
        }, ...mockGameState.state.players.slice(1)]
      });
      
      // Get the card index
      const cardIndex = initialHand.length - 1;
      const initialHandSize = initialHand.length;
      
      // Mock the card validation to allow the play
      jest.spyOn(gameRules, 'canPlayCard').mockReturnValue(true);
      
      // Play the card
      turnManager.playCard(0, cardIndex);
      
      // Verify card was removed from hand
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize - 1);
      expect(mockGameState.state.players[0].hand).not.toContainEqual(cardToPlay);
      
      // Verify card was added to discard pile
      expect(mockGameState.state.discardPile[mockGameState.state.discardPile.length - 1])
        .toEqual(cardToPlay);
      
      // Verify event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEvents.CARD_PLAYED,
        expect.objectContaining({ 
          playerIndex: 0,
          card: cardToPlay 
        })
      );
    });
    
    it('should not allow playing an invalid card', () => {
      // Setup
      const initialHandSize = mockGameState.state.players[0].hand.length;
      
      // Mock the card validation to disallow the play
      jest.spyOn(gameRules, 'canPlayCard').mockReturnValue(false);
      
      // Try to play the card
      const result = turnManager.playCard(0, 0);
      
      // Verify card was not removed from hand
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize);
      
      // Verify result is false
      expect(result).toBe(false);
      
      // Verify event was emitted for invalid play
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEvents.INVALID_CARD_PLAY,
        expect.objectContaining({ cardIndex: 0 })
      );
    });
  });
  
  describe('Playable card retrieval', () => {
    it('should identify all playable cards in a hand', () => {
      // Setup a specific hand and discard
      const hand = [
        createCard('red', '3'),   // Matching color
        createCard('blue', '5'),  // Non-matching
        createCard('green', '5'), // Matching value
        createCard('wild', 'Wild') // Wild always playable
      ];
      
      const topDiscard = createCard('red', '5');
      const currentColor = 'red';
      
      // Check each card
      expect(gameRules.canPlayCard(hand[0], topDiscard, currentColor, hand)).toBe(true);  // Red matches color
      expect(gameRules.canPlayCard(hand[1], topDiscard, currentColor, hand)).toBe(false); // Blue doesn't match
      expect(gameRules.canPlayCard(hand[2], topDiscard, currentColor, hand)).toBe(true);  // 5 matches value
      expect(gameRules.canPlayCard(hand[3], topDiscard, currentColor, hand)).toBe(true);  // Wild always playable
      
      // Check if player has any legal moves
      expect(gameRules.playerHasLegalMoves(hand, topDiscard, currentColor)).toBe(true);
    });
    
    it('should correctly determine when a player has no legal moves', () => {
      // Setup a hand with no playable cards
      const hand = [
        createCard('blue', '3'),
        createCard('green', '6'),
        createCard('yellow', '9')
      ];
      
      const topDiscard = createCard('red', '5');
      const currentColor = 'red';
      
      // Verify no cards are playable
      hand.forEach(card => {
        expect(gameRules.canPlayCard(card, topDiscard, currentColor, hand)).toBe(false);
      });
      
      // Verify player has no legal moves
      expect(gameRules.playerHasLegalMoves(hand, topDiscard, currentColor)).toBe(false);
    });
    
    it('should handle Wild Draw 4 cards correctly', () => {
      // A Wild Draw 4 can only be played if the player has no cards of the current color
      
      // Case 1: Player has a card of current color
      const handWithMatchingColor = [
        createCard('red', '3'),
        createCard('blue', '5'),
        createCard('wild', 'Wild Draw 4')
      ];
      
      const topDiscard = createCard('yellow', '7');
      const currentColor = 'red';
      
      // Wild Draw 4 should not be playable
      expect(gameRules.canPlayCard(
        handWithMatchingColor[2], 
        topDiscard, 
        currentColor,
        handWithMatchingColor
      )).toBe(false);
      
      // Case 2: Player has no cards of current color
      const handWithoutMatchingColor = [
        createCard('blue', '3'),
        createCard('green', '5'),
        createCard('wild', 'Wild Draw 4')
      ];
      
      // Wild Draw 4 should be playable
      expect(gameRules.canPlayCard(
        handWithoutMatchingColor[2], 
        topDiscard, 
        currentColor,
        handWithoutMatchingColor
      )).toBe(true);
    });
  });
});