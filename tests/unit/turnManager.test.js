/**
 * Turn management tests
 */

import { createMockGameState } from './testUtils';
import mockEventsModule from './eventsFixture';
import { createGameState, createCard } from './fixtures/gameFixtures';
import { CARD_VALUES } from '../../src/constants';

// Mock dependencies
jest.mock('../../src/gameState.js');
jest.mock('../../src/events.js', () => mockEventsModule);
jest.mock('../../src/gameRules.js');
jest.mock('../../src/utils.js');
jest.mock('../../src/deck.js');

describe('Turn Management', () => {
  let turnManagerModule;
  let mockGameState;
  let mockEventBus;
  let mockGameRules;
  let mockUtils;
  let mockDeck;
  
  beforeEach(() => {
    // Setup fake timers for this test suite
    jest.useFakeTimers();
    // Set up mocks
    const initialState = createGameState();
    mockGameState = createMockGameState(initialState);
    jest.mock('../../src/gameState.js', () => mockGameState);
    
    // Get the mocked event bus from the mocked module
    mockEventBus = require('../../src/events.js').default;
    
    // Mock game rules
    mockGameRules = {
      canPlayCard: jest.fn((card, topDiscard, currentColor, hand) => true),
      playerHasLegalMoves: jest.fn(() => true),
      chooseAIColor: jest.fn(() => 'red'),
      checkWinCondition: jest.fn((player) => player.hand.length === 0)
    };
    jest.mock('../../src/gameRules.js', () => mockGameRules);
    
    // Mock utils
    mockUtils = {
      getNextPlayerIndex: jest.fn((currentIndex, direction, playerCount) => {
        // Simple implementation for testing
        const nextIndex = (currentIndex + direction) % playerCount;
        return nextIndex < 0 ? playerCount + nextIndex : nextIndex;
      }),
      gameLog: jest.fn()
    };
    jest.mock('../../src/utils.js', () => mockUtils);
    
    // Mock deck
    mockDeck = {
      reshuffleDeck: jest.fn((deck, discardPile) => {
        // Keep the top card, shuffle the rest back into the deck
        const topCard = discardPile[discardPile.length - 1];
        return {
          deck: [...deck, ...discardPile.slice(0, -1)],
          discardPile: [topCard]
        };
      })
    };
    jest.mock('../../src/deck.js', () => mockDeck);
    
    // Import turn manager module after mocks are set up
    turnManagerModule = require('../../src/turnManager');
  });
  
  afterEach(() => {
    // Restore real timers after tests
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.resetModules();
  });
  
  describe('nextTurn', () => {
    it('should advance to the next player', () => {
      // Setup
      mockGameState.state.currentPlayerIndex = 0;
      mockGameState.state.direction = 1;
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [] }
      ];
      
      // Call nextTurn
      turnManagerModule.nextTurn();
      
      // Verify current player was updated
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentPlayerIndex: 1
      });
      
      // Verify turn changed event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('turn_changed', {
        previousIndex: 0,
        currentIndex: 1
      });
    });
    
    it('should handle direction when advancing turns', () => {
      // Setup - reverse direction
      mockGameState.state.currentPlayerIndex = 0;
      mockGameState.state.direction = -1;
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [] },
        { name: 'AI 2', hand: [] }
      ];
      
      // Call nextTurn
      turnManagerModule.nextTurn();
      
      // Verify correct player is next (in reverse, 0 -> 2)
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentPlayerIndex: 2
      });
    });
    
    it('should wrap around to the first player when at the end', () => {
      // Setup - last player
      mockGameState.state.currentPlayerIndex = 2;
      mockGameState.state.direction = 1;
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [] },
        { name: 'AI 2', hand: [] }
      ];
      
      // Call nextTurn
      turnManagerModule.nextTurn();
      
      // Verify wrapped to first player
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentPlayerIndex: 0
      });
    });
  });
  
  describe('playCard', () => {
    it('should not allow playing cards while drawing is in progress', () => {
      // Setup - drawing in progress
      mockGameState.state.isDrawingCards = true;
      
      // Try to play a card
      const result = turnManagerModule.playCard(0, 0);
      
      // Verify card was not played
      expect(result).toBe(false);
      expect(mockEventBus.emit).toHaveBeenCalledWith('invalid_card_play', {
        cardIndex: 0,
        message: "You must finish drawing all required cards first!"
      });
    });
    
    it('should not allow playing cards if required draws are pending', () => {
      // Setup - required draws
      mockGameState.state.isDrawingCards = false;
      mockGameState.state.requiredDraws = 2;
      
      // Try to play a card
      const result = turnManagerModule.playCard(0, 0);
      
      // Verify card was not played
      expect(result).toBe(false);
    });
    
    it('should not allow playing invalid cards', () => {
      // Setup
      mockGameState.state.isDrawingCards = false;
      mockGameState.state.requiredDraws = 0;
      
      // Mock canPlayCard to return false
      mockGameRules.canPlayCard.mockReturnValueOnce(false);
      
      // Try to play a card
      const result = turnManagerModule.playCard(0, 0);
      
      // Verify card was not played
      expect(result).toBe(false);
      expect(mockEventBus.emit).toHaveBeenCalledWith('invalid_card_play', {
        cardIndex: 0
      });
    });
    
    it('should move the played card to the discard pile', () => {
      // Setup
      mockGameState.state.isDrawingCards = false;
      mockGameState.state.requiredDraws = 0;
      mockGameState.state.discardPile = [createCard('red', '5')];
      mockGameState.state.players = [
        { name: 'Player', hand: [createCard('red', '7')], isAI: false, hasCalledUno: false },
        { name: 'AI 1', hand: [], isAI: true, hasCalledUno: false }
      ];
      
      // Mock canPlayCard to return true
      mockGameRules.canPlayCard.mockReturnValueOnce(true);
      
      // Play a card
      const result = turnManagerModule.playCard(0, 0);
      
      // Verify card was played
      expect(result).toBe(true);
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        discardPile: expect.arrayContaining([
          expect.objectContaining({ color: 'red', value: '5' }),
          expect.objectContaining({ color: 'red', value: '7' })
        ])
      });
      
      // Verify card played event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('card_played', expect.any(Object));
    });
    
    it('should check for win condition after playing a card', () => {
      // Setup - player with just one card
      mockGameState.state.isDrawingCards = false;
      mockGameState.state.requiredDraws = 0;
      mockGameState.state.discardPile = [createCard('red', '5')];
      mockGameState.state.players = [
        { name: 'Player', hand: [createCard('red', '7')], isAI: false, hasCalledUno: true },
        { name: 'AI 1', hand: [], isAI: true, hasCalledUno: false }
      ];
      
      // Mock canPlayCard to return true
      mockGameRules.canPlayCard.mockReturnValueOnce(true);
      
      // Mock checkWinCondition to return true after card is played
      mockGameRules.checkWinCondition.mockImplementation(player => player.hand.length === 0);
      
      // Play the last card
      turnManagerModule.playCard(0, 0);
      
      // Fast-forward any timeouts
      jest.runAllTimers();
      
      // First update is for the card play, second should be for the win condition
      expect(mockGameState.updateState).toHaveBeenCalledTimes(2);
      
      // Check the second call to have the winning player index set
      expect(mockGameState.updateState.mock.calls[1][0]).toHaveProperty('winningPlayerIndex', 0);
      
      // Verify game ended event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('game_ended', expect.any(Object));
    });
  });
  
  describe('handleSpecialCard', () => {
    it('should update current color for non-wild cards', () => {
      // Setup
      const card = createCard('blue', '5');
      
      // Call handleSpecialCard
      turnManagerModule.handleSpecialCard(card);
      
      // Verify current color was updated
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentColor: 'blue'
      });
    });
    
    it('should skip the next player for Skip cards', () => {
      // Setup
      const skipCard = createCard('red', CARD_VALUES.SPECIAL.SKIP);
      mockGameState.state.currentPlayerIndex = 0;
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [] },
        { name: 'AI 2', hand: [] }
      ];
      
      // Call handleSpecialCard
      turnManagerModule.handleSpecialCard(skipCard);
      
      // Verify skip action was taken
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentPlayerIndex: 1
      });
      
      // Verify turn skipped event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('turn_skipped', {
        playerIndex: 1
      });
    });
    
    it('should reverse direction for Reverse cards', () => {
      // Setup
      const reverseCard = createCard('green', CARD_VALUES.SPECIAL.REVERSE);
      mockGameState.state.direction = 1;
      
      // Call handleSpecialCard
      turnManagerModule.handleSpecialCard(reverseCard);
      
      // Verify direction was reversed
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        direction: -1
      });
      
      // Verify direction changed event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('direction_changed', {
        direction: -1
      });
    });
    
    it('should set waiting for color choice for Wild cards played by human', () => {
      // Setup
      const wildCard = createCard('wild', CARD_VALUES.WILD.STANDARD);
      mockGameState.state.currentPlayerIndex = 0; // Human player
      
      // Call continueAfterCardPlay directly with the wild card
      turnManagerModule.continueAfterCardPlay(wildCard, false, mockGameState.state.players[0], 0);
      
      // Verify waiting for color choice was set
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        waitingForColorChoice: true
      });
      
      // Verify color choice required event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('color_choice_required', expect.any(Object));
    });
    
    it('should automatically choose color for Wild cards played by AI', () => {
      // Setup
      const wildCard = createCard('wild', CARD_VALUES.WILD.STANDARD);
      mockGameState.state.currentPlayerIndex = 1; // AI player
      
      // Mock chooseAIColor
      mockGameRules.chooseAIColor.mockReturnValueOnce('blue');
      
      // Call handleSpecialCard
      turnManagerModule.handleSpecialCard(wildCard);
      
      // Verify AI chose a color automatically
      expect(mockGameRules.chooseAIColor).toHaveBeenCalled();
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentColor: 'blue',
        waitingForColorChoice: false
      });
    });
  });
  
  describe('drawSingleCard', () => {
    it('should draw a card for the specified player', () => {
      // Setup
      const drawnCard = createCard('yellow', '3');
      mockGameState.state.deck = [drawnCard];
      mockGameState.state.players = [
        { name: 'Player', hand: [], isAI: false, hasCalledUno: false },
        { name: 'AI 1', hand: [], isAI: true, hasCalledUno: false }
      ];
      
      // Draw a card for player 0
      const result = turnManagerModule.drawSingleCard(0);
      
      // Verify card was drawn
      expect(result).toEqual(drawnCard);
      expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
        deck: [],
        players: [
          { name: 'Player', hand: [drawnCard], isAI: false, hasCalledUno: false },
          { name: 'AI 1', hand: [], isAI: true, hasCalledUno: false }
        ]
      }));
      
      // Verify card drawn event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('card_drawn', expect.any(Object));
    });
    
    it('should reshuffle the discard pile if the deck is empty', () => {
      // Setup - empty deck
      mockGameState.state.deck = [];
      mockGameState.state.discardPile = [
        createCard('red', '1'),
        createCard('blue', '2'),
        createCard('green', '3')
      ];
      mockGameState.state.players = [
        { name: 'Player', hand: [], isAI: false, hasCalledUno: false }
      ];
      
      // Mock reshuffleDeck to return a new deck and discard pile
      mockDeck.reshuffleDeck.mockReturnValueOnce({
        deck: [createCard('yellow', '4')],
        discardPile: [createCard('green', '3')] // Keep only the top card
      });
      
      // Draw a card
      turnManagerModule.drawSingleCard(0);
      
      // Verify reshuffle was called
      expect(mockDeck.reshuffleDeck).toHaveBeenCalled();
    });
  });
});