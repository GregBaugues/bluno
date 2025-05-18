# Bluey Uno Game Architecture

This document provides a comprehensive overview of the refactored architecture for the Bluey Uno card game.

## Overview

The Bluey Uno game has been refactored to follow modern JavaScript practices and patterns, with a focus on:

- **Modularity**: Breaking the codebase into focused, single-responsibility modules
- **Maintainability**: Making code easier to understand, modify and extend
- **Scalability**: Enabling future enhancements without major restructuring
- **Testability**: Facilitating unit and integration testing

## Architecture Diagram

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│     Game Logic    │     │  Event System     │     │       UI          │
│  ┌─────────────┐  │     │                   │     │  ┌─────────────┐  │
│  │   game.js   │◄─┼─────┼───┐               │     │  │ViewController│  │
│  └─────────────┘  │     │   │               │     │  └─────────────┘  │
│  ┌─────────────┐  │     │   │               │     │        ▲          │
│  │ gameRules.js│◄─┼─────┼───┤               │     │        │          │
│  └─────────────┘  │     │   │               │     │        │          │
│  ┌─────────────┐  │     │   │   events.js   │◄────┼────────┘          │
│  │turnManager.js│◄─┼─────┼───┤  (Event Bus) │     │                   │
│  └─────────────┘  │     │   │               │     │  ┌─────────────┐  │
│  ┌─────────────┐  │     │   │               │     │  │  Components │  │
│  │playerManager│◄─┼─────┼───┘               │     │  │┌───────────┐│  │
│  └─────────────┘  │     │                   │     │  ││   Card    ││  │
│  ┌─────────────┐  │     │                   │     │  │└───────────┘│  │
│  │   deck.js   │◄─┼─────┼───────────────────┼─────┼──┤┌───────────┐│  │
│  └─────────────┘  │     │                   │     │  ││ Character ││  │
└───────────────────┘     └───────────────────┘     │  │└───────────┘│  │
                                                    │  │┌───────────┐│  │
┌───────────────────┐     ┌───────────────────┐     │  ││   Deck    ││  │
│    Game State     │     │    Resources      │     │  │└───────────┘│  │
│                   │     │  ┌─────────────┐  │     │  └─────────────┘  │
│                   │     │  │  sounds.js  │◄─┼─────┼───────────────────┘
│  ┌─────────────┐  │     │  └─────────────┘  │     │
│  │ gameState.js│◄─┼─────┼───────────────────┼─────┘
│  └─────────────┘  │     │  ┌─────────────┐  │
│                   │     │  │  images.js  │◄─┘
└───────────────────┘     │  └─────────────┘  │
                          │                   │
┌───────────────────┐     │  ┌─────────────┐  │
│      Shared       │     │  │constants.js │◄─┘
│                   │     │  └─────────────┘  │
│  ┌─────────────┐  │     └───────────────────┘
│  │   utils.js  │◄─┘
│  └─────────────┘  │
└───────────────────┘
```

## Module Descriptions

### Core Game Logic

- **game.js**: Main game controller that coordinates game flow
- **gameRules.js**: Implements Uno game rules and validates moves
- **turnManager.js**: Manages player turns and turn direction
- **playerManager.js**: Handles player creation and management
- **deck.js**: Card deck creation, shuffling, and dealing

### State Management

- **gameState.js**: Central state management with observer pattern
  - Maintains the single source of truth for game state
  - Notifies subscribers of state changes
  - Provides methods for state updates

### Event System

- **events.js**: Implementation of pub/sub pattern
  - Decouples components through event-based communication
  - Defines standard game events
  - Provides methods for subscribing and publishing events

### UI System

- **ui/ViewController.js**: Coordinates UI updates (MVC Controller)
  - Observes game state and events
  - Manages component lifecycle
  - Routes UI events to appropriate handlers

- **ui/components/**: Component-based UI system
  - **Component.js**: Base component with lifecycle methods
  - **Card.js**: Card rendering and interaction
  - **Character.js**: Character display with animations
  - **Deck.js**: Deck and discard pile visualization

- **ui.js**: Legacy UI interface (for backward compatibility)
  - Delegates to ViewController
  - Provides transition layer to new architecture

### Resources

- **sounds.js**: Sound effects management
  - Loads and plays sound effects
  - Handles sound toggling

- **images.js**: Character image handling
  - Loads character images
  - Provides fallback displays

### Shared

- **constants.js**: Centralized constants for the game
  - Card colors and values
  - Character data
  - Sound effects
  - UI settings

- **utils.js**: Utility functions
  - DOM helpers
  - Logging
  - Array and object utilities

## Data Flow

1. **User Interaction**: Player interacts with UI components
2. **UI Events**: Components emit events for user actions
3. **Game Logic**: Game controller processes actions
4. **State Updates**: Game state is updated based on actions
5. **State Notification**: Subscribers are notified of state changes
6. **UI Updates**: ViewController updates UI based on new state

## Event Flow

```
┌─────────────┐  1. User plays card   ┌─────────────┐
│    Card     │────────────────────►  │   EventBus  │
│  Component  │                       │   (events)  │
└─────────────┘                       └─────────────┘
                                            │
                                            │ 2. Emits "cardPlayed" event
                                            ▼
┌─────────────┐  3. Processes card    ┌─────────────┐
│    Game     │ ◄───────────────────  │  Game Logic │
│   State     │                       │   (game)    │
└─────────────┘                       └─────────────┘
      │                                      │
      │ 4. Updates state                     │ 5. Applies game rules
      │                                      │
      ▼                                      ▼
┌─────────────┐  6. Notifies changes  ┌─────────────┐
│  View       │ ◄───────────────────  │   EventBus  │
│ Controller  │                       │   (events)  │
└─────────────┘                       └─────────────┘
      │
      │ 7. Updates components
      ▼
┌─────────────┐
│    UI       │
│ Components  │
└─────────────┘
```

## Component Hierarchy

```
Component (Base)
├── Card
│   ├── PlayableCard
│   └── OpponentCard
├── Character
│   ├── PlayerCharacter
│   └── AICharacter
├── Deck
│   ├── DrawPile
│   └── DiscardPile
├── GameBoard
├── ColorChooser
├── WelcomeScreen
└── GameOverScreen
```

## Singleton Pattern Usage

The following modules implement the Singleton pattern:

- **gameState.js**: Single source of truth for game state
- **events.js**: Central event bus for pub/sub communication
- **ViewController.js**: Central coordinator for UI updates

## Coding Standards

- ES Modules for code organization
- Consistent naming conventions
  - camelCase for variables, functions, and methods
  - PascalCase for classes and components
  - UPPER_SNAKE_CASE for constants
- JSDoc comments for documentation
- Event-based communication between components
- Centralized state management
- Component-based UI architecture

## Testing Strategy

- Unit tests for core modules
- Component tests for UI components
- Integration tests for game flow
- Event simulation for testing component interaction
- Puppeteer for UI verification

## Future Enhancements

The refactored architecture supports several potential enhancements:

- Additional special cards
- Multiplayer support
- Game statistics and scoring
- Theme customization
- Accessibility improvements
- Mobile optimizations