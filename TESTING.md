# Bluey Uno Testing Guide

This guide provides detailed instructions for testing the Bluey Uno game using Puppeteer. It's specifically designed to help Claude understand the game structure and provide reliable testing methods.

## Table of Contents

1. [Game Structure](#game-structure)
2. [Key DOM Elements and Selectors](#key-dom-elements-and-selectors)
3. [Testing Setup](#testing-setup)
4. [Game Initialization](#game-initialization)
5. [Player Interactions](#player-interactions)
6. [Special Card Testing](#special-card-testing)
7. [Common Challenges and Workarounds](#common-challenges-and-workarounds)
8. [MCP Testing Examples](#mcp-testing-examples)
9. [Error Reporting](#error-reporting)

## Game Structure

Bluey Uno is a JavaScript-based card game with the following structure:

- **Welcome Screen**: Player selects number of players (2-4)
- **Game Screen**: Main game interface with:
  - Player's hand (bottom)
  - Discard pile and deck (center)
  - Opponents/Bluey characters (top)
  - Turn indicators and color indicators (sides)
- **Special Screens**: Color selection UI for wild cards, victory screen

The game follows standard Uno rules with special cards (Skip, Reverse, Draw 2, Wild, Wild Draw 4).

## Key DOM Elements and Selectors

Here are the main elements and their selectors for Puppeteer testing:

### Game Containers
- `#game-container` - Main game container 
- `#opponents-area` - Area for opponent players (Bluey characters)
- `#side-indicators` - Contains color and direction indicators
- `#game-area` - Contains deck, discard pile and turn indicators
- `#player-hand` - Contains the human player's cards
- `#controls` - Contains game controls (usually hidden)
- `#color-choice` - UI for choosing colors after wild cards (hidden by default)

### Welcome Screen
- `.welcome-screen` - The welcome screen container
- `.welcome-content` - The content within the welcome screen
- Number selection buttons: No specific IDs, but can be selected via button:nth-of-type(1) for the first button (2 players)

### Game Elements
- `#deck` - The deck of cards for drawing
- `#discard-pile` - Where played cards go
- `[data-testid="deck"]` - Test-specific attribute for the deck
- `[data-testid="discard-pile"]` - Test-specific attribute for the discard pile
- `.turn-indicator` - Visual indicator for current turn
- `#color-indicator` - Shows the current active color
- `#direction-indicator` - Shows the direction of play
- `#name-turn-indicator` - Text indicator showing whose turn it is

### Player Hand
- `#player-hand` - Contains the human player's cards 
- `.player-cards` - Container for the cards in the player's hand
- `.card` - Individual card elements
- `.playable-card` - Class added to cards that can be played
- `[data-color="red"]` - Select cards by color using data attribute
- `[data-value="7"]` - Select cards by value using data attribute
- `[data-playable="true"]` - Select all playable cards using data attribute

### Opponent Players
- `.opponent` - Individual opponent containers
- `.character-image` - Character image containers
- `.opponent-cards` - Cards held by opponents
- `.opponent-card` - Individual opponent card elements
- `.card-badge` - Shows count of cards for opponents
- `.uno-indicator` - Shown when a player has one card and has called UNO

### Wild Card Color Choice
- `#color-choice` - Container for color choice UI
- `#color-buttons` - Container for color selection buttons
- `.color-button` - Individual color buttons
- `[data-color="red"]` - Color selection buttons with color data attribute
- `[data-testid="color-button-red"]` - Test-specific attribute for color buttons
- `[data-active="true"]` - Indicates when color choice UI is active

### Game State Access
The game state can be accessed via the `window.testHelpers` object.

## Testing Setup

This section covers how to test the Bluey Uno game using Claude Code's MCP Puppeteer tools.

### Using MCP Puppeteer Tools

Claude Code provides a set of Puppeteer tools via the MCP server that can be used directly within the conversation. These tools offer a simplified way to interact with the game without needing to write and run Node.js scripts.

Available MCP Puppeteer functions (ordered by reliability):

#### Recommended, Reliable Tools
- `mcp__puppeteer__puppeteer_navigate` - Navigate to a URL
- `mcp__puppeteer__puppeteer_screenshot` - Take screenshots
- `mcp__puppeteer__puppeteer_click` - Click on elements

#### Sometimes Useful
- `mcp__puppeteer__puppeteer_fill` - Fill form fields
- `mcp__puppeteer__puppeteer_select` - Select dropdown options
- `mcp__puppeteer__puppeteer_hover` - Hover over elements

#### Not Recommended (Unreliable)
- `mcp__puppeteer__puppeteer_evaluate` - Execute JavaScript (frequently returns undefined errors)

**Focus on using navigate, screenshot, and click** for the most reliable testing experience. These three tools are sufficient for most testing scenarios.

## Game Initialization

Testing the game initialization process with MCP Puppeteer:

```
// 1. Navigate to the game
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_navigate">
<parameter name="url">http://localhost:1234</parameter>
</invoke>
</function_calls>

// 2. Take a screenshot to verify the welcome screen
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">welcome-screen</parameter>
</invoke>
</function_calls>

// 3. Click on the 2-player button to start a game
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">button:nth-of-type(1)</parameter>
</invoke>
</function_calls>

// 4. Take another screenshot to see the initialized game
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">game-started</parameter>
</invoke>
</function_calls>
```

## Player Interactions

Here are examples of player interactions using MCP Puppeteer:

```
// 1. Play a card using data-playable attribute
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-playable="true"]</parameter>
</invoke>
</function_calls>

// 2. Draw a card using data-testid attribute
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-testid="deck"]</parameter>
</invoke>
</function_calls>

// 3. Play a specific card by color and value
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-color="red"][data-value="7"]</parameter>
</invoke>
</function_calls>
```

## Special Card Testing

Testing special cards like Wild cards using MCP Puppeteer:

```
// 1. Play a Wild card
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-value="Wild"][data-playable="true"]</parameter>
</invoke>
</function_calls>

// 2. Choose a color after playing a Wild card
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-testid="color-button-red"]</parameter>
</invoke>
</function_calls>
```

## Common Challenges and Workarounds


### Game Randomness

The game's random nature can make testing challenging. Here are some approaches to handle this:

1. **Focus on testing data attributes existence**: Instead of testing specific game outcomes, verify that all elements have the appropriate data attributes for selection.

2. **Use data-playable attribute**: This attribute indicates which cards can be played at any given moment, allowing your tests to adapt to the current game state.

3. **Multiple attempts**: For features like testing wild cards, be prepared to make multiple attempts as you may not always have a wild card in your initial hand.

4. **Screenshot verification**: Take screenshots to visually verify the state at each testing step.

### MCP Puppeteer Limitations

1. **No direct DOM manipulation**: You cannot directly manipulate the game state; you must use the UI interactions through clicks.

2. **puppeteer_evaluate is unreliable and should be avoided**: Testing shows that the MCP Puppeteer evaluate function frequently returns "undefined" errors, even with very simple code:
   - In practice, it's better to completely avoid using this function
   - Instead, use a combination of screenshots, UI interactions, and visual verification
   - Observable changes in the UI (such as card count, displayed cards, visible indicators) provide all the verification needed

### Accessing Game State Without puppeteer_evaluate

Instead of using the unreliable puppeteer_evaluate function, here are better approaches for testing game state:

1. **Take screenshots at each step**:
   ```
   <function_calls>
   <invoke name="mcp__puppeteer__puppeteer_screenshot">
   <parameter name="name">before-playing-card</parameter>
   </invoke>
   </function_calls>
   ```

2. **Perform UI interactions and observe the results visually**:
   ```
   // Play a card
   <function_calls>
   <invoke name="mcp__puppeteer__puppeteer_click">
   <parameter name="selector">[data-color="red"][data-value="4"]</parameter>
   </invoke>
   </function_calls>
   
   // Take screenshot to verify the change
   <function_calls>
   <invoke name="mcp__puppeteer__puppeteer_screenshot">
   <parameter name="name">after-playing-card</parameter>
   </invoke>
   </function_calls>
   ```

3. **Use clear selectors to target specific elements**:
   - For cards: `[data-color="red"][data-value="7"]`
   - For deck: `[data-testid="deck"]`
   - For color choice buttons: `[data-testid="color-button-red"]`

4. **Verify changes through visual confirmation**:
   - Count cards in the player's hand
   - Check the discard pile for the newly played card
   - Verify the color indicator has changed
   - Check if a dialog (like color choice) appears or disappears

This approach is more reliable than trying to access game state programmatically through evaluate functions that might not work consistently.

### Timing Issues

1. **Wait between actions**: Take screenshots between actions to ensure the UI has updated.

2. **Multiple testing attempts**: If a test fails, try again as the random nature of the game may provide different conditions.

## MCP Testing Examples

### Complete Test Flow Example

This example shows a complete test flow for playing a game:

```
// 1. Navigate to the game
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_navigate">
<parameter name="url">http://localhost:1234</parameter>
</invoke>
</function_calls>

// 2. Take a screenshot of the welcome screen
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">welcome-screen</parameter>
</invoke>
</function_calls>

// 3. Start a 2-player game
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">button:nth-of-type(1)</parameter>
</invoke>
</function_calls>

// 4. Take a screenshot of the game board
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">game-board</parameter>
</invoke>
</function_calls>

// 5. Play a specific card by color and value
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-color="red"][data-value="4"]</parameter>
</invoke>
</function_calls>

// 6. Take a screenshot after playing a card
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">after-play</parameter>
</invoke>
</function_calls>

// 7. Draw a card from the deck
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-testid="deck"]</parameter>
</invoke>
</function_calls>

// 8. Take a screenshot after drawing
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">after-drawing</parameter>
</invoke>
</function_calls>

// 9. Play a Wild card if available
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-value="Wild"]</parameter>
</invoke>
</function_calls>

// 10. Take a screenshot of color choice UI
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">color-choice</parameter>
</invoke>
</function_calls>

// 11. Choose a color
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-testid="color-button-blue"]</parameter>
</invoke>
</function_calls>

// 12. Take a screenshot of final state
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">after-color-choice</parameter>
</invoke>
</function_calls>
```

### Testing for Wild Cards

When testing for wild cards, you might not have one in your initial hand. Here's an approach to handle this using visual verification:

```
// 1. Take a screenshot of your initial hand
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">initial-hand</parameter>
</invoke>
</function_calls>

// 2. Try to click on a Wild card if you see one in the screenshot
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-value="Wild"]</parameter>
</invoke>
</function_calls>

// 3. Take a screenshot to see if the color choice UI appeared
// If it did, you had a Wild card and successfully played it
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">wild-card-color-choice</parameter>
</invoke>
</function_calls>

// 4. Choose a color
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-testid="color-button-red"]</parameter>
</invoke>
</function_calls>

// 5. If you didn't see a Wild card in your initial hand, try drawing cards
// Draw a card from the deck
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_click">
<parameter name="selector">[data-testid="deck"]</parameter>
</invoke>
</function_calls>

// 6. Take a screenshot after drawing to see if you got a Wild card
<function_calls>
<invoke name="mcp__puppeteer__puppeteer_screenshot">
<parameter name="name">hand-after-drawing</parameter>
</invoke>
</function_calls>

// 7. Keep drawing until you get a Wild card or finish testing another feature
// You can visually check the screenshots to see if a Wild card has appeared
```

## Error Reporting

When encountering issues during testing, it's important to gather comprehensive information to help diagnose the problem. Here's what to include in an error report:

### Error Report Format

1. **Screenshots**:
   - Take screenshots of the game state when the error occurred
   - Save screenshots to a folder called "screenshots/<date>" in the root of the project
   - Include screenshots before and after the action that caused the error

2. **Testing Steps**:
   - Document the sequence of actions that led to the error
   - Include which selectors were used and in what order

3. **Game State**:
   - Capture the game state using serializable format: `JSON.stringify(window.testHelpers.getGameState())`
   - Include this JSON data in your report

4. **Console Errors**:
   - Check for any JavaScript errors in the console
   - Include full error messages and stack traces

5. **Element State**:
   - Information about the element's attributes and state when the error occurred
   - Check if data attributes are correctly assigned

### Example Error Report

```
Error Report: Unable to play Wild card

1. Screenshots:
   - game-before-wild.png (screenshot before attempting to play Wild card)
   - game-after-wild.png (screenshot showing error state)

2. Steps to reproduce:
   - Navigated to http://localhost:1234
   - Started 2-player game
   - Found a Wild card in hand that was playable
   - Clicked on Wild card
   - No color selection UI appeared

3. Game State:
   {
     "currentPlayer": 0,
     "direction": 1,
     "players": [...],
     "deck": [...],
     "discardPile": [...],
     "currentColor": "red",
     "currentValue": "7"
   }

4. Console Errors:
   Uncaught TypeError: Cannot read property 'style' of null
   at showColorChoice (game.js:342)
   at handleCardPlay (game.js:215)

5. Element State:
   Wild card has data-playable="true" but #color-choice element is missing
```

By following this error reporting format, you'll provide enough context to help diagnose and fix issues in the testing process.