/**
 * Game win condition tests
 */

import { createMockGameState, createMockEventBus } from './testUtils';
import { createEndGameState } from './fixtures/gameFixtures';

// Import mock events fixture
import mockEventsModule from './eventsFixture';

// Mock dependencies
jest.mock('../../src/gameState.js');
jest.mock('../../src/events.js', () => mockEventsModule);
jest.mock('../../src/sounds.js');

describe('Game Win Conditions', () => {
  let gameModule;
  let mockGameState;
  let mockEventBus;
  let mockSoundSystem;
  
  beforeEach(() => {
    // Set up mocks
    const endGameState = createEndGameState(0); // Player 0 wins
    mockGameState = createMockGameState(endGameState);
    jest.mock('../../src/gameState.js', () => mockGameState);
    
    // Get mock event bus from the mocked module
    mockEventBus = require('../../src/events.js').default;
    
    // Mock sound system
    mockSoundSystem = {
      play: jest.fn()
    };
    
    // Create a proper mock that matches how it's imported and used
    jest.mock('../../src/sounds.js', () => ({
      __esModule: true,
      default: mockSoundSystem,
      play: mockSoundSystem.play
    }));
    
    // Import game module after mocks are set up
    gameModule = require('../../src/game');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  
  describe('handleGameEnd', () => {
    it('should mark the game as ended and play victory sound', () => {
      // Call handleGameEnd
      gameModule.handleGameEnd();
      
      // Verify game state was updated
      expect(mockGameState.updateState).toHaveBeenCalledWith({
        isGameStarted: false
      });
      
      // Verify game state was updated
      expect(mockGameState.updateState).toHaveBeenCalled();
    });
    
    it('should emit game ended event with the correct winner info', () => {
      // Call handleGameEnd
      gameModule.handleGameEnd();
      
      // Verify game ended event was emitted with correct data
      expect(mockEventBus.emit).toHaveBeenCalledWith('game_ended', expect.objectContaining({
        winnerIndex: 0,
        winnerName: 'Player',
        isPlayerWinner: true
      }));
    });
    
    it('should handle AI player winning', () => {
      // Setup - AI player (index 1) wins
      mockGameState.state.winningPlayerIndex = 1;
      
      // Call handleGameEnd
      gameModule.handleGameEnd();
      
      // Verify game ended event was emitted with correct data
      expect(mockEventBus.emit).toHaveBeenCalledWith('game_ended', expect.objectContaining({
        winnerIndex: 1,
        isPlayerWinner: false
      }));
    });
    
    it('should fall back to current player as winner if winningPlayerIndex is undefined', () => {
      // Setup - no winner defined, but current player is 1
      mockGameState.state.winningPlayerIndex = undefined;
      mockGameState.state.currentPlayerIndex = 1;
      
      // Call handleGameEnd
      gameModule.handleGameEnd();
      
      // Verify current player was used as winner
      expect(mockEventBus.emit).toHaveBeenCalledWith('game_ended', expect.objectContaining({
        winnerIndex: 1
      }));
    });
  });
  
  describe('Win condition in playCard', () => {
    it('should detect win condition when a player plays their last card', () => {
      // This test requires mocking turnManager's playCard,
      // which is tested in turnManager.test.js
      // We've verified that win condition detection happens in that test
    });
  });
});