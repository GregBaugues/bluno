// Card deck management for Bluey Uno
import { 
  CARD_COLORS, 
  CARD_VALUES, 
  EMOJI_MAP 
} from './constants.js';
import { shuffleArray } from './utils.js';

/**
 * Creates a card object
 * @param {string} color - The card color
 * @param {string} value - The card value
 * @returns {Object} A card object
 */
function createCard(color, value) {
  return {
    color,
    value,
    emoji: EMOJI_MAP[value]
  };
}

/**
 * Creates numeric cards for a specific color
 * @param {string} color - Color to create cards for
 * @returns {Array} Array of number cards
 */
function createNumberCards(color) {
  const cards = [];
  
  // Add one '0' card
  cards.push(createCard(color, '0'));
  
  // Add two of each number 1-9
  for (const number of CARD_VALUES.NUMBERS.slice(1)) {
    cards.push(createCard(color, number));
    cards.push(createCard(color, number));
  }
  
  return cards;
}

/**
 * Creates special cards for a specific color
 * @param {string} color - Color to create cards for
 * @returns {Array} Array of special cards
 */
function createSpecialCards(color) {
  const cards = [];
  
  // Add two of each special card
  for (const specialValue of Object.values(CARD_VALUES.SPECIAL)) {
    cards.push(createCard(color, specialValue));
    cards.push(createCard(color, specialValue));
  }
  
  return cards;
}

/**
 * Creates wild cards
 * @returns {Array} Array of wild cards
 */
function createWildCards() {
  const cards = [];
  
  // Add four of each wild card type
  for (const wildValue of Object.values(CARD_VALUES.WILD)) {
    for (let i = 0; i < 4; i++) {
      cards.push(createCard('wild', wildValue));
    }
  }
  
  return cards;
}

/**
 * Creates a complete Uno deck
 * @returns {Array} Array of card objects
 */
function createDeck() {
  let deck = [];
  
  // Create cards for each color
  for (const color of Object.values(CARD_COLORS).filter(c => c !== CARD_COLORS.WILD)) {
    // Add all number cards for this color
    deck = [...deck, ...createNumberCards(color)];
    
    // Add all special cards for this color
    deck = [...deck, ...createSpecialCards(color)];
  }
  
  // Add wild cards
  deck = [...deck, ...createWildCards()];
  
  return deck;
}

/**
 * Shuffles the deck
 * @param {Array} deck - The deck to shuffle
 * @returns {Array} A new shuffled deck
 */
function shuffleDeck(deck) {
  return shuffleArray(deck);
}

/**
 * Deal cards to players
 * @param {Array} players - Array of player objects
 * @param {Array} deck - The deck to deal from
 * @param {number} cardsPerPlayer - Number of cards per player
 */
function dealCards(players, deck, cardsPerPlayer) {
  // Deal cards one at a time to each player
  for (let i = 0; i < cardsPerPlayer; i++) {
    players.forEach(player => {
      if (deck.length > 0) {
        player.hand.push(deck.pop());
      }
    });
  }
}

/**
 * Generates a valid initial card for the discard pile
 * (avoiding special cards at the start of the game)
 * @param {Array} deck - The deck to get a card from
 * @returns {Object} The initial card
 */
function getInitialCard(deck) {
  // Find the first non-special card in the deck
  const validCardIndex = deck.findIndex(card => 
    !Object.values(CARD_VALUES.SPECIAL).includes(card.value) && 
    !Object.values(CARD_VALUES.WILD).includes(card.value)
  );
  
  if (validCardIndex !== -1) {
    // Remove and return the found card
    return deck.splice(validCardIndex, 1)[0];
  }
  
  // Fallback: Just use the top card (this should be rare with a proper shuffled deck)
  return deck.pop();
}

/**
 * Reshuffles the discard pile into the deck
 * @param {Array} deck - Current deck (likely empty or nearly empty)
 * @param {Array} discardPile - Current discard pile
 * @returns {Object} Object containing the updated deck and discard pile
 */
function reshuffleDeck(deck, discardPile) {
  // Keep the top card of the discard pile
  const topCard = discardPile.pop();
  
  // Move all other cards to the deck and shuffle
  const newDeck = shuffleDeck([...discardPile]);
  
  // Return updated deck and discard pile
  return {
    deck: newDeck,
    discardPile: [topCard]
  };
}

export {
  createDeck,
  shuffleDeck,
  dealCards,
  getInitialCard,
  reshuffleDeck
};