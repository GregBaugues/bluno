// Utility functions for the Bluey Uno game

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Apply CSS styles to a DOM element
 * @param {HTMLElement} element - The element to apply styles to
 * @param {Object} styles - Object containing CSS property/value pairs
 * @returns {HTMLElement} The element with styles applied
 */
export function applyStyles(element, styles) {
  for (const [property, value] of Object.entries(styles)) {
    element.style[property] = value;
  }
  return element;
}

/**
 * Creates and returns a DOM element with specified attributes
 * @param {string} tagName - The HTML tag name
 * @param {Object} attributes - Key-value pairs of attributes to set
 * @param {Object} styles - CSS styles to apply
 * @param {string|Node} content - Text content or child node to append
 * @returns {HTMLElement} The created element
 */
export function createElement(tagName, attributes = {}, styles = {}, content = null) {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Apply styles
  applyStyles(element, styles);
  
  // Add content
  if (content) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else {
      element.appendChild(content);
    }
  }
  
  return element;
}

/**
 * Get the circular next player index based on current index and direction
 * @param {number} currentIndex - The current player index
 * @param {number} direction - 1 for clockwise, -1 for counter-clockwise
 * @param {number} totalPlayers - Total number of players
 * @returns {number} The next player index
 */
export function getNextPlayerIndex(currentIndex, direction, totalPlayers) {
  let nextIndex = (currentIndex + direction) % totalPlayers;
  if (nextIndex < 0) {
    nextIndex += totalPlayers;
  }
  return nextIndex;
}

/**
 * Logs a message with a prefix for easier debugging
 * @param {string} message - The message to log
 * @param {string} [level='log'] - The log level ('log', 'warn', 'error', 'info')
 */
export function gameLog(message, level = 'log') {
  const prefix = '[Bluey Uno] ';
  switch(level) {
    case 'warn':
      console.warn(prefix + message);
      break;
    case 'error':
      console.error(prefix + message);
      break;
    case 'info':
      console.info(prefix + message);
      break;
    default:
      console.log(prefix + message);
  }
}

/**
 * Delays execution for a specified time
 * @param {number} ms - Time to delay in milliseconds
 * @returns {Promise} A promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}