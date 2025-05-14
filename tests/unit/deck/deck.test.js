/**
 * Tests for the deck management system
 */
import { 
  createDeck, 
  shuffleDeck, 
  dealCards,
  getInitialCard,
  reshuffleDeck
} from '../../../src/deck.js';

import { CARD_COLORS, CARD_VALUES } from '../../../src/constants.js';
import * as utils from '../../../src/utils.js';
import { 
  verifyDeckCount, 
  verifyColorDistribution,
  verifyValueDistributionByColor,
  createMockPlayers,
  createPredictableShuffledDeck
} from './deckTestUtils.js';

import { CARD_FIXTURES, GAME_STATE_FIXTURES } from './deckFixtures.js';

// Mock the shuffleArray function
jest.mock('../../../src/utils.js', () => {
  const original = jest.requireActual('../../../src/utils.js');
  return {
    ...original,
    shuffleArray: jest.fn(arr => [...arr].reverse()) // Simple deterministic shuffle for testing
  };
});

describe('Deck Management System', () => {
  
  describe('Deck Creation', () => {
    let deck;
    
    beforeEach(() => {
      deck = createDeck();
    });
    
    test('should create a deck with 108 cards', () => {
      verifyDeckCount(deck, 108);
    });
    
    test('should have the correct color distribution', () => {
      verifyColorDistribution(deck);
    });
    
    test('should have the correct value distribution for each color', () => {
      // Test each color
      verifyValueDistributionByColor(deck, CARD_COLORS.RED);
      verifyValueDistributionByColor(deck, CARD_COLORS.BLUE);
      verifyValueDistributionByColor(deck, CARD_COLORS.GREEN);
      verifyValueDistributionByColor(deck, CARD_COLORS.YELLOW);
      verifyValueDistributionByColor(deck, CARD_COLORS.WILD);
    });
    
    test('should have one zero card of each color', () => {
      const colorZeros = {};
      
      // Initialize counters
      [CARD_COLORS.RED, CARD_COLORS.BLUE, CARD_COLORS.GREEN, CARD_COLORS.YELLOW].forEach(color => {
        colorZeros[color] = 0;
      });
      
      // Count zero cards by color
      deck.forEach(card => {
        if (card.value === '0' && colorZeros[card.color] !== undefined) {
          colorZeros[card.color]++;
        }
      });
      
      // Verify each color has exactly one zero
      Object.values(colorZeros).forEach(count => {
        expect(count).toBe(1);
      });
    });
    
    test('should have two of each number 1-9 for each color', () => {
      // For each color
      [CARD_COLORS.RED, CARD_COLORS.BLUE, CARD_COLORS.GREEN, CARD_COLORS.YELLOW].forEach(color => {
        // For each number 1-9
        for (let num = 1; num <= 9; num++) {
          const count = deck.filter(card => card.color === color && card.value === num.toString()).length;
          expect(count).toBe(2);
        }
      });
    });
    
    test('should have two of each special card for each color', () => {
      // For each color
      [CARD_COLORS.RED, CARD_COLORS.BLUE, CARD_COLORS.GREEN, CARD_COLORS.YELLOW].forEach(color => {
        // For each special value
        Object.values(CARD_VALUES.SPECIAL).forEach(specialValue => {
          const count = deck.filter(card => card.color === color && card.value === specialValue).length;
          expect(count).toBe(2);
        });
      });
    });
    
    test('should have four of each wild card type', () => {
      Object.values(CARD_VALUES.WILD).forEach(wildValue => {
        const count = deck.filter(card => card.color === CARD_COLORS.WILD && card.value === wildValue).length;
        expect(count).toBe(4);
      });
    });
    
    test('should have cards with emoji property based on value', () => {
      deck.forEach(card => {
        expect(card).toHaveProperty('emoji');
        expect(typeof card.emoji).toBe('string');
      });
    });
  });
  
  describe('Deck Shuffling', () => {
    let originalDeck;
    let shuffledDeck;
    
    beforeEach(() => {
      originalDeck = createDeck();
      shuffledDeck = shuffleDeck([...originalDeck]);
    });
    
    test('should change the order of cards', () => {
      // Since we've mocked shuffleArray to reverse the array,
      // the first card of the shuffled deck should be the last card of the original deck
      expect(shuffledDeck[0]).toEqual(originalDeck[originalDeck.length - 1]);
      expect(shuffledDeck[shuffledDeck.length - 1]).toEqual(originalDeck[0]);
      
      // Verify the utils.shuffleArray was called
      expect(utils.shuffleArray).toHaveBeenCalledWith(expect.any(Array));
    });
    
    test('should not modify the original deck', () => {
      const originalFirstCard = originalDeck[0];
      shuffleDeck([...originalDeck]);
      expect(originalDeck[0]).toEqual(originalFirstCard);
    });
    
    test('should maintain the same number of cards', () => {
      expect(shuffledDeck.length).toBe(originalDeck.length);
    });
    
    test('should contain all the same cards as the original deck', () => {
      // Sort both decks by color and value to compare (ignoring order)
      const sortFn = (a, b) => {
        if (a.color !== b.color) return a.color.localeCompare(b.color);
        return a.value.localeCompare(b.value);
      };
      
      const sortedOriginal = [...originalDeck].sort(sortFn);
      const sortedShuffled = [...shuffledDeck].sort(sortFn);
      
      // Compare each card
      for (let i = 0; i < sortedOriginal.length; i++) {
        expect(sortedShuffled[i]).toEqual(sortedOriginal[i]);
      }
    });
  });
  
  describe('Card Dealing', () => {
    let deck;
    let players;
    
    beforeEach(() => {
      deck = [...CARD_FIXTURES.SMALL_DECK];
      players = createMockPlayers(3); // Create 3 players with empty hands
    });
    
    test('should deal the correct number of cards to each player', () => {
      dealCards(players, deck, 2); // Deal 2 cards to each player
      
      // Each player should have 2 cards
      players.forEach(player => {
        expect(player.hand.length).toBe(2);
      });
      
      // Deck should have 4 cards left (10 - 6 = 4)
      expect(deck.length).toBe(4);
    });
    
    test('should deal cards one at a time to each player', () => {
      // The first 3 cards in the SMALL_DECK should be dealt first, one to each player
      // Then the next 3 cards should be dealt, one to each player
      const expectedFirstCards = [
        CARD_FIXTURES.SMALL_DECK[9], // Cards are dealt from the end (pop)
        CARD_FIXTURES.SMALL_DECK[8],
        CARD_FIXTURES.SMALL_DECK[7]
      ];
      
      const expectedSecondCards = [
        CARD_FIXTURES.SMALL_DECK[6],
        CARD_FIXTURES.SMALL_DECK[5],
        CARD_FIXTURES.SMALL_DECK[4]
      ];
      
      dealCards(players, deck, 2);
      
      // Check the first card of each player
      players.forEach((player, index) => {
        expect(player.hand[0]).toEqual(expectedFirstCards[index]);
      });
      
      // Check the second card of each player
      players.forEach((player, index) => {
        expect(player.hand[1]).toEqual(expectedSecondCards[index]);
      });
    });
    
    test('should handle dealing more cards than available in the deck', () => {
      // Try to deal more cards than exist in the deck
      dealCards(players, deck, 5); // 5 cards * 3 players = 15 cards, but we only have 10
      
      // Each player should get at most 3 cards (since 10 / 3 = 3.33, and the last player gets fewer)
      expect(players[0].hand.length).toBe(4); // First player gets 4 cards
      expect(players[1].hand.length).toBe(3); // Second player gets 3 cards
      expect(players[2].hand.length).toBe(3); // Third player gets 3 cards
      
      // Deck should be empty
      expect(deck.length).toBe(0);
    });
  });
  
  describe('Initial Card Selection', () => {
    test('should select a non-special card as the initial card', () => {
      // Create a deck with some special cards and only one regular number card
      const deck = [...CARD_FIXTURES.INITIAL_CARD_TEST_DECK];
      const initialDeckLength = deck.length;
      
      const initialCard = getInitialCard(deck);
      
      // Should select the number card as initial
      expect(initialCard.color).toBe(CARD_COLORS.GREEN);
      expect(initialCard.value).toBe('3');
      
      // The card should be removed from the deck
      expect(deck.length).toBe(initialDeckLength - 1);
    });
    
    test('should fall back to the top card if no non-special cards exist', () => {
      // Create a deck with only special cards
      const deck = [...CARD_FIXTURES.SPECIAL_CARDS_DECK];
      const initialDeckLength = deck.length;
      const topCard = deck[deck.length - 1]; // Last card will be popped
      
      const initialCard = getInitialCard(deck);
      
      // Should select the top card as initial since there are no number cards
      expect(initialCard).toEqual(topCard);
      
      // The card should be removed from the deck
      expect(deck.length).toBe(initialDeckLength - 1);
    });
  });
  
  describe('Reshuffle Deck', () => {
    test('should move cards from discard pile to deck and shuffle them', () => {
      const { deck: emptyDeck, discardPile } = GAME_STATE_FIXTURES.EMPTY_DRAW_PILE;
      const topCard = discardPile[discardPile.length - 1];
      const initialDiscardSize = discardPile.length;
      
      // Reshuffle the discard pile into the deck
      const result = reshuffleDeck(emptyDeck, discardPile);
      
      // New deck should contain all cards except the top discard
      expect(result.deck.length).toBe(initialDiscardSize - 1);
      
      // New discard pile should only contain the top card
      expect(result.discardPile.length).toBe(1);
      expect(result.discardPile[0]).toEqual(topCard);
      
      // Verify the shuffleArray was called
      expect(utils.shuffleArray).toHaveBeenCalled();
    });
    
    test('should handle an empty discard pile gracefully', () => {
      const emptyDeck = [];
      const emptyDiscard = [];
      
      const result = reshuffleDeck(emptyDeck, emptyDiscard);
      
      // The deck should still be empty
      expect(result.deck.length).toBe(0);
      // The discard pile will contain one undefined element
      // This is the current behavior of the function when discard pile is empty
      expect(result.discardPile.length).toBe(1);
      expect(result.discardPile[0]).toBeUndefined();
    });
  });
});