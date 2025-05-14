// Test fixtures for game tests

/**
 * Create a sample card with given color and value
 * @param {string} color - Card color
 * @param {string} value - Card value
 * @returns {Object} A card object
 */
function createCard(color, value) {
  return {
    color,
    value,
    emoji: '🃏' // Default emoji for test cards
  };
}

/**
 * Creates a sample deck with a specified number of cards
 * @param {number} numCards - Number of cards in the deck
 * @returns {Array} An array of card objects
 */
function createSampleDeck(numCards = 10) {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw 2'];
  
  const deck = [];
  for (let i = 0; i < numCards; i++) {
    const color = colors[i % colors.length];
    const value = values[i % values.length];
    deck.push(createCard(color, value));
  }
  
  return deck;
}

/**
 * Creates wild cards for testing
 * @returns {Array} An array of wild card objects
 */
function createWildCards() {
  return [
    createCard('wild', 'Wild'),
    createCard('wild', 'Wild Draw 4')
  ];
}

/**
 * Creates a sample player with specified parameters
 * @param {string} name - Player name
 * @param {Array} hand - Player's hand of cards
 * @param {boolean} isAI - Whether the player is AI
 * @returns {Object} A player object
 */
function createPlayer(name, hand = [], isAI = false) {
  return {
    name,
    hand: [...hand],
    isAI,
    hasCalledUno: false
  };
}

/**
 * Creates a sample game state for testing
 * @param {Object} overrides - Properties to override in the default state
 * @returns {Object} A game state object
 */
function createGameState(overrides = {}) {
  // Create a basic deck
  const deck = createSampleDeck(20);
  
  // Create players (1 human, 1 AI)
  const humanPlayer = createPlayer('Player', deck.slice(0, 7), false);
  const aiPlayer = createPlayer('Bluey', deck.slice(7, 14), true);
  
  // Initial discard card
  const initialCard = createCard('red', '5');
  
  // Default state
  const defaultState = {
    deck: deck.slice(14), // Remaining cards after dealing
    players: [humanPlayer, aiPlayer],
    currentPlayerIndex: 0,
    direction: 1,
    discardPile: [initialCard],
    isGameStarted: true,
    currentColor: initialCard.color,
    waitingForColorChoice: false,
    pendingDrawPlayerIndex: null,
    pendingDrawCount: 0,
    requiredDraws: 0,
    isDrawingCards: false,
    winningPlayerIndex: undefined
  };
  
  // Merge default state with any overrides
  return { ...defaultState, ...overrides };
}

/**
 * Creates a game state with a specific top discard card
 * @param {string} color - Card color
 * @param {string} value - Card value 
 * @returns {Object} A game state with the specified discard card
 */
function createGameStateWithTopDiscard(color, value) {
  const topCard = createCard(color, value);
  return createGameState({
    discardPile: [topCard],
    currentColor: color
  });
}

/**
 * Creates a game state at end game (one player has no cards)
 * @param {number} winnerIndex - Index of the winning player
 * @returns {Object} A game state with a winner
 */
function createEndGameState(winnerIndex = 0) {
  const state = createGameState();
  state.players[winnerIndex].hand = []; // Empty hand
  state.winningPlayerIndex = winnerIndex;
  return state;
}

export {
  createCard,
  createSampleDeck,
  createWildCards,
  createPlayer,
  createGameState,
  createGameStateWithTopDiscard,
  createEndGameState
};