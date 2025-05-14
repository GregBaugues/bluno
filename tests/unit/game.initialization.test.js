/**
 * Game initialization tests
 */

import { createMockGameState } from './testUtils';
import mockEventsModule from './eventsFixture';
import { createSampleDeck } from './fixtures/gameFixtures';

// Mock dependencies directly
jest.mock('../../src/gameState.js');
jest.mock('../../src/sounds.js');
jest.mock('../../src/deck.js');
jest.mock('../../src/playerManager.js');

// Mock events.js directly
jest.mock('../../src/events.js', () => mockEventsModule);

describe('Game Initialization', () => {
  let gameModule;
  let mockGameState;
  let mockDeck;
  let mockPlayerManager;
  let mockSoundSystem;
  let mockEventBus;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Set up mocks
    mockGameState = createMockGameState();
    jest.doMock('../../src/gameState.js', () => mockGameState);
    
    // Get the mocked event bus
    mockEventBus = require('../../src/events.js').default;
    
    // Mock deck module
    const deck = createSampleDeck(30);
    const initialCard = { color: 'red', value: '7', emoji: '7️⃣' };
    mockDeck = {
      createDeck: jest.fn(() => deck),
      shuffleDeck: jest.fn(deck => deck),
      dealCards: jest.fn(),
      getInitialCard: jest.fn(() => initialCard),
      reshuffleDeck: jest.fn()
    };
    jest.doMock('../../src/deck.js', () => mockDeck);
    
    // Mock player manager
    mockPlayerManager = {
      createPlayers: jest.fn((numPlayers) => {
        const players = [];
        // Create one human player
        players.push({
          name: 'Player',
          hand: [],
          isAI: false,
          hasCalledUno: false
        });
        
        // Create AI players
        for (let i = 1; i < numPlayers; i++) {
          players.push({
            name: `AI Player ${i}`,
            hand: [],
            isAI: true,
            hasCalledUno: false
          });
        }
        
        return players;
      }),
      sayUno: jest.fn()
    };
    jest.doMock('../../src/playerManager.js', () => mockPlayerManager);
    
    // Mock sound system
    mockSoundSystem = {
      initialize: jest.fn(),
      play: jest.fn()
    };
    // Create a proper mock that matches how it's imported and used
    jest.doMock('../../src/sounds.js', () => ({
      __esModule: true,
      default: mockSoundSystem,
      initialize: mockSoundSystem.initialize,
      play: mockSoundSystem.play
    }));
    
    // Import game module after mocks are set up
    gameModule = require('../../src/game');
  });
  
  describe('initializeEmptyGame', () => {
    it('should initialize an empty game state', () => {
      // Call the function
      gameModule.initializeEmptyGame();
      
      // Verify game state was initialized
      expect(mockGameState.initializeEmptyGame).toHaveBeenCalled();
      
      // Verify UI update event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('ui_updated');
    });
  });
  
  describe('startGame', () => {
    it('should initialize a new game with 2 players by default', () => {
      // Call the function
      gameModule.startGame();
      
      // Verify sound system was used
      expect(mockSoundSystem.play).toHaveBeenCalledWith('yourTurn');
      
      // Verify deck was created and shuffled
      expect(mockDeck.createDeck).toHaveBeenCalled();
      expect(mockDeck.shuffleDeck).toHaveBeenCalled();
      
      // Verify players were created
      expect(mockPlayerManager.createPlayers).toHaveBeenCalledWith(2);
      
      // Verify game state was updated with initial values
      expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
        currentPlayerIndex: 0,
        direction: 1,
        isGameStarted: true,
        currentColor: null,
        waitingForColorChoice: false,
        pendingDrawPlayerIndex: null,
        pendingDrawCount: 0,
        requiredDraws: 0,
        isDrawingCards: false,
        winningPlayerIndex: undefined
      }));
      
      // Verify cards were dealt
      expect(mockDeck.dealCards).toHaveBeenCalled();
      
      // Verify initial card was placed
      expect(mockDeck.getInitialCard).toHaveBeenCalled();
      
      // Verify events were emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('game_started');
      expect(mockEventBus.emit).toHaveBeenCalledWith('ui_updated');
      
      // Verify events were emitted
      expect(mockEventBus.emit).toHaveBeenCalled();
    });
    
    it('should initialize a game with the specified number of players', () => {
      // Call the function with 4 players
      gameModule.startGame(4);
      
      // Verify players were created
      expect(mockPlayerManager.createPlayers).toHaveBeenCalledWith(4);
    });
    
    it('should handle invalid player counts by clamping to valid range (2-4)', () => {
      // Call with too few players (1)
      gameModule.startGame(1);
      expect(mockPlayerManager.createPlayers).toHaveBeenCalledWith(2);
      
      jest.clearAllMocks();
      
      // Call with too many players (5)
      gameModule.startGame(5);
      expect(mockPlayerManager.createPlayers).toHaveBeenCalledWith(4);
    });
    
    it('should set the correct color based on the initial card', () => {
      // Set up a specific initial card
      const initialCard = { color: 'blue', value: '3', emoji: '3️⃣' };
      mockDeck.getInitialCard.mockReturnValueOnce(initialCard);
      
      // Call the function
      gameModule.startGame();
      
      // Verify the current color was set to the initial card's color
      expect(mockGameState.updateState).toHaveBeenCalledWith(expect.objectContaining({
        discardPile: [initialCard],
        currentColor: 'blue'
      }));
    });
    
    it('should emit events when game starts', () => {
      // Call the function
      gameModule.startGame();
      
      // Verify events were emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith('game_started');
      expect(mockEventBus.emit).toHaveBeenCalledWith('ui_updated');
    });
  });
});