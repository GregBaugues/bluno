/**
 * AI player decision making tests
 */
import { 
  createCard,
  createPlayer,
  createGameState
} from '../fixtures/gameFixtures';
import { 
  createAIDecisionScenario 
} from '../fixtures/playerFixtures';
import { createMockGameState, createMockEventBus } from '../testUtils';
import { CARD_VALUES } from '../../../src/constants';
import { GameEvents } from '../../../src/events';

// Import the modules to test
const gameRules = require('../../../src/gameRules');
const game = require('../../../src/game');
const turnManager = require('../../../src/turnManager');
const gameState = require('../../../src/gameState');
const events = require('../../../src/events');

// Setup spy for playCard function
jest.spyOn(turnManager, 'playCard');
jest.spyOn(turnManager, 'drawSingleCard');

describe('AI Player Decision Making', () => {
  let mockGameState;
  let mockEventBus;
  
  beforeEach(() => {
    // Setup fresh mocks for each test
    jest.clearAllMocks();
    
    // Create default AI game state
    mockGameState = createMockGameState(createAIDecisionScenario());
    mockEventBus = createMockEventBus();
    
    // Mock gameState
    gameState.state = mockGameState.state;
    gameState.updateState = jest.fn(updates => mockGameState.updateState(updates));
    
    // Mock events
    events.emit = jest.fn((event, data) => mockEventBus.emit(event, data));
    
    // Mock setTimeout to execute immediately for testing
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Basic card selection', () => {
    it('should select a playable card when multiple options exist', () => {
      // AI player (index 1) has both color and value matches in hand
      game.playAITurn();
      
      // Verify AI player made a move
      expect(turnManager.playCard).toHaveBeenCalled();
      expect(turnManager.playCard.mock.calls[0][0]).toBe(1); // AI player index
    });
    
    it('should draw a card when no playable cards exist', () => {
      // Set up a scenario where AI has no playable cards
      mockGameState.updateState({
        players: [
          mockGameState.state.players[0],
          {
            ...mockGameState.state.players[1],
            hand: [
              createCard('blue', '2'),   // No red or 5 cards
              createCard('green', '3'),
              createCard('yellow', '9')
            ]
          }
        ]
      });
      
      // Run AI turn
      game.playAITurn();
      
      // Verify AI drew a card
      expect(turnManager.drawSingleCard).toHaveBeenCalledWith(1);
    });
    
    it('should play a drawn card if it matches', () => {
      // Set up scenario with no playable cards
      mockGameState.updateState({
        players: [
          mockGameState.state.players[0],
          {
            ...mockGameState.state.players[1],
            hand: [
              createCard('blue', '2'),
              createCard('green', '3')
            ]
          }
        ]
      });
      
      // Mock the drawSingleCard to return a playable card
      turnManager.drawSingleCard.mockImplementation(() => {
        const playableCard = createCard('red', '7');
        mockGameState.state.players[1].hand.push(playableCard);
        return playableCard;
      });
      
      // Run AI turn
      game.playAITurn();
      
      // Verify AI played the drawn card
      expect(turnManager.playCard).toHaveBeenCalledWith(1, 2); // AI player, index of drawn card
    });
    
    it('should skip to next player when drawn card is not playable', () => {
      // Setup AI with no playable cards
      mockGameState.updateState({
        players: [
          mockGameState.state.players[0],
          {
            ...mockGameState.state.players[1],
            hand: [
              createCard('blue', '2'),
              createCard('green', '3')
            ]
          }
        ]
      });
      
      // Mock the drawSingleCard to return a non-playable card
      turnManager.drawSingleCard.mockImplementation(() => {
        const nonPlayableCard = createCard('blue', '7'); // Doesn't match red or 5
        mockGameState.state.players[1].hand.push(nonPlayableCard);
        return nonPlayableCard;
      });
      
      // Spy on nextTurn function
      const nextTurnSpy = jest.spyOn(turnManager, 'nextTurn');
      
      // Run AI turn
      game.playAITurn();
      
      // Verify nextTurn was called and card was not played
      expect(nextTurnSpy).toHaveBeenCalled();
      expect(turnManager.playCard).not.toHaveBeenCalled();
      
      // Clean up spy
      nextTurnSpy.mockRestore();
    });
  });
  
  describe('Wild card strategy', () => {
    it('should choose the most frequent color when playing a wild card', () => {
      // Setup AI with wild card and specific color distribution
      mockGameState.updateState({
        players: [
          mockGameState.state.players[0],
          {
            ...mockGameState.state.players[1],
            hand: [
              createCard('yellow', '2'),
              createCard('yellow', '3'),
              createCard('yellow', '4'), // 3 yellow cards
              createCard('blue', '5'),
              createCard('wild', CARD_VALUES.WILD.STANDARD)
            ]
          }
        ],
        currentColor: 'green', // Not matching any regular cards
        discardPile: [createCard('green', '7')]
      });
      
      // Mock canPlayCard to only allow the wild card
      jest.spyOn(gameRules, 'canPlayCard').mockImplementation((card) => {
        return card.value === CARD_VALUES.WILD.STANDARD;
      });
      
      // Spy on chooseAIColor
      const chooseAIColorSpy = jest.spyOn(gameRules, 'chooseAIColor');
      
      // Run AI turn
      game.playAITurn();
      
      // Verify AI played the wild card
      expect(turnManager.playCard).toHaveBeenCalled();
      
      // Check if handleSpecialCard was called with the wild card
      expect(chooseAIColorSpy).toHaveBeenCalled();
      
      // Verify the color selected is the most frequent (yellow)
      const aiHand = mockGameState.state.players[1].hand;
      const selectedColor = chooseAIColorSpy.mock.calls[0][0];
      expect(selectedColor).toContain(aiHand);
      
      const result = gameRules.chooseAIColor(aiHand);
      expect(result).toBe('yellow');
      
      // Clean up
      chooseAIColorSpy.mockRestore();
    });
  });
  
  describe('UNO call behavior', () => {
    it('should automatically call UNO when down to one card', () => {
      // Setup AI with only two cards
      mockGameState.updateState({
        players: [
          mockGameState.state.players[0],
          {
            ...mockGameState.state.players[1],
            hand: [
              createCard('red', '3'), // Playable card
              createCard('blue', '7')
            ],
            hasCalledUno: false
          }
        ]
      });
      
      // Run AI turn (will play the red card)
      game.playAITurn();
      
      // Verify AI called UNO after playing one of the two cards
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        GameEvents.UNO_CALLED,
        expect.objectContaining({ playerIndex: 1 })
      );
      
      // Verify hasCalledUno flag was set to true
      expect(mockGameState.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.anything(),
            expect.objectContaining({ hasCalledUno: true })
          ])
        })
      );
    });
  });
  
  describe('Handling different game states', () => {
    it('should not attempt to play when game is not started', () => {
      // Set game as not started
      mockGameState.updateState({
        isGameStarted: false
      });
      
      // Run AI turn
      game.playAITurn();
      
      // Verify no moves were made
      expect(turnManager.playCard).not.toHaveBeenCalled();
      expect(turnManager.drawSingleCard).not.toHaveBeenCalled();
    });
    
    it('should not attempt to play when cards are being drawn', () => {
      // Set drawing flag
      mockGameState.updateState({
        isDrawingCards: true
      });
      
      // Run AI turn
      game.playAITurn();
      
      // Verify no moves were made
      expect(turnManager.playCard).not.toHaveBeenCalled();
      expect(turnManager.drawSingleCard).not.toHaveBeenCalled();
    });
    
    it('should reset drawing flag if it was left on for AI players', () => {
      // Set drawing flag for AI
      mockGameState.updateState({
        isDrawingCards: true
      });
      
      // Run AI turn
      game.playAITurn();
      
      // Verify drawing flag was reset
      expect(mockGameState.updateState).toHaveBeenCalledWith(
        expect.objectContaining({ isDrawingCards: false })
      );
    });
  });
});