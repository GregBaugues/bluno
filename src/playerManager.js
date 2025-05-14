// Player management for Bluey Uno
import { CHARACTERS, CHARACTER_PRIORITY } from './constants.js';
import { shuffleArray } from './utils.js';
import { gameLog } from './utils.js';
import eventBus, { GameEvents } from './events.js';

/**
 * Creates a player object
 * @param {string} name - Player name
 * @param {boolean} isAI - Whether the player is AI-controlled
 * @returns {Object} Player object
 */
function createPlayer(name, isAI) {
  return {
    name,
    hand: [],
    isAI: isAI,
    hasCalledUno: false
  };
}

/**
 * Creates all players for the game
 * @param {number} numPlayers - Total number of players (including human)
 * @returns {Array} Array of player objects
 */
function createPlayers(numPlayers) {
  const players = [];
  
  // Create human player (Julia)
  players.push(createPlayer(CHARACTERS.PLAYER, false));
  
  // Create AI players with specific Bluey characters
  // We'll use Bluey, Bingo, and Dad in that priority order
  
  // Ensure numPlayers is between 2 and 4 (1 human + 1-3 AI)
  const totalPlayers = Math.max(2, Math.min(4, numPlayers));
  
  // Use as many characters as needed based on numPlayers (1-3 AI players)
  for (let i = 0; i < Math.min(totalPlayers - 1, CHARACTER_PRIORITY.length); i++) {
    players.push(createPlayer(CHARACTER_PRIORITY[i], true));
  }
  
  return players;
}

/**
 * Get random Bluey characters without repeats
 * @param {number} count - Number of characters to return
 * @returns {Array} Array of character names
 */
function getRandomBlueyCharacters(count) {
  // Convert object values to array for shuffling
  const characters = Object.values(CHARACTERS.AI);
  
  // Shuffle the array
  const shuffled = shuffleArray(characters);
  
  // Return the first 'count' characters
  return shuffled.slice(0, count);
}

/**
 * Makes the player call UNO
 * @param {number} playerIndex - Index of the player
 */
function sayUno(playerIndex = 0) {
  gameLog(`Player ${playerIndex} says UNO!`);
  
  // Emit UNO called event
  eventBus.emit(GameEvents.UNO_CALLED, { playerIndex });
}

/**
 * Get the player who has the most cards of the given color
 * @param {Array} players - Array of player objects
 * @param {string} color - Color to check for
 * @returns {number} Index of the player with most cards of the color
 */
function getPlayerWithMostCardsOfColor(players, color) {
  let maxCount = -1;
  let playerIndex = 0;
  
  players.forEach((player, index) => {
    const colorCount = player.hand.filter(card => card.color === color).length;
    if (colorCount > maxCount) {
      maxCount = colorCount;
      playerIndex = index;
    }
  });
  
  return playerIndex;
}

export {
  createPlayer,
  createPlayers,
  getRandomBlueyCharacters,
  sayUno,
  getPlayerWithMostCardsOfColor
};