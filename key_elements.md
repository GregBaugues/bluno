# Key Game Elements and Selectors

## Initial Screen (Welcome Screen)
- Welcome screen container: `.welcome-screen`
- Player count buttons: No specific class/ID, but they are buttons inside the welcome screen
  - 2 Player button: `.welcome-screen button:nth-child(1)`
  - 3 Player button: `.welcome-screen button:nth-child(2)`
  - 4 Player button: `.welcome-screen button:nth-child(3)`

## Game Board
- Game container: `#game-container`
- Opponents area: `#opponents-area`
- Opponents (Bluey characters):
  - Bluey: `#opponent-bluey .opponent`
  - Bingo: `#opponent-bingo .opponent`
  - Dad/Bandit: `#opponent-bandit .opponent`
- Deck: `#deck`
- Discard pile: `#discard-pile`
- Player's hand: `#player-hand`
- Player's cards: `.player-cards .card`
- Current color indicator: `#color-indicator`
- Direction indicator: `#direction-indicator`
- Turn indicator: `.turn-indicator`
- Name turn indicator: `#name-turn-indicator`

## Special UI Elements
- Color choice UI (for Wild cards): `#color-choice`
- Color buttons: `#color-buttons .color-button`
  - Red button: `.color-button[data-color="red"]`
  - Blue button: `.color-button[data-color="blue"]`
  - Green button: `.color-button[data-color="green"]`
  - Yellow button: `.color-button[data-color="yellow"]`
- Error message container: `#error-message-container`
- Draw requirement message: (dynamically created)

## Card-Related Elements
- Card in player's hand: `.player-cards .card`
- Playable card: `.playable-card` (has this class when it can be played)
- Card in discard pile: `.discard-cards-container .card`
- Top card in discard pile: `.discard-cards-container .card:last-child`

## Game State Indicators
- Current player (highlighted): `.current-player`
- UNO indicator: `.uno-indicator`
- Card badge (showing card count): `.card-badge`
- Deck count: `.deck-count`
- Draw indicator: `.draw-indicator` (shows when player needs to draw cards)

## End Game Screen
- Victory screen: (dynamically created, no specific selector)
- Winner message: (dynamically created, no specific selector)
- Play again button: (dynamically created, no specific selector)