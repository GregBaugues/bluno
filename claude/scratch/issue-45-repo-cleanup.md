# Issue 45: Cleanup Repo

## Issue Link
https://github.com/GregBaugues/bluey-uno/issues/45

## Overview
This document outlines the plan for cleaning up and organizing the repository structure. The goal is to remove unnecessary files and improve organization by creating appropriate subdirectories.

## Analysis of Current State
The repository currently has several files in the root directory that could be better organized:
- Multiple documentation .md files that could be grouped together
- Test files that could be moved to a more appropriate location
- Media files (images, sounds) that should be in their respective directories
- Duplicate or obsolete files that can be removed

## Plan
Breaking down the cleanup tasks into smaller, manageable steps:

1. Create appropriate subdirectories for organization
2. Move files to their appropriate locations
3. Remove unnecessary or duplicate files
4. Update any references to the moved files if needed
5. Document the changes and new organization structure

## Implementation Tasks

### 1. Create New Directories
- Create a `claude/` directory for Claude-related documentation files
- Create a `public/audio/` directory for audio files (if it doesn't already exist)

### 2. Move Documentation Files
- Move the following files to the `claude/` directory:
  - ARCHITECTURE.md
  - CRITICAL_BUG_REPORT.md
  - GAMEPLAY.md
  - REFACTORING.md
  - TESTING.md
  - key_elements.md
  - special_card_actions.md
  - puppeteer_limitations.md
- Keep CLAUDE.md in the root directory (as specified in the issue)

### 3. Move Media Files
- Move image files to the appropriate directory:
  - bandit.png → public/images/
  - bluey.png → public/images/
  - game-start.png → screenshots/
  - game-started.png → screenshots/
- Move audio files to the public/audio/ directory:
  - bingo.mp3 → public/audio/
  - bluey.mp3 → public/audio/
  - dad.mp3 → public/audio/

### 4. Move Test Files
- Move the following files to the tests/ directory:
  - bluey_game_test.js
  - test_bluey_uno.js
  - test_players.js
  - test_wild_draw4.js
  - test_wild_draw_four.js
  - run_wild_draw_four_test.js
  - run_wild_draw_four_test.sh

### 5. Remove Unnecessary Files
- Remove the following files:
  - index.html.bak (backup file)
  - TESTING.md.part13 (partial file)
  - TESTING_WILD_DRAW_FOUR.md (superseded)
  - WILD_DRAW_FOUR_FIXES.md (implemented)
  - WILD_DRAW_FOUR_TEST.md (implemented)
  - images_fix.md (resolved)

### 6. Update References (if needed)
- Check for any references to moved files and update them

### 7. Documentation
- Update README.md to reflect the new organization structure

## PR Link
(To be added once PR is created)