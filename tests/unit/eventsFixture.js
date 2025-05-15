/**
 * Common event bus mock for tests
 * This provides a standardized mock implementation of the events module
 */

// Create a mock event bus instance
const mockEventBus = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  clearAll: jest.fn()
};

// Mock GameEvents constants
const mockGameEvents = {
  CARD_PLAYED: 'card_played',
  CARD_DRAWN: 'card_drawn',
  INVALID_CARD_PLAY: 'invalid_card_play',
  INVALID_DRAW: 'invalid_draw',
  TURN_CHANGED: 'turn_changed',
  TURN_SKIPPED: 'turn_skipped',
  DIRECTION_CHANGED: 'direction_changed',
  COLOR_CHOICE_REQUIRED: 'color_choice_required',
  COLOR_CHOICE_MADE: 'color_choice_made',
  DRAW_REQUIREMENT: 'draw_requirement',
  DRAW_REQUIREMENT_COMPLETE: 'draw_requirement_complete',
  GAME_STARTED: 'game_started',
  GAME_ENDED: 'game_ended',
  UNO_CALLED: 'uno_called',
  UI_UPDATED: 'ui_updated',
  ANIMATION_COMPLETE: 'animation_complete'
};

// Export the mock for jest.mock to use
export default {
  __esModule: true,
  default: mockEventBus,
  GameEvents: mockGameEvents
};