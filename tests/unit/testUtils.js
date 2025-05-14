/**
 * Utility functions for testing
 */

/**
 * Creates a mock gameState module for testing
 * @param {Object} initialState - The initial state to use
 * @returns {Object} A mock gameState module
 */
function createMockGameState(initialState = {}) {
  let state = { ...initialState };
  
  return {
    state,
    // Spied methods
    updateState: jest.fn(updates => {
      state = { ...state, ...updates };
      return state;
    }),
    getState: jest.fn(() => state),
    initializeEmptyGame: jest.fn(() => {
      state = {
        deck: [],
        players: [],
        currentPlayerIndex: 0,
        direction: 1,
        discardPile: [],
        isGameStarted: false,
        currentColor: null,
        waitingForColorChoice: false,
        pendingDrawPlayerIndex: null,
        pendingDrawCount: 0,
        requiredDraws: 0,
        isDrawingCards: false,
        winningPlayerIndex: undefined
      };
      return state;
    }),
    // Helper for tests to directly set state
    _setState: (newState) => {
      state = { ...newState };
    }
  };
}

/**
 * Creates a mock eventBus for testing
 * @returns {Object} A mock eventBus
 */
function createMockEventBus() {
  const eventListeners = {};
  
  return {
    on: jest.fn((event, callback) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(callback);
    }),
    
    emit: jest.fn((event, data) => {
      if (eventListeners[event]) {
        eventListeners[event].forEach(callback => callback(data));
      }
    }),
    
    off: jest.fn((event, callback) => {
      if (eventListeners[event]) {
        const index = eventListeners[event].indexOf(callback);
        if (index !== -1) {
          eventListeners[event].splice(index, 1);
        }
      }
    }),
    
    // Helper to get registered listeners for a specific event
    _getListeners: (event) => eventListeners[event] || [],
    
    // Helper to reset all listeners
    _reset: () => {
      Object.keys(eventListeners).forEach(key => {
        delete eventListeners[key];
      });
    }
  };
}

/**
 * Utility to verify a card can or cannot be played
 * @param {Function} canPlayCardFn - The card validation function
 * @param {Object} card - The card to check
 * @param {Object} topDiscard - The top discard card
 * @param {string} currentColor - The current color
 * @param {Array} hand - The player's hand
 * @param {boolean} expectedResult - Whether the card should be playable
 */
function verifyCardPlayability(canPlayCardFn, card, topDiscard, currentColor, hand, expectedResult) {
  const result = canPlayCardFn(card, topDiscard, currentColor, hand);
  expect(result).toBe(expectedResult);
}

export {
  createMockGameState,
  createMockEventBus,
  verifyCardPlayability
};