# Subissue 3: Player System Tests

## Overview
This subissue focuses on implementing tests for the player management system of Bluey Uno, ensuring that player creation, hand management, AI decision making, and UNO call mechanics function correctly.

## Test Cases

### Player Creation Tests
- Test creating a human player with the correct initial properties
- Test creating AI players with proper character assignments
- Test that the correct number of players are created based on game settings
- Verify each player has unique properties (name, isAI flag, etc.)
- Test player initialization with empty hands
- Test that player ordering is properly established

### Player Hand Management Tests
- Test adding cards to a player's hand
- Test removing cards from a player's hand when played
- Verify hand size calculation is accurate
- Test sorting cards in hand (if implemented)
- Test retrieving playable cards based on the current game state
- Test hand validation (ensuring a player has a claimed card)
- Test drawing cards and adding them to a player's hand

### AI Player Decision Making Tests
- Test AI selecting a playable card when multiple options exist
- Test AI selecting the optimal card based on strategy
- Test AI behavior when only non-matching cards are in hand
- Test AI wild card color selection logic
- Test AI handling of special cards (Skip, Reverse, Draw 2, Wild, Wild Draw 4)
- Verify AI properly calls UNO when down to one card
- Test AI decision making at different difficulty levels (if implemented)

### UNO Call Mechanics Tests
- Test player calling UNO when down to one card
- Test penalty for failing to call UNO (drawing additional cards)
- Test UNO call timing validation
- Test catching other players who failed to call UNO
- Verify UNO state is properly tracked in the game state
- Test UNO call visibility to other players

## Implementation Plan

### Step 1: Set Up Test Environment
1. Create mock player data for testing
2. Set up fixtures for different player scenarios
3. Create utilities for simulating player actions

### Step 2: Implement Player Creation Tests
1. Write tests for player initialization
2. Test various player configurations
3. Verify player properties are set correctly

### Step 3: Implement Hand Management Tests
1. Create tests for adding/removing cards from hands
2. Test hand state validation
3. Implement tests for retrieving playable cards

### Step 4: Implement AI Decision Tests
1. Create AI decision testing framework
2. Implement tests for different decision scenarios
3. Verify AI strategy and behavior

### Step 5: Implement UNO Call Tests
1. Write tests for UNO calling mechanics
2. Test UNO penalty enforcement
3. Test proper state tracking for UNO calls

## Acceptance Criteria
- All test cases pass reliably
- Tests cover both human and AI player functionality
- Edge cases are properly handled (empty hands, full hands, etc.)
- AI decision making is thoroughly tested
- UNO calling mechanics are verified

## Dependencies
- Player management code in players.js
- AI decision making logic
- Game state management
- Card validation logic

## Estimated Effort
- Medium (2-3 days)

## Implementation Notes
- Mock game state for isolated player testing
- Test AI decision making with predefined hands and game states
- Create fixtures with various hand configurations
- Test both standard and edge case scenarios
- Consider creating custom matchers for player state assertions