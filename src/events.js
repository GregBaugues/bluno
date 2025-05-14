// Event system for the Bluey Uno game
import { gameLog } from './utils.js';

/**
 * Class to manage game events using pub/sub pattern
 * Replaces direct DOM event manipulation with a more centralized approach
 */
class EventBus {
  constructor() {
    this._events = {};
  }
  
  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Handler function to be called when event is emitted
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Remove an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Handler function to remove
   */
  off(event, callback) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(cb => cb !== callback);
  }
  
  /**
   * Trigger an event with data
   * @param {string} event - Event name
   * @param {*} data - Data to pass to handlers
   */
  emit(event, data) {
    if (!this._events[event]) return;
    
    // For debugging
    gameLog(`Event emitted: ${event}`, 'info');
    
    // Call all handlers for this event
    this._events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        gameLog(`Error in event handler for ${event}: ${error.message}`, 'error');
        console.error(error);
      }
    });
  }
  
  /**
   * Removes all event handlers for cleanup
   */
  clearAll() {
    this._events = {};
  }
}

// Define common game event names as constants
export const GameEvents = Object.freeze({
  // Card-related events
  CARD_PLAYED: 'card_played',
  CARD_DRAWN: 'card_drawn',
  INVALID_CARD_PLAY: 'invalid_card_play',
  INVALID_DRAW: 'invalid_draw',
  
  // Turn-related events
  TURN_CHANGED: 'turn_changed',
  TURN_SKIPPED: 'turn_skipped',
  DIRECTION_CHANGED: 'direction_changed',
  
  // Special card events
  COLOR_CHOICE_REQUIRED: 'color_choice_required',
  COLOR_CHOICE_MADE: 'color_choice_made',
  DRAW_REQUIREMENT: 'draw_requirement',
  DRAW_REQUIREMENT_COMPLETE: 'draw_requirement_complete',
  
  // Game-related events
  GAME_STARTED: 'game_started',
  GAME_ENDED: 'game_ended',
  UNO_CALLED: 'uno_called',
  
  // UI events
  UI_UPDATED: 'ui_updated',
  ANIMATION_COMPLETE: 'animation_complete'
});

// Export a singleton instance
const eventBusInstance = new EventBus();
export default eventBusInstance;