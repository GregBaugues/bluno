# Special Card Actions in Bluey Uno

Based on the code review, here's how special cards work in the game:

## 1. Skip Card
- Visual: Number with a diagonal line through it
- Effect: Skips the next player's turn
- In 2-player games: Skips the opponent's turn, giving the player another turn
- In 3+ player games: Skips the next player, and turn goes to the following player
- Code handling: `handleSpecialCard()` function in game.js

## 2. Reverse Card
- Visual: Arrows indicating direction change
- Effect: Reverses the direction of play
- In 2-player games: Acts like a Skip card (opponent's turn is skipped)
- Code handling: `gameState.direction *= -1;` in the `handleSpecialCard()` function

## 3. Draw 2 Card
- Visual: Card with "+2" indicator
- Effect: Next player must draw 2 cards and lose their turn
- For human players: They must click the deck twice to draw cards
- For AI players: Cards are drawn automatically
- Code handling: `handleDrawCards(2)` in the `handleSpecialCard()` function

## 4. Wild Card
- Visual: Multicolored card with rainbow pattern
- Effect: Player chooses any color for the next card
- For human players: Color choice UI appears with four buttons
- For AI players: AI automatically chooses the most frequent color in its hand
- Code handling: `handleWildCardColor()` in the `handleSpecialCard()` function

## 5. Wild Draw 4 Card
- Visual: Multicolored card with "+4" indicator
- Effect: Player chooses any color, and next player draws 4 cards and loses their turn
- Special rule: Can only be played if the player has no cards matching the current color
- For human players: Color choice UI appears, then next player must draw 4 cards
- For AI players: AI chooses color, then next player draws cards
- Code handling: `handleWildCardColor()` and `handleDrawCards(4)` in the `handleSpecialCard()` function

## Interaction in Puppeteer Testing

When testing with Puppeteer:

1. **Color Choice UI**:
   - When a Wild or Wild Draw 4 card is played, the color choice UI appears
   - The selector for this UI is `#color-choice`
   - Color buttons have selectors like `.color-button[data-color="red"]`
   - However, Puppeteer testing has difficulty triggering this UI

2. **Drawing Required Cards**:
   - When a Draw 2 or Wild Draw 4 is played against the human player, they must draw the required cards
   - A visual indicator appears on the deck with `.draw-indicator` class
   - The player must click the deck multiple times to draw all required cards
   - The `.deck-reminder` element shows how many more cards need to be drawn

3. **Turn Indicators**:
   - Direction is shown by the `#direction-indicator` element
   - Current player turn is shown by the `.current-player` class and `#name-turn-indicator`