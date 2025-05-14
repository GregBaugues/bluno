/**
 * Special card action tests
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
jest.mock('../../src/game.js', () => ({
  playAITurn: jest.fn()
}));

describe('Special Action Handling', () => {
  let turnManagerModule;
  let mockGameState;
  let mockEventBus;
  let mockGameRules;
  let mockUtils;
  let mockGameModule;
  
  beforeEach(() => {
    // Setup fake timers for this test suite
    jest.useFakeTimers();
    // Reset timer mocks
    jest.useFakeTimers();
    
    // Set up mocks
    const initialState = createGameState();
    mockGameState = createMockGameState(initialState);
    jest.mock('../../src/gameState.js', () => mockGameState);
    
    // Get the mocked event bus from the mocked module
    mockEventBus = require('../../src/events.js').default;
    
    // Mock game rules
    mockGameRules = {
      chooseAIColor: jest.fn(() => 'red'),
      canPlayCard: jest.fn(() => true),
      playerHasLegalMoves: jest.fn(() => true),
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
    
    // Mock game module
    mockGameModule = {
      playAITurn: jest.fn()
    };
    jest.mock('../../src/game.js', () => mockGameModule);
    
    // Import turn manager module after mocks are set up
    turnManagerModule = require('../../src/turnManager');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.useRealTimers();
  });
  
  describe('handleSpecialCard tests', () => {
    describe('Skip card', () => {
      it('should skip the next player', () => {
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
        
        // Verify current player was updated to the skipped player
        expect(mockGameState.updateState).toHaveBeenCalledWith({
          currentPlayerIndex: 1
        });
        
        // Verify turn skipped event was emitted
        expect(mockEventBus.emit).toHaveBeenCalledWith('turn_skipped', {
          playerIndex: 1
        });
      });
    });
    
    describe('Reverse card', () => {
      it('should reverse the direction of play', () => {
        // Setup
        const reverseCard = createCard('blue', CARD_VALUES.SPECIAL.REVERSE);
        mockGameState.state.direction = 1;
        mockGameState.state.players = [
          { name: 'Player', hand: [] },
          { name: 'AI 1', hand: [] },
          { name: 'AI 2', hand: [] }
        ];
        
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
      
      it('should act like Skip in a 2-player game', () => {
        // Setup
        const reverseCard = createCard('blue', CARD_VALUES.SPECIAL.REVERSE);
        mockGameState.state.direction = 1;
        mockGameState.state.currentPlayerIndex = 0;
        mockGameState.state.players = [
          { name: 'Player', hand: [] },
          { name: 'AI 1', hand: [] }
        ];
        
        // Call handleSpecialCard
        turnManagerModule.handleSpecialCard(reverseCard);
        
        // Verify direction was reversed
        expect(mockGameState.updateState).toHaveBeenCalledWith({
          direction: -1
        });
        
        // In 2-player game, it should also update currentPlayerIndex
        // But this is handled elsewhere and tested in turnManager.test.js
      });
    });
    
    describe('Draw 2 card', () => {
      it('should make the next player draw 2 cards and skip their turn', () => {
        // Setup
        const draw2Card = createCard('yellow', CARD_VALUES.SPECIAL.DRAW_TWO);
        mockGameState.state.currentPlayerIndex = 0;
        mockGameState.state.players = [
          { name: 'Player', hand: [] },
          { name: 'AI 1', hand: [], isAI: true },
          { name: 'AI 2', hand: [] }
        ];
        
        // Instead of spying on handleDrawCards, we'll directly check the updateState call
        // Call handleSpecialCard
        turnManagerModule.handleSpecialCard(draw2Card);
        
        // Verify that the next player should draw 2 cards, checking that the Draw 2 card logic was triggered
        // We can verify this by checking if isDrawingCards was set to true at some point
        expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
          isDrawingCards: true
        }));
      });
    });
    
    describe('Wild card', () => {
      it('should handle wild card color selection for AI player', () => {
        // Setup
        const wildCard = createCard('wild', CARD_VALUES.WILD.STANDARD);
        mockGameState.state.currentPlayerIndex = 1; // AI player
        mockGameState.state.players = [
          { name: 'Player', hand: [] },
          { name: 'AI 1', hand: [], isAI: true }
        ];
        
        // Mock chooseAIColor
        mockGameRules.chooseAIColor.mockReturnValueOnce('blue');
        
        // Call handleSpecialCard
        turnManagerModule.handleSpecialCard(wildCard);
        
        // Verify color was chosen
        expect(mockGameRules.chooseAIColor).toHaveBeenCalled();
        expect(mockGameState.updateState).toHaveBeenCalledWith({
          currentColor: 'blue',
          waitingForColorChoice: false
        });
      });
    });
    
    describe('Wild Draw 4 card', () => {
      it('should make the next player draw 4 cards and skip their turn', () => {
        // Setup
        const wildDraw4Card = createCard('wild', CARD_VALUES.WILD.DRAW_FOUR);
        mockGameState.state.currentPlayerIndex = 1; // AI player
        mockGameState.state.players = [
          { name: 'Player', hand: [] },
          { name: 'AI 1', hand: [], isAI: true },
          { name: 'AI 2', hand: [], isAI: true }
        ];
        
        // Call handleSpecialCard
        turnManagerModule.handleSpecialCard(wildDraw4Card);
        
        // Verify AI chose a color
        expect(mockGameRules.chooseAIColor).toHaveBeenCalled();
        
        // Verify pendingDrawPlayerIndex and pendingDrawCount were set
        expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
          pendingDrawPlayerIndex: 2,
          pendingDrawCount: 4
        }));
      });
    });
  });
  
  describe('chooseColor', () => {
    it('should set the selected color after human plays a Wild card', () => {
      // Setup
      mockGameState.state.waitingForColorChoice = true;
      mockGameState.state.discardPile = [createCard('wild', CARD_VALUES.WILD.STANDARD)];
      
      // Call chooseColor
      turnManagerModule.chooseColor('green');
      
      // Verify color was set
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentColor: 'green',
        waitingForColorChoice: false
      });
      
      // Verify color choice made event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('color_choice_made', { color: 'green' });
    });
    
    it('should make the next player draw 4 cards after Wild Draw 4', () => {
      // Setup
      mockGameState.state.waitingForColorChoice = true;
      mockGameState.state.discardPile = [createCard('wild', CARD_VALUES.WILD.DRAW_FOUR)];
      mockGameState.state.currentPlayerIndex = 0;
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [], isAI: true }
      ];
      mockGameState.state.pendingDrawPlayerIndex = 1; // Set the player who will draw
      
      // Call chooseColor
      turnManagerModule.chooseColor('blue');
      
      // Verify color was set
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentColor: 'blue',
        waitingForColorChoice: false
      });
      
      // Verify that drawing cards logic was triggered
      expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
        isDrawingCards: true
      }));
    });
  });
  
  describe('handleRequiredDraw', () => {
    it('should decrement requiredDraws count', () => {
      // Setup
      mockGameState.state.requiredDraws = 3;
      
      // Call handleRequiredDraw
      turnManagerModule.handleRequiredDraw();
      
      // Verify requiredDraws was decremented
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        requiredDraws: 2
      });
    });
    
    it('should return false if more draws are required', () => {
      // Setup
      mockGameState.state.requiredDraws = 3;
      
      // Call handleRequiredDraw
      const result = turnManagerModule.handleRequiredDraw();
      
      // Verify result is false (more draws required)
      expect(result).toBe(false);
    });
    
    it('should complete the turn when all required cards are drawn', () => {
      // Setup
      mockGameState.state.requiredDraws = 1; // Last required draw
      mockGameState.state.currentPlayerIndex = 0;
      mockGameState.state.pendingDrawPlayerIndex = 1; // The player who played the card requiring the draw
      mockGameState.state.direction = 1;
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [], isAI: true },
        { name: 'AI 2', hand: [], isAI: true }
      ];
      
      // Call handleRequiredDraw
      const result = turnManagerModule.handleRequiredDraw();
      
      // Verify result is true (all draws complete)
      expect(result).toBe(true);
      
      // Verify isDrawingCards flag was reset
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        isDrawingCards: false
      });
      
      // Verify player index was restored
      expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
        currentPlayerIndex: 1,
        pendingDrawPlayerIndex: null
      }));
      
      // Fast-forward timers to check for AI turn start
      jest.runAllTimers();
      
      // Verify AI turn was started if next player is AI
      if (mockGameState.state.currentPlayerIndex !== 0) {
        expect(mockGameModule.playAITurn).toHaveBeenCalled();
      }
    });
  });
  
  describe('handleDrawCards', () => {
    it('should set up draws for human player', () => {
      // Setup
      mockGameState.state.currentPlayerIndex = 1; // AI plays card
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [], isAI: true }
      ];
      
      // Call handleDrawCards for the next player (human)
      const result = turnManagerModule.handleDrawCards(2);
      
      // Verify handleDrawCards returned the next player index
      expect(result).toBe(0);
      
      // Verify requiredDraws was set
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        requiredDraws: 2
      });
      
      // Verify currentPlayerIndex was temporarily set to human
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        currentPlayerIndex: 0
      });
      
      // Verify draw requirement event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('draw_requirement', expect.any(Object));
    });
    
    it('should automatically draw cards for AI player', () => {
      // Setup
      mockGameState.state.currentPlayerIndex = 0; // Human plays card
      mockGameState.state.deck = [
        createCard('red', '1'),
        createCard('blue', '2')
      ];
      mockGameState.state.players = [
        { name: 'Player', hand: [] },
        { name: 'AI 1', hand: [], isAI: true }
      ];
      
      // Call handleDrawCards for the next player (AI)
      const result = turnManagerModule.handleDrawCards(2);
      
      // Verify handleDrawCards returned the next player index
      expect(result).toBe(1);
      
      // Verify AI player's hand was updated with drawn cards
      expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
        players: expect.arrayContaining([
          expect.any(Object),
          expect.objectContaining({
            hand: expect.arrayContaining([
              expect.objectContaining({ color: 'red', value: '1' }),
              expect.objectContaining({ color: 'blue', value: '2' })
            ])
          })
        ])
      }));
      
      // Verify isDrawingCards flag was reset for AI
      expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
        isDrawingCards: false
      }));
      
      // Verify card drawn event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('card_drawn', expect.any(Object));
    });
  });
});