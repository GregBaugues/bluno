# Fix for Issue #36: Draw 4 Card Bug

## Issue Link
[GitHub Issue #36: Fix Draw 4](https://github.com/GregBaugues/bluey-uno/issues/36)

## Problem Description
When Dad plays a Wild Draw 4 card on the player (Julia):
1. The player clicks to draw the cards
2. The cards are incorrectly added to Dad's hand (AI player) instead of the player's hand
3. Additionally, the player's turn should be skipped after drawing the cards

## Analysis
After reviewing the code, I found the following issues:

1. The problem is likely in the `handleDrawCards` function in `game.js` where the cards are being drawn.
2. When a player needs to draw cards due to a Wild Draw 4, the function might be using the wrong player index for adding cards to their hand.
3. The turn skipping logic after a Wild Draw 4 might not be functioning correctly.

## Reproduction Steps
1. Start a 4-player game to ensure Dad is included
2. Play until Dad plays a Wild Draw 4 card on the player
3. Click to draw the required cards
4. Observe that cards are added to Dad's hand instead of the player's
5. Note that the player's turn may not be properly skipped

## Fix Plan

### 1. Debug the Draw 4 Logic
- Verify which player index is being used when Dad plays a Wild Draw 4 card
- Check the `handleDrawCards` function to make sure it's adding cards to the correct player's hand
- Add logging to track the flow of card drawing and turn advancement

### 2. Fix Card Drawing Logic
- Modify the `handleDrawCards` function to ensure cards are added to the correct player's hand
- Ensure that the pendingDrawPlayerIndex is being set correctly when a Wild Draw 4 is played

### 3. Fix Turn Skipping Logic
- Ensure that after drawing cards from a Wild Draw 4, the player's turn is properly skipped
- Verify the turn advancement in the `handleRequiredDraw` function

### 4. Testing
- Use puppeteer to test the fix by simulating Dad playing a Wild Draw 4 on the player
- Verify that cards are added to the player's hand and their turn is skipped

## Implementation
I'll make the necessary changes to fix these issues and verify the fixes with testing.