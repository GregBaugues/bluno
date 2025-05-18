# Issue 34: Change Styling of Deck and Discard Pile

## Requirements
1. Redesign the playing area into three distinct sections:
   - Top third: Opponents
   - Middle third: Playing area (deck and discard pile)
   - Bottom third: Human player

2. Deck and discard pile changes:
   - Move deck all the way to the left
   - Discard pile should show history of cards played
   - Cards in discard pile should be offset to show previous cards
   - Show enough overlap to see the corner of previously played cards
   - After 10 cards are visible in discard pile, reset to most recent card

## Tasks
1. Examine current UI structure and styling in HTML/CSS
2. Modify CSS to create three distinct sections
3. Adjust deck position to left side
4. Implement offset display of discard pile cards
5. Add logic to reset discard pile display after 10 cards
6. Test all changes with different screen sizes and orientations
7. Verify the changes don't break existing functionality

## Files to Examine/Modify
- index.html (for main layout)
- src/styles.css (for styling)
- src/ui.js (for rendering logic)
- src/game.js (for discard pile logic)