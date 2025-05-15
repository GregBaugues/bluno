# Wild Draw Four Card Test

This test script automates the testing of the Wild Draw 4 card functionality in the Bluey Uno game.

## Purpose

The test verifies that the Wild Draw 4 card operates correctly by:

1. Setting up a controlled 2-player game (Julia vs. Dad)
2. Forcing Dad to have and play a Wild Draw 4 card
3. Monitoring Julia drawing the required 4 cards
4. Verifying that Julia's turn is correctly skipped after drawing
5. Checking that the correct number of cards are in each player's hand
6. Capturing screenshots at each key step for visual verification

## Running the Test

### Method 1: Using the automated script

```bash
./run_wild_draw_four_test.sh
```

This script:
- Starts the development server
- Runs the Puppeteer test
- Automatically shuts down the server when done

### Method 2: Manual steps

1. Start the development server:
   ```bash
   npm start
   ```

2. In a separate terminal, run the test:
   ```bash
   node test_wild_draw_four.js
   ```

## Test Results

The test will:

1. Create a `screenshots` directory with numbered images showing each step of the test
2. Output detailed logs of what's happening at each step
3. Provide a summary at the end showing:
   - Whether Julia drew all 4 cards
   - Whether Julia's turn was correctly skipped
   - Whether the cards went to the correct player
   - The final state of each player's hand

## Interpreting the Results

The key indicators of success are:

1. After Dad plays Wild Draw 4, Julia should be prompted to draw 4 cards
2. After Julia draws all 4 cards, her turn should be skipped
3. After the skip, it should be Dad's turn again
4. Julia should have 8 cards (starting 4 + drawn 4)
5. Dad should have 2 cards (starting 3 - played 1)

If any of these conditions are not met, the test will output which checks failed.