# Simplified Testing Approach for Bluey Uno

This document outlines our simplified testing approach for the Bluey Uno game. The goal is to ensure basic functionality works correctly while keeping tests easy to maintain.

## Testing Philosophy

1. **Focus on behavior, not implementation details**
   - Test what the application does, not how it does it
   - Avoid testing private implementation details

2. **Keep tests simple and readable**
   - Minimal setup and teardown
   - Clear assertions
   - Less code = easier maintenance

3. **Test critical paths only**
   - Game initialization
   - Card playing rules
   - Basic game flow

## Test Structure

Our simplified test approach consists of three main test files:

1. `tests/game.simplified.test.js` - Core game functionality tests
2. `tests/browser.test.js` - Basic browser integration tests
3. `tests/e2e.test.js` - End-to-end test with Puppeteer (primarily manual testing)

## Running Tests

Run all tests with:

```bash
npm test
```

Run just the simplified tests:

```bash
npx jest tests/game.simplified.test.js
```

## Manual Testing with Puppeteer

For end-to-end testing, we use Claude's Puppeteer capabilities to test the game in a real browser environment.

1. Ensure the game is running at http://haihai.ngrok.io
2. Follow the Puppeteer script in `tests/e2e.test.js` or use the one in TESTING.md

## Test Coverage

The simplified tests cover:

- Game initialization
- Card playing rules
- Deck creation
- Basic player interactions

This approach ensures the core functionality works while making tests easier to maintain as the application evolves.