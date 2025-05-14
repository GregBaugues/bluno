/**
 * Utility functions for deck tests
 */
import { CARD_COLORS, CARD_VALUES } from '../../../src/constants.js';

/**
 * Verifies the total number of cards in a deck
 * @param {Array} deck - The deck to check
 * @param {number} expectedCount - The expected number of cards
 */
function verifyDeckCount(deck, expectedCount) {
  expect(deck).toHaveLength(expectedCount);
}

/**
 * Verifies the distribution of card colors in a deck
 * @param {Array} deck - The deck to check
 */
function verifyColorDistribution(deck) {
  // Count cards by color
  const colorCounts = {
    [CARD_COLORS.RED]: 0,
    [CARD_COLORS.BLUE]: 0,
    [CARD_COLORS.GREEN]: 0,
    [CARD_COLORS.YELLOW]: 0,
    [CARD_COLORS.WILD]: 0
  };
  
  deck.forEach(card => {
    colorCounts[card.color]++;
  });
  
  // Standard Uno deck has 25 cards of each color and 8 wild cards
  expect(colorCounts[CARD_COLORS.RED]).toBe(25);
  expect(colorCounts[CARD_COLORS.BLUE]).toBe(25);
  expect(colorCounts[CARD_COLORS.GREEN]).toBe(25);
  expect(colorCounts[CARD_COLORS.YELLOW]).toBe(25);
  expect(colorCounts[CARD_COLORS.WILD]).toBe(8);
}

/**
 * Verifies the distribution of card values within a color
 * @param {Array} deck - The deck to check
 * @param {string} color - The color to check
 */
function verifyValueDistributionByColor(deck, color) {
  // Filter cards by color
  const colorCards = deck.filter(card => card.color === color);
  
  // Count cards by value
  const valueCounts = {};
  
  // Initialize value counts
  if (color !== CARD_COLORS.WILD) {
    CARD_VALUES.NUMBERS.forEach(number => {
      valueCounts[number] = 0;
    });
    
    Object.values(CARD_VALUES.SPECIAL).forEach(special => {
      valueCounts[special] = 0;
    });
  } else {
    Object.values(CARD_VALUES.WILD).forEach(wild => {
      valueCounts[wild] = 0;
    });
  }
  
  // Count actual cards
  colorCards.forEach(card => {
    valueCounts[card.value]++;
  });
  
  // Verify distribution
  if (color !== CARD_COLORS.WILD) {
    // One '0' card per color
    expect(valueCounts['0']).toBe(1);
    
    // Two of each number 1-9 per color
    for (let i = 1; i <= 9; i++) {
      expect(valueCounts[i.toString()]).toBe(2);
    }
    
    // Two of each special card per color
    Object.values(CARD_VALUES.SPECIAL).forEach(special => {
      expect(valueCounts[special]).toBe(2);
    });
  } else {
    // Four of each wild card type
    Object.values(CARD_VALUES.WILD).forEach(wild => {
      expect(valueCounts[wild]).toBe(4);
    });
  }
}

/**
 * Creates a mock player for testing
 * @param {string} name - The player's name
 * @param {boolean} isAI - Whether the player is AI-controlled
 * @returns {Object} A mock player
 */
function createMockPlayer(name, isAI = false) {
  return {
    name,
    isAI,
    hand: [],
    hasCalledUno: false
  };
}

/**
 * Creates mock players for testing
 * @param {number} count - The number of players to create
 * @returns {Array} An array of mock players
 */
function createMockPlayers(count) {
  const players = [];
  
  for (let i = 0; i < count; i++) {
    const isAI = i > 0; // First player is human, rest are AI
    const name = isAI ? `AI-${i}` : 'Player';
    players.push(createMockPlayer(name, isAI));
  }
  
  return players;
}

/**
 * Creates a deterministic "shuffled" deck for testing
 * This doesn't actually shuffle but creates a predictable deck order
 * @param {Array} deck - The deck to "shuffle"
 * @returns {Array} The "shuffled" deck
 */
function createPredictableShuffledDeck(deck) {
  // Return a reversed copy of the deck as a simple predictable "shuffle"
  return [...deck].reverse();
}

/**
 * Creates a custom deck with specified cards
 * @param {Array} cards - The cards to include in the deck
 * @returns {Array} The custom deck
 */
function createCustomDeck(cards) {
  return [...cards];
}

export {
  verifyDeckCount,
  verifyColorDistribution,
  verifyValueDistributionByColor,
  createMockPlayer,
  createMockPlayers,
  createPredictableShuffledDeck,
  createCustomDeck
};