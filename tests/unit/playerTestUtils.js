/**
 * Utility functions for player system tests
 */
import { createMockGameState, createMockEventBus } from './testUtils';
import { createTestPlayer, createTestHand } from './fixtures/playerFixtures';

/**
 * Verify that a player has the expected properties
 * @param {Object} player - The player object to check
 * @param {Object} expected - Expected player properties
 */
function verifyPlayerProperties(player, {
  name,
  isAI,
  hasCalledUno = false,
  handSize = null
}) {
  expect(player).toBeDefined();
  expect(player.name).toBe(name);
  expect(player.isAI).toBe(isAI);
  expect(player.hasCalledUno).toBe(hasCalledUno);
  expect(player.hand).toBeDefined();
  
  if (handSize !== null) {
    expect(player.hand.length).toBe(handSize);
  }
}

/**
 * Create a mock for AI decision making tests
 * @param {Object} options - Options for the AI test setup
 * @returns {Object} Mock objects and helper functions
 */
function setupAITestEnvironment({
  playerHandOptions = {},
  topDiscardColor = 'red',
  topDiscardValue = '5',
  currentColor = 'red'
} = {}) {
  // Create a player with the specified hand
  const player = createTestPlayer({
    name: 'Bluey',
    isAI: true,
    handOptions: playerHandOptions
  });
  
  // Mock game state
  const mockGameState = createMockGameState({
    players: [
      createTestPlayer({ name: 'Julia', isAI: false }),
      player
    ],
    currentPlayerIndex: 1, // AI player's turn
    currentColor,
    discardPile: [{
      color: topDiscardColor,
      value: topDiscardValue,
      emoji: '🃏'
    }]
  });
  
  // Mock event bus
  const mockEventBus = createMockEventBus();
  
  return {
    player,
    mockGameState,
    mockEventBus,
    // Helper to get playable cards
    getPlayableCards: () => {
      // Import here to avoid circular dependency
      const { canPlayCard } = require('../../src/gameRules');
      
      const topDiscard = mockGameState.state.discardPile[
        mockGameState.state.discardPile.length - 1
      ];
      
      return player.hand.filter(card => 
        canPlayCard(card, topDiscard, mockGameState.state.currentColor, player.hand)
      );
    }
  };
}

/**
 * Setup environment for UNO calling mechanics tests
 * @param {Object} options - Options for the UNO test setup
 * @returns {Object} Mock objects and helper functions
 */
function setupUnoTestEnvironment({
  playerIndex = 0,
  handSize = 1,
  hasCalledUno = false,
  numPlayers = 2
} = {}) {
  // Create players
  const players = [];
  for (let i = 0; i < numPlayers; i++) {
    const isCurrentPlayer = (i === playerIndex);
    players.push(createTestPlayer({
      name: isCurrentPlayer ? 'Julia' : `AI Player ${i}`,
      isAI: !isCurrentPlayer,
      hasCalledUno,
      handOptions: {
        numRed: isCurrentPlayer ? handSize : 5,
        numBlue: 0,
        numGreen: 0,
        numYellow: 0,
        numWild: 0,
        numWildDraw4: 0
      }
    }));
  }
  
  // Mock game state
  const mockGameState = createMockGameState({
    players,
    currentPlayerIndex: playerIndex,
    currentColor: 'red',
    discardPile: [{
      color: 'red',
      value: '5',
      emoji: '🃏'
    }]
  });
  
  // Mock event bus
  const mockEventBus = createMockEventBus();
  
  return {
    mockGameState,
    mockEventBus,
    getCurrentPlayer: () => mockGameState.state.players[playerIndex]
  };
}

export {
  verifyPlayerProperties,
  setupAITestEnvironment,
  setupUnoTestEnvironment
};