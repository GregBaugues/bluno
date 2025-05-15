# Issue #36: Fix Draw 4 Card Bug

## Problem Description
When Dad (AI player) plays a Wild Draw 4 card on the human player:
1. The human player clicks to draw the cards
2. The cards are incorrectly added to Dad's hand instead of the human player's hand
3. The human player's turn should be skipped after drawing the cards

## Relevant Files
- `game.js`: Main game logic including turn management and card handling
- `players.js`: Player management including hand manipulation
- `ui.js`: User interface updates including card display

## Investigation Steps
1. Locate the function that handles drawing cards when a Wild Draw 4 is played
2. Find the bug where cards are added to the wrong player's hand
3. Verify that turn skipping logic works correctly after cards are drawn

## Potential Issues
- The player index might be incorrectly tracked during the draw process
- There might be confusion between the player who played the Wild Draw 4 and the player who needs to draw
- The turn management after drawing might not be working correctly

## Plan of Action
1. Verify the implementation of the drawCard function in game.js
2. Check how player indexes are tracked during the Wild Draw 4 process
3. Verify the logic that adds cards to a player's hand
4. Test the draw process by logging player indexes and hand counts
5. Fix any bugs in the player index tracking or card addition logic
6. Verify that the turn is properly skipped after drawing
7. Test the fix thoroughly with multiple scenarios

## Success Criteria
- When Dad plays a Wild Draw 4, the 4 cards are added to the human player's hand
- After drawing the cards, the human player's turn is skipped