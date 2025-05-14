# Subissue 4: Special Card Effect Tests

## Overview
This subissue focuses on implementing tests for special card effects in Bluey Uno, ensuring that Skip, Reverse, Draw 2, Wild, and Wild Draw 4 cards function correctly and affect the game state as expected.

## Test Cases

### Skip Card Tests
- Test that playing a Skip card skips the next player's turn
- Test Skip card effect when played in a 2-player game
- Test Skip card effect when played in a multi-player game
- Test Skip card effect when combined with direction changes
- Verify Skip effect when it's the last card played by a player
- Test multiple Skip cards played consecutively

### Reverse Card Tests
- Test that playing a Reverse card changes the game direction
- Test Reverse card effect in a 2-player game (should act like a Skip)
- Test Reverse card in multi-player games (3+ players)
- Test multiple Reverse cards played consecutively
- Verify that player order is correct after direction change
- Test Reverse as the last card played by a player

### Draw 2 Card Tests
- Test that playing a Draw 2 card forces the next player to draw 2 cards
- Verify that the next player's turn is skipped after drawing
- Test stacking Draw 2 cards (if allowed in game rules)
- Test Draw 2 effect when it's the last card played by a player
- Test Draw 2 when the draw pile has fewer than 2 cards
- Verify correct handling of Draw 2 in combination with direction changes

### Wild Card Tests
- Test that playing a Wild card allows the player to choose the next color
- Verify that the game continues with the selected color
- Test Wild card as the last card played by a player
- Test color selection UI/mechanism
- Test Wild card played after various other card types
- Test AI player color selection strategy

### Wild Draw 4 Card Tests
- Test that playing a Wild Draw 4 card forces the next player to draw 4 cards
- Verify that the next player's turn is skipped after drawing
- Test that the player can select the next color
- Test Wild Draw 4 validation (should only be played when no matching color available)
- Test challenge mechanism if implemented (other player can challenge invalid Wild Draw 4)
- Test Wild Draw 4 when the draw pile has fewer than 4 cards
- Test AI player handling of Wild Draw 4 cards

## Implementation Plan

### Step 1: Set Up Test Environment
1. Create test fixtures for special card testing
2. Set up mock game states for different scenarios
3. Create helper functions for testing card effects

### Step 2: Implement Skip and Reverse Tests
1. Create test cases for Skip card functionality
2. Implement Reverse card test cases
3. Test direction management and player order

### Step 3: Implement Draw Card Tests
1. Create Draw 2 card test cases
2. Test drawing mechanics and turn skipping
3. Test edge cases with limited draw pile

### Step 4: Implement Wild Card Tests
1. Create Wild card test suite
2. Test color selection mechanics
3. Implement Wild Draw 4 tests
4. Test validation rules for Wild Draw 4 plays

### Step 5: Test Card Combinations
1. Test interactions between different special cards
2. Test sequences of special cards
3. Verify game state consistency across complex scenarios

## Acceptance Criteria
- All special card effects are thoroughly tested
- Tests pass consistently
- Edge cases are properly handled
- Game state remains consistent after card effects
- Tests cover both normal and exceptional conditions

## Dependencies
- Game rules implementation in gameRules.js
- Card effects handling in game.js or cardEffects.js
- Turn management system
- Player state management

## Estimated Effort
- Medium (2-3 days)

## Implementation Notes
- Use parameterized tests for similar card effects with different values
- Create custom test fixtures for complex game states
- Test both successful and error/edge cases
- Mock UI interactions for color selection testing
- Test rule variations if the game supports house rules