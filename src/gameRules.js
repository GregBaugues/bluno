// Game rules module for Bluey Uno
import { CARD_VALUES } from './constants.js';
import { gameLog } from './utils.js';

/**
 * Checks if a card can be played on top of the current discard
 * @param {Object} card - The card to be played
 * @param {Object} topDiscard - The top card of the discard pile
 * @param {string} currentColor - The current active color
 * @param {Array} playerHand - The hand of the player attempting to play the card
 * @returns {boolean} Whether the card can be played
 */
function canPlayCard(card, topDiscard, currentColor, playerHand) {
  // Regular Wild cards can always be played
  if (card.value === CARD_VALUES.WILD.STANDARD) {
    return true;
  }
  
  // Wild Draw 4 can only be played if the player has no cards matching the current color
  if (card.value === CARD_VALUES.WILD.DRAW_FOUR) {
    // If playerHand is provided (for validation), check if player has playable cards
    if (playerHand && topDiscard) {
      // Check if player has any cards matching the current color
      const hasPlayableCard = playerHand.some(handCard => 
        handCard !== card && (
          handCard.color === currentColor || // Matching color
          (handCard.value === topDiscard.value && 
           handCard.value !== CARD_VALUES.WILD.STANDARD && 
           handCard.value !== CARD_VALUES.WILD.DRAW_FOUR) // Matching value (excluding wilds)
        )
      );
      
      // Wild Draw 4 can only be played if player has no playable cards
      return !hasPlayableCard;
    }
    
    // If no hand is provided or no top discard (for backward compatibility), allow the play
    return true;
  }
  
  // If there's no discard pile yet, any card can be played
  if (!topDiscard) {
    return true;
  }
  
  // Card can be played if it matches the current color
  if (card.color === currentColor) {
    return true;
  }
  
  // Card can be played if it matches the value of the top card
  if (card.value === topDiscard.value) {
    return true;
  }
  
  return false;
}

/**
 * Check if player has any legal moves
 * @param {Array} hand - The player's hand
 * @param {Object} topDiscard - The top card of the discard pile
 * @param {string} currentColor - The current active color
 * @returns {boolean} Whether the player has any legal moves
 */
function playerHasLegalMoves(hand, topDiscard, currentColor) {
  // Check each card in hand to see if any can be played
  return hand.some(card => canPlayCard(card, topDiscard, currentColor, hand));
}

/**
 * Choose the most strategic color for AI
 * @param {Array} hand - AI player's hand
 * @returns {string} The chosen color
 */
function chooseAIColor(hand) {
  const colorCounts = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0
  };
  
  // Count colors in hand
  hand.forEach(card => {
    if (card.color !== 'wild') {
      colorCounts[card.color]++;
    }
  });
  
  // Find most frequent color
  let maxCount = 0;
  let chosenColor = 'red'; // Default if no colored cards in hand
  
  for (const color in colorCounts) {
    if (colorCounts[color] > maxCount) {
      maxCount = colorCounts[color];
      chosenColor = color;
    }
  }
  
  gameLog(`AI chooses color: ${chosenColor}`);
  return chosenColor;
}

/**
 * Determine if the game has been won
 * @param {Object} player - Player to check for win condition
 * @returns {boolean} True if player has won
 */
function checkWinCondition(player) {
  return player.hand.length === 0;
}

export {
  canPlayCard,
  playerHasLegalMoves,
  chooseAIColor,
  checkWinCondition
};