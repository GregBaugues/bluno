// Game state management system
import { gameLog } from './utils.js';

/**
 * Class to manage game state with observer pattern
 */
class GameState {
  constructor() {
    // Initial state
    this._state = {
      deck: [],
      discardPile: [],
      players: [],
      currentPlayerIndex: 0,
      direction: 1, // 1 for clockwise, -1 for counter-clockwise
      isGameStarted: false,
      currentColor: null,
      waitingForColorChoice: false,
      pendingDrawPlayerIndex: null, // Store next player index who will draw (for Wild Draw 4)
      pendingDrawCount: 0, // Number of cards to draw (for Wild Draw 4)
      requiredDraws: 0, // Number of cards player must draw (due to Draw 2 or Draw 4)
      isDrawingCards: false, // Flag to indicate whether a player is currently in the process of drawing cards
      winningPlayerIndex: undefined // Store the index of the player who won by playing their last card
    };
    
    // Array of listeners to be notified on state changes
    this._listeners = [];
  }
  
  /**
   * Get the current state (read-only)
   * @returns {Object} A copy of the current state
   */
  get state() {
    return { ...this._state }; // Return a copy to prevent direct modification
  }
  
  /**
   * Update state with proper notifications
   * @param {Object} changes - Object with state properties to update
   */
  updateState(changes) {
    const prevState = { ...this._state };
    this._state = { ...this._state, ...changes };
    
    // Log significant state changes for debugging
    if (changes.currentPlayerIndex !== undefined && 
        changes.currentPlayerIndex !== prevState.currentPlayerIndex) {
      const playerName = this._state.players[changes.currentPlayerIndex]?.name || 'Unknown';
      gameLog(`Turn changed to player: ${playerName} (index: ${changes.currentPlayerIndex})`);
    }
    
    // Notify all listeners of the state change
    this._notifyListeners();
  }
  
  /**
   * Add a listener for state changes
   * @param {Function} listener - Callback function to be called on state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this._listeners.push(listener);
    // Return unsubscribe function
    return () => this.unsubscribe(listener);
  }
  
  /**
   * Remove a listener
   * @param {Function} listener - The listener to remove
   */
  unsubscribe(listener) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }
  
  /**
   * Notify all listeners of state change
   * @private
   */
  _notifyListeners() {
    // Pass a copy of the state to all listeners
    const stateCopy = { ...this._state };
    this._listeners.forEach(listener => listener(stateCopy));
  }
  
  /**
   * Reset the game state for a new game
   */
  resetState() {
    this._state = {
      deck: [],
      discardPile: [],
      players: [],
      currentPlayerIndex: 0,
      direction: 1,
      isGameStarted: false,
      currentColor: null,
      waitingForColorChoice: false,
      pendingDrawPlayerIndex: null,
      pendingDrawCount: 0,
      requiredDraws: 0,
      isDrawingCards: false,
      winningPlayerIndex: undefined
    };
    this._notifyListeners();
  }
  
  /**
   * Initialize empty game state for display before game starts
   */
  initializeEmptyGame() {
    this._state = {
      deck: [{ color: 'blue', value: '0', emoji: '😶' }], // Just for display
      discardPile: [],
      
      // Create player with sample cards for initial display
      players: [{
        name: 'Julia',
        hand: [
          { color: 'red', value: '7', emoji: '😊' },
          { color: 'blue', value: '4', emoji: '😇' },
          { color: 'green', value: '2', emoji: '😁' },
          { color: 'yellow', value: '9', emoji: '😠' },
          { color: 'wild', value: 'Wild', emoji: '🌈' }
        ],
        isAI: false,
        hasCalledUno: false
      }],
      
      currentPlayerIndex: 0,
      direction: 1,
      isGameStarted: false,
      currentColor: null,
      waitingForColorChoice: false,
      pendingDrawPlayerIndex: null,
      pendingDrawCount: 0,
      requiredDraws: 0,
      isDrawingCards: false,
      winningPlayerIndex: undefined
    };
    
    this._notifyListeners();
  }
}

// Export a singleton instance
const gameStateInstance = new GameState();
export default gameStateInstance;