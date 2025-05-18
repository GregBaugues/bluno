# Issue 38: Remove Extraneous Visual Indicators

## Issue Link
https://github.com/GregBaugues/bluey-uno/issues/38

## Description
The issue requests to remove two types of visual indicators:
1. Text notifications on red background when drawing cards
2. +2 and +4 circular overlays on special draw cards

## Implementation

I've identified and removed the following visual elements:

### 1. Text Notifications on Red Background
Located in `ui.js`, I removed:
- The draw indicator that appeared above the deck showing "Draw X more" 
- The red background notification at the bottom of the deck with text like "Tap to draw your last required card"
- The circular counter on the deck that showed the number of remaining required draws
- The event listeners and functions that displayed drawing requirement messages

### 2. +2 and +4 Circular Overlays
Located in `ui.js`, in the `createCardElement` function, I removed:
- The +2 circular indicator overlay that was added to Draw 2 cards
- The +4 circular indicator overlay that was added to Wild Draw 4 cards

## Files Modified
- `ui.js` - Removed all extraneous visual indicators as specified

## Testing
The changes have been implemented, removing all specified visual elements from the UI while maintaining the core functionality of the game.

The special Draw 2 and Wild Draw 4 cards still work correctly, but without the additional visual indicators that were previously displayed.

## Status
Implementation completed. The extraneous visual indicators have been successfully removed as requested.

## Pull Request
https://github.com/GregBaugues/bluno/pull/40