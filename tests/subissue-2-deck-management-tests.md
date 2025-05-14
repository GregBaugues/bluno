# Subissue 2: Deck Management Tests

## Overview
This subissue focuses on implementing tests for the deck management system of Bluey Uno, ensuring that cards are properly created, shuffled, dealt, and moved between draw and discard piles.

## Test Cases

### Deck Creation Tests
- Test that a new deck is created with the correct number of cards (108 cards in a standard Uno deck)
- Verify the distribution of card colors (25 red, 25 blue, 25 green, 25 yellow, 8 wild cards)
- Verify the distribution of card values within each color
- Test that each color has one zero card and two of each number 1-9
- Test that each color has the correct special cards (Skip, Reverse, Draw 2)
- Verify that there are 4 Wild cards and 4 Wild Draw 4 cards

### Deck Shuffling Tests
- Test that shuffling a deck changes the card order
- Verify that no cards are lost or duplicated during shuffling
- Test that shuffling maintains the correct deck size
- Test that multiple shuffles still produce valid deck states
- Verify the statistical randomness of the shuffle (optional)

### Card Dealing Tests
- Test dealing the correct number of cards to each player (7 cards in standard Uno)
- Verify that dealt cards are removed from the draw pile
- Test that the draw pile has the expected number of cards after dealing
- Test dealing to multiple players in sequence
- Test handling edge cases (dealing more cards than available in draw pile)

### Draw and Discard Pile Tests
- Test initializing the discard pile with the top card from draw pile
- Test drawing a card from the draw pile
- Test adding a played card to the discard pile
- Test reshuffling the discard pile when draw pile is empty
- Verify that reshuffling keeps the top discard card in place
- Test drawing multiple cards (e.g., for Draw 2 and Wild Draw 4 effects)
- Test drawing the last card from the draw pile

## Implementation Plan

### Step 1: Set Up Test Environment
1. Create test fixtures for deck-related tests
2. Configure test initialization for deck tests
3. Set up mock game state for isolated deck testing

### Step 2: Create Test Helpers
1. Create utility functions for deck validation
2. Create helpers for testing card distribution
3. Implement functions to simulate deck operations

### Step 3: Implement Deck Creation Tests
1. Write tests for deck initialization
2. Implement card distribution tests
3. Test color and value distribution

### Step 4: Implement Shuffle Tests
1. Write tests for deck shuffling
2. Test shuffle integrity (no cards lost or added)
3. Test randomness where appropriate

### Step 5: Implement Dealing and Pile Management Tests
1. Create tests for card dealing
2. Implement draw and discard pile tests
3. Test pile reshuffling logic

## Acceptance Criteria
- All test cases are implemented and pass
- Tests verify the integrity of the deck management system
- Tests ensure no invalid deck states can occur
- Shuffling and dealing operations maintain proper card counts
- Edge cases are properly tested (empty piles, reshuffling, etc.)

## Dependencies
- Deck creation code in deck.js
- Card manipulation functions
- Game state management

## Estimated Effort
- Medium (2-4 days)

## Implementation Notes
- Use deterministic RNG for shuffle tests to ensure repeatability
- Create snapshot tests for predefined deck states
- Use Jest's array matchers to verify card collections
- Test both normal operations and edge cases
- Consider performance implications of large test datasets