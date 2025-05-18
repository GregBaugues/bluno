# Bluey UNO Game - Gameplay Testing Log

## Testing Session: May 14, 2025

### Setup
- Testing environment: Puppeteer automated browser testing
- Game URL: http://haihai.ngrok.io
- Browser: Chrome (via Puppeteer)
- Device emulation: iPad Mini (landscape mode)

### Game Initialization
- ✅ Welcome screen loads successfully
- ✅ Player count selection buttons (2, 3, 4) are displayed and functional
- ✅ Character selection is automatic based on player count
- ✅ Initial hand of 7 cards is dealt to all players
- ✅ Starting card is placed on discard pile
- ✅ Human player's turn starts first

### Gameplay Observations

#### Basic Game Flow
- ✅ Turn rotation works correctly (clockwise by default)
- ⚠️ Cards can be played when matching color or value, but UI sometimes doesn't update
- ✅ Drawing cards functions properly when no playable cards exist
- ✅ AI opponents make valid moves on their turns

#### Special Card Effects
- Not tested: Reverse cards functionality
- Not tested: Regular Wild cards functionality 
- ✅ Wild Draw 4 cards: Properly forced player to draw 4 cards
- ✅ Wild Draw 4 cards: Player's turn is skipped after drawing the cards
- ✅ Wild Draw 4 cards: Color choice applied (appeared to default to green)

#### UI Responsiveness
- ✅ Card animations are smooth
- ✅ Current player indicator updates correctly
- ✅ Color indicator displays the active color
- ⚠️ Card interactivity sometimes unreliable - had to click multiple cards to find one that would play

#### Win Condition
- Not observed during testing session

### Issues and Observations

#### Issue: Card Playing Inconsistency
During automated testing using Puppeteer, we identified an issue where the game sometimes does not respond to card clicks, or the UI doesn't update after playing a card.

**Steps to Reproduce:**
1. Start a 2-player game
2. Attempt to play a matching card from player's hand
3. Card may not play on the first attempt
4. When a card is played, the discard pile may not visually update immediately

**Expected Behavior:**
Cards should be playable on first click and UI should update immediately.

**Actual Behavior:**
Some cards required multiple attempts to play, and the discard pile UI sometimes lagged behind the actual game state.

**Priority:** Medium - Game is playable but user experience is degraded.

#### Wild Draw 4 Card Implementation
PR 21 appears to have successfully fixed the Wild Draw 4 card functionality. When testing:

1. ✅ Bluey played a Wild Draw 4 card
2. ✅ Player was correctly forced to draw 4 cards
3. ✅ Player had to draw one card at a time (intentional UX for children?)
4. ✅ Player's turn was properly skipped after drawing all 4 cards
5. ✅ Wild color choice was properly applied

This represents a fix for the previously reported bug where turns weren't being skipped properly.

### Conclusion

The Bluey UNO game provides a charming and visually appealing interface designed well for young children. The PR 21 fixes for the Wild Draw 4 card functionality appear to be working correctly.

There are still some UI responsiveness issues that could be improved, but these don't break the core gameplay.

**Suggestions for improvements:**
1. Improve card selection reliability and feedback
2. Add more visual feedback when cards are played
3. Consider allowing all 4 cards to be drawn at once from a Wild Draw 4
4. Add animation or visual indicators when special cards take effect