# Subissue 1: Core Game Logic Tests

## Overview
This subissue focuses on implementing tests for the core game logic of Bluey Uno, ensuring that the fundamental game mechanics work correctly.

## Test Cases

### Game Initialization Tests
- Test that a new game is initialized with the correct number of players
- Test that initial player hands have the correct number of cards
- Test that the discard pile is initialized with one card face up
- Test that the draw pile contains the expected number of cards
- Verify the first player is selected correctly

### Turn Management Tests
- Test that player turns progress in the correct order (clockwise by default)
- Test that the direction changes correctly when a reverse card is played
- Test that the correct player is skipped when a skip card is played
- Test turn transitions when a player's turn ends
- Test turn validation - a player can only play during their turn

### Card Matching Rules Tests
- Test playing a card of the same color as the top discard card
- Test playing a card with the same number as the top discard card
- Test playing a wild card on any color
- Test playing action cards (Skip, Reverse, Draw 2) of the matching color
- Test that invalid cards cannot be played
- Test that Wild Draw 4 can only be played when the player has no matching color

### Game Winning Conditions Tests
- Test that a player wins when they play their last card
- Test that the game ends appropriately when a player wins
- Test win detection when the last card is an action card
- Test win detection when the last card is a wild card
- Verify game state after a win (game marked as over)

### Special Action Handling Tests
- Test that Skip cards properly skip the next player's turn
- Test that Reverse cards change the play direction
- Test that Draw 2 cards force the next player to draw 2 cards and skip their turn
- Test that Wild cards allow the player to choose the next color
- Test that Wild Draw 4 cards force the next player to draw 4 cards, skip their turn, and allow color choice

## Implementation Plan

### Step 1: Set Up Testing Environment
1. Install Jest and required dependencies
2. Configure Jest in package.json
3. Create test fixtures and helpers

### Step 2: Create Test Fixtures
1. Create sample game states for different scenarios
2. Create mock player data
3. Create sample card collections

### Step 3: Write Core Game Logic Tests
1. Implement game initialization tests
2. Implement turn management tests
3. Implement card matching rule tests
4. Implement win condition tests
5. Implement special action handling tests

### Step 4: Implement Test Helpers
1. Create helper functions for game state setup
2. Create helpers for commonly used assertions
3. Create utilities to simulate gameplay actions

## Acceptance Criteria
- All test cases are implemented and pass
- Tests cover edge cases and typical gameplay scenarios
- Tests are properly isolated from each other
- Tests run reliably without false positives/negatives

## Dependencies
- Game logic code in game.js
- Deck management code in deck.js
- Player management code in players.js
- Game rules code in gameRules.js
- Turn management code in turnManager.js

## Estimated Effort
- Medium to High (3-5 days)

## Implementation Notes
- Use Jest's mocking capabilities to isolate tests from UI components
- Consider using a test database or in-memory store for game state
- Focus on testing behavior, not implementation details
- Test both successful and error scenarios