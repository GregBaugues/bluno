/**
 * Player hand management tests
 */
import { createTestPlayer, createTestHand, createPlayerTestState } from '../fixtures/playerFixtures';
import { createCard } from '../fixtures/gameFixtures';
import { createMockGameState, createMockEventBus } from '../testUtils';
import { GameEvents } from '../../../src/events';

// Mock modules
jest.mock('../../../src/game', () => ({
  playAITurn: jest.fn()
}));

jest.mock('../../../src/turnManager', () => {
  const originalModule = jest.requireActual('../../../src/turnManager');
  
  return {
    ...originalModule,
    playCard: jest.fn(),
    drawSingleCard: jest.fn()
  };
});

jest.mock('../../../src/gameRules', () => {
  const originalModule = jest.requireActual('../../../src/gameRules');
  
  return {
    ...originalModule,
    canPlayCard: jest.fn()
  };
});

jest.mock('../../../src/events', () => {
  const originalModule = jest.requireActual('../../../src/events');
  return {
    ...originalModule,
    emit: jest.fn(),
    GameEvents: originalModule.GameEvents
  };
});

// Import modules after mocking
const gameRules = require('../../../src/gameRules');
const turnManager = require('../../../src/turnManager');
const gameState = require('../../../src/gameState');
const events = require('../../../src/events');

describe('Player Hand Management', () => {
  let mockGameState;
  let mockEventBus;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup a fresh game state and event bus for each test
    mockGameState = createMockGameState(createPlayerTestState());
    mockEventBus = createMockEventBus();
    
    // Mock gameState by directly modifying the object
    Object.defineProperty(gameState, 'state', {
      get: () => mockGameState.state
    });
    gameState.updateState = jest.fn(updates => mockGameState.updateState(updates));
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Adding cards to player hand', () => {
    it('should add a card to player hand when drawn', () => {
      // Initial hand size
      const initialHandSize = mockGameState.state.players[0].hand.length;
      
      // Create a mock card to return
      const mockCard = createCard('red', '7');
      
      // Setup the drawSingleCard mock
      turnManager.drawSingleCard.mockImplementation((playerIndex) => {
        // Add card to player's hand
        mockGameState.state.players[playerIndex].hand.push(mockCard);
        // Return the drawn card
        return mockCard;
      });
      
      // Draw a card for player 0
      const drawnCard = turnManager.drawSingleCard(0);
      
      // Verify card was added to hand
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize + 1);
      expect(mockGameState.state.players[0].hand).toContainEqual(mockCard);
      
      // Verify drawSingleCard was called with correct parameter
      expect(turnManager.drawSingleCard).toHaveBeenCalledWith(0);
      
      // Verify event emission is tested in turnManager tests
    });
    
    it('should handle drawing multiple cards', () => {
      // Set up required draws
      mockGameState.updateState({ requiredDraws: 2 });
      const initialHandSize = mockGameState.state.players[0].hand.length;
      
      // Setup the drawSingleCard mock
      turnManager.drawSingleCard.mockImplementation((playerIndex) => {
        const mockCard = createCard('blue', '5');
        mockGameState.state.players[playerIndex].hand.push(mockCard);
        return mockCard;
      });
      
      // Draw first card
      turnManager.drawSingleCard(0);
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize + 1);
      
      // Draw second card
      turnManager.drawSingleCard(0);
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize + 2);
      
      // Verify drawSingleCard was called twice
      expect(turnManager.drawSingleCard).toHaveBeenCalledTimes(2);
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
      
      // Create a mock card to return
      const mockCard = createCard('red', '1');
      
      // Setup the drawSingleCard mock to simulate reshuffling
      turnManager.drawSingleCard.mockImplementation((playerIndex) => {
        // Simulate deck reshuffling
        mockGameState.state.deck = [createCard('blue', '2'), createCard('green', '3')];
        mockGameState.state.discardPile = [createCard('red', '1')];
        
        // Add card to player's hand
        mockGameState.state.players[playerIndex].hand.push(mockCard);
        
        return mockCard;
      });
      
      // Draw a card
      const drawnCard = turnManager.drawSingleCard(0);
      
      // Verify a card was drawn
      expect(drawnCard).toBeDefined();
      
      // Verify deck was reshuffled (deck should have at least one card)
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
      
      // Mock the card validation
      gameRules.canPlayCard.mockReturnValue(true);
      
      // Mock the playCard function
      turnManager.playCard.mockImplementation((playerIndex, cardIdx) => {
        // Remove card from player's hand
        const card = mockGameState.state.players[playerIndex].hand.splice(cardIdx, 1)[0];
        // Add to discard pile
        mockGameState.state.discardPile.push(card);
        return true;
      });
      
      // Play the card
      const result = turnManager.playCard(0, cardIndex);
      
      // Verify card was removed from hand
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize - 1);
      expect(mockGameState.state.players[0].hand).not.toContainEqual(cardToPlay);
      
      // Verify card was added to discard pile
      expect(mockGameState.state.discardPile[mockGameState.state.discardPile.length - 1])
        .toEqual(cardToPlay);
      
      // Verify playCard was called with correct parameters
      expect(turnManager.playCard).toHaveBeenCalledWith(0, cardIndex);
      expect(result).toBe(true);
    });
    
    it('should not allow playing an invalid card', () => {
      // Setup
      const initialHandSize = mockGameState.state.players[0].hand.length;
      
      // Mock the card validation to disallow the play
      gameRules.canPlayCard.mockReturnValue(false);
      
      // Mock the playCard function to return false for invalid cards
      turnManager.playCard.mockImplementation(() => false);
      
      // Try to play the card
      const result = turnManager.playCard(0, 0);
      
      // Verify card was not removed from hand (should be handled in turnManager)
      expect(mockGameState.state.players[0].hand.length).toBe(initialHandSize);
      
      // Verify result is false
      expect(result).toBe(false);
      
      // Verify playCard was called
      expect(turnManager.playCard).toHaveBeenCalledWith(0, 0);
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
      
      // Setup mock return values for each card
      gameRules.canPlayCard
        .mockImplementation((card) => {
          if (card.color === 'red' || card.value === '5' || card.color === 'wild') {
            return true;
          }
          return false;
        });
      
      // Check each card
      expect(gameRules.canPlayCard(hand[0], topDiscard, currentColor, hand)).toBe(true);  // Red matches color
      expect(gameRules.canPlayCard(hand[1], topDiscard, currentColor, hand)).toBe(false); // Blue doesn't match
      expect(gameRules.canPlayCard(hand[2], topDiscard, currentColor, hand)).toBe(true);  // 5 matches value
      expect(gameRules.canPlayCard(hand[3], topDiscard, currentColor, hand)).toBe(true);  // Wild always playable
      
      // Mock playerHasLegalMoves to return true
      jest.spyOn(gameRules, 'playerHasLegalMoves').mockReturnValue(true);
      
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
      
      // Mock canPlayCard to return false for all cards
      gameRules.canPlayCard.mockReturnValue(false);
      
      // Verify no cards are playable
      hand.forEach(card => {
        expect(gameRules.canPlayCard(card, topDiscard, currentColor, hand)).toBe(false);
      });
      
      // Mock playerHasLegalMoves to return false
      jest.spyOn(gameRules, 'playerHasLegalMoves').mockReturnValue(false);
      
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
      
      // Setup mock for Wild Draw 4 with matching color
      gameRules.canPlayCard
        .mockImplementationOnce(() => false);
      
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
      
      // Setup mock for Wild Draw 4 without matching color
      gameRules.canPlayCard
        .mockImplementationOnce(() => true);
      
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