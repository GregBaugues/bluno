/**
 * Fixtures for deck tests
 */
import { CARD_COLORS, CARD_VALUES } from '../../../src/constants.js';

/**
 * Create a sample card for testing
 * @param {string} color - The card color
 * @param {string} value - The card value
 * @returns {Object} A card object
 */
export function createSampleCard(color, value) {
  return {
    color,
    value,
    emoji: '😀' // Mock emoji for testing
  };
}

/**
 * Predefined card sets for testing
 */
export const CARD_FIXTURES = {
  // Sample hand containing one of each card type
  SAMPLE_HAND: [
    createSampleCard(CARD_COLORS.RED, '7'),
    createSampleCard(CARD_COLORS.BLUE, '4'),
    createSampleCard(CARD_COLORS.GREEN, CARD_VALUES.SPECIAL.SKIP),
    createSampleCard(CARD_COLORS.YELLOW, CARD_VALUES.SPECIAL.REVERSE),
    createSampleCard(CARD_COLORS.BLUE, CARD_VALUES.SPECIAL.DRAW_TWO),
    createSampleCard(CARD_COLORS.WILD, CARD_VALUES.WILD.STANDARD),
    createSampleCard(CARD_COLORS.WILD, CARD_VALUES.WILD.DRAW_FOUR)
  ],
  
  // Sample discard pile
  SAMPLE_DISCARD_PILE: [
    createSampleCard(CARD_COLORS.RED, '5'),
    createSampleCard(CARD_COLORS.RED, '9'),
    createSampleCard(CARD_COLORS.BLUE, '2')
  ],
  
  // Sample small deck for testing dealing
  SMALL_DECK: [
    createSampleCard(CARD_COLORS.RED, '0'),
    createSampleCard(CARD_COLORS.BLUE, '1'),
    createSampleCard(CARD_COLORS.GREEN, '2'),
    createSampleCard(CARD_COLORS.YELLOW, '3'),
    createSampleCard(CARD_COLORS.RED, '4'),
    createSampleCard(CARD_COLORS.BLUE, '5'),
    createSampleCard(CARD_COLORS.GREEN, '6'),
    createSampleCard(CARD_COLORS.YELLOW, '7'),
    createSampleCard(CARD_COLORS.RED, '8'),
    createSampleCard(CARD_COLORS.BLUE, '9')
  ],
  
  // Sample deck with only special cards
  SPECIAL_CARDS_DECK: [
    createSampleCard(CARD_COLORS.RED, CARD_VALUES.SPECIAL.SKIP),
    createSampleCard(CARD_COLORS.BLUE, CARD_VALUES.SPECIAL.REVERSE),
    createSampleCard(CARD_COLORS.GREEN, CARD_VALUES.SPECIAL.DRAW_TWO),
    createSampleCard(CARD_COLORS.WILD, CARD_VALUES.WILD.STANDARD),
    createSampleCard(CARD_COLORS.WILD, CARD_VALUES.WILD.DRAW_FOUR)
  ],
  
  // A sample deck with a number card at the end for initial card testing
  INITIAL_CARD_TEST_DECK: [
    createSampleCard(CARD_COLORS.WILD, CARD_VALUES.WILD.STANDARD),
    createSampleCard(CARD_COLORS.RED, CARD_VALUES.SPECIAL.SKIP),
    createSampleCard(CARD_COLORS.BLUE, CARD_VALUES.SPECIAL.REVERSE),
    createSampleCard(CARD_COLORS.GREEN, '3') // This should be selected as initial card
  ]
};

/**
 * Game state fixtures for testing
 */
export const GAME_STATE_FIXTURES = {
  // Sample game state with empty draw pile to test reshuffling
  EMPTY_DRAW_PILE: {
    deck: [],
    discardPile: [...CARD_FIXTURES.SAMPLE_DISCARD_PILE]
  },
  
  // Sample game state with nearly empty draw pile
  NEARLY_EMPTY_DRAW_PILE: {
    deck: [createSampleCard(CARD_COLORS.YELLOW, '2')],
    discardPile: [...CARD_FIXTURES.SAMPLE_DISCARD_PILE]
  }
};