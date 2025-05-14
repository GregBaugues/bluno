// Test fixtures for player system tests
import { CHARACTERS, CHARACTER_PRIORITY } from '../../../src/constants';
import { createCard } from './gameFixtures';

/**
 * Create a hand of cards with specific types for testing
 * @param {Object} options - Card distribution options
 * @returns {Array} Array of card objects
 */
function createTestHand({
  numRed = 2,
  numBlue = 2,
  numGreen = 2,
  numYellow = 2,
  numWild = 1,
  numWildDraw4 = 1,
  numSkip = 0,
  numReverse = 0,
  numDraw2 = 0
} = {}) {
  const hand = [];
  
  // Add regular number cards
  const colors = ['red', 'blue', 'green', 'yellow'];
  const counts = [numRed, numBlue, numGreen, numYellow];
  
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < counts[i]; j++) {
      hand.push(createCard(colors[i], String(j % 10)));
    }
  }
  
  // Add special cards
  for (let i = 0; i < numSkip; i++) {
    hand.push(createCard(colors[i % colors.length], 'Skip'));
  }
  
  for (let i = 0; i < numReverse; i++) {
    hand.push(createCard(colors[i % colors.length], 'Reverse'));
  }
  
  for (let i = 0; i < numDraw2; i++) {
    hand.push(createCard(colors[i % colors.length], 'Draw 2'));
  }
  
  // Add wild cards
  for (let i = 0; i < numWild; i++) {
    hand.push(createCard('wild', 'Wild'));
  }
  
  for (let i = 0; i < numWildDraw4; i++) {
    hand.push(createCard('wild', 'Wild Draw 4'));
  }
  
  return hand;
}

/**
 * Create a test player with specific properties
 * @param {Object} options - Player options
 * @returns {Object} Player object
 */
function createTestPlayer({
  name = 'TestPlayer',
  isAI = false,
  hasCalledUno = false,
  handOptions = {}
} = {}) {
  return {
    name,
    isAI,
    hasCalledUno,
    hand: createTestHand(handOptions)
  };
}

/**
 * Create a set of players for testing
 * @param {number} numPlayers - Number of players (2-4)
 * @param {boolean} withCards - Whether to give players cards
 * @returns {Array} Array of player objects
 */
function createTestPlayers(numPlayers = 2, withCards = true) {
  const players = [];
  
  // Human player
  players.push(createTestPlayer({
    name: CHARACTERS.PLAYER,
    isAI: false,
    handOptions: withCards ? undefined : { numRed: 0, numBlue: 0, numGreen: 0, numYellow: 0, numWild: 0, numWildDraw4: 0 }
  }));
  
  // AI players
  for (let i = 0; i < Math.min(numPlayers - 1, CHARACTER_PRIORITY.length); i++) {
    players.push(createTestPlayer({
      name: CHARACTER_PRIORITY[i],
      isAI: true,
      handOptions: withCards ? undefined : { numRed: 0, numBlue: 0, numGreen: 0, numYellow: 0, numWild: 0, numWildDraw4: 0 }
    }));
  }
  
  return players;
}

/**
 * Create a test game state focused on player testing
 * @param {Object} options - Game state options
 * @returns {Object} Game state object
 */
function createPlayerTestState({
  numPlayers = 2,
  currentPlayerIndex = 0,
  currentColor = 'red',
  topDiscardColor = 'red', 
  topDiscardValue = '5',
  withPlayerCards = true
} = {}) {
  const players = createTestPlayers(numPlayers, withPlayerCards);
  const topDiscard = createCard(topDiscardColor, topDiscardValue);
  
  return {
    players,
    currentPlayerIndex,
    currentColor,
    discardPile: [topDiscard],
    direction: 1,
    deck: createTestHand({ numRed: 5, numBlue: 5, numGreen: 5, numYellow: 5, numWild: 2, numWildDraw4: 2 }),
    isGameStarted: true,
    waitingForColorChoice: false,
    pendingDrawPlayerIndex: null,
    pendingDrawCount: 0,
    requiredDraws: 0,
    isDrawingCards: false,
    winningPlayerIndex: undefined
  };
}

/**
 * Create a specific test scenario for UNO calls
 * @param {number} playerIndex - Index of player about to call UNO
 * @returns {Object} Game state configured for UNO call testing
 */
function createUnoCallScenario(playerIndex = 0) {
  const state = createPlayerTestState({ numPlayers: 3 });
  
  // Set the specified player to have only one card
  state.players[playerIndex].hand = [createCard('red', '7')];
  state.players[playerIndex].hasCalledUno = false;
  
  return state;
}

/**
 * Create a test scenario for AI decision making
 * @param {Object} options - AI decision options
 * @returns {Object} Game state with AI player and specific card options
 */
function createAIDecisionScenario({
  matchingColorCards = 2,
  matchingValueCards = 1,
  nonMatchingCards = 3,
  wildCards = 1,
  wildDraw4Cards = 1,
  currentColor = 'red',
  topDiscardValue = '5'
} = {}) {
  // Create a state with AI player's turn
  const state = createPlayerTestState({ 
    numPlayers: 2, 
    currentPlayerIndex: 1,  // AI player's turn
    currentColor,
    topDiscardColor: currentColor,
    topDiscardValue
  });
  
  // Reset AI player's hand
  state.players[1].hand = [];
  
  // Add matching color cards
  for (let i = 0; i < matchingColorCards; i++) {
    state.players[1].hand.push(createCard(currentColor, String((i + 1) % 10)));
  }
  
  // Add matching value cards (different color)
  const otherColors = ['blue', 'green', 'yellow'].filter(c => c !== currentColor);
  for (let i = 0; i < matchingValueCards; i++) {
    state.players[1].hand.push(createCard(otherColors[i % otherColors.length], topDiscardValue));
  }
  
  // Add non-matching cards
  for (let i = 0; i < nonMatchingCards; i++) {
    const color = otherColors[i % otherColors.length];
    const value = String((parseInt(topDiscardValue) + i + 1) % 10);
    state.players[1].hand.push(createCard(color, value));
  }
  
  // Add wild cards
  for (let i = 0; i < wildCards; i++) {
    state.players[1].hand.push(createCard('wild', 'Wild'));
  }
  
  // Add wild draw 4 cards
  for (let i = 0; i < wildDraw4Cards; i++) {
    state.players[1].hand.push(createCard('wild', 'Wild Draw 4'));
  }
  
  return state;
}

export {
  createTestHand,
  createTestPlayer,
  createTestPlayers,
  createPlayerTestState,
  createUnoCallScenario,
  createAIDecisionScenario
};