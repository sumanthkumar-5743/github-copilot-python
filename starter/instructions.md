# Sudoku Flask Project Instructions

## Project Overview

This project is a modern Sudoku web application built with Python and Flask. The application generates Sudoku puzzles, allows users to select difficulty levels, provides hints, checks solutions, tracks solving time, and maintains a Top 10 leaderboard using browser localStorage.

The application must remain functional on desktop and mobile devices.

## Tech Stack

* Backend: Python 3
* Web framework: Flask
* Frontend: HTML5
* Styling: CSS
* Client-side functionality: Vanilla JavaScript
* Browser persistence: localStorage
* No frontend frameworks are required.

## Project Structure

* `app.py` contains the Flask application and server-side Sudoku logic.
* `templates/` contains HTML templates.
* `static/` contains CSS and JavaScript assets.
* `instructions.md` contains project-specific instructions for GitHub Copilot.

## Coding Conventions

* Use clear and descriptive names for variables and functions.
* Use `snake_case` for Python functions and variables.
* Use `camelCase` for JavaScript functions and variables.
* Keep functions small and focused on one responsibility.
* Add comments only where they help explain non-obvious logic.
* Handle errors gracefully and show useful feedback to the user.
* Do not introduce unnecessary external dependencies.
* Preserve existing functionality when adding new features.
* Avoid duplicated code whenever practical.

## Sudoku Rules

* The Sudoku board is a 9x9 grid.
* Each row must contain the numbers 1 through 9 without duplicates.
* Each column must contain the numbers 1 through 9 without duplicates.
* Each 3x3 box must contain the numbers 1 through 9 without duplicates.
* Empty cells may be represented internally as `0` when appropriate.
* Generated puzzles must have at least one valid solution.
* Generated puzzles must have exactly one unique solution.
* Puzzle generation and validation must use reliable Sudoku-solving logic such as backtracking.
* Prefilled puzzle cells must remain locked and must not be editable by the user.

## Difficulty Levels

The game must provide:

* Easy
* Medium
* Hard

Difficulty should change the number of prefilled cells while maintaining a valid puzzle with a unique solution.

## Input Validation

* User input must be validated immediately.
* Invalid values or conflicts must receive clear visual feedback.
* Conflicting cells should be highlighted without breaking the game.
* Invalid feedback must remain visible in both light and dark modes.
* Valid input should not be incorrectly marked as invalid.

## Game Features

The application should support:

* Sudoku puzzle generation
* Unique-solution validation
* Difficulty selection
* Timer
* Hint functionality
* Hint counter
* Check Puzzle functionality
* Immediate invalid-entry feedback
* Completion detection
* Congratulations message
* Player name entry
* Top 10 leaderboard
* localStorage persistence
* Dark Mode and Light Mode
* Responsive desktop and mobile layouts

## UI Requirements

* The Sudoku board must clearly show the 3x3 box boundaries.
* Alternating 3x3 boxes should use visually distinct background colors.
* Text and controls must have sufficient contrast.
* Buttons must be easy to identify and use.
* The interface must work on desktop, tablet, and mobile screens.
* Avoid layout shifts when the Sudoku board is rendered.
* Dark Mode must preserve readability and accessibility.

## Dark Mode

* Use CSS variables for theme colors where practical.
* Dark Mode must affect the entire application.
* The selected theme should be saved in localStorage.
* The theme should remain selected after refreshing the page.
* Do not use colors that make Sudoku values or error messages difficult to read.

## Leaderboard

Top 10 scores must be stored in browser localStorage.

Each score should contain:

* Player name
* Completion time
* Number of hints used
* Difficulty level

Scores should be sorted so that better completion times appear higher.

Do not use a server-side database unless explicitly required.

## What NOT To Do

* Do not remove existing working Sudoku functionality.
* Do not use jQuery or unnecessary JavaScript libraries.
* Do not introduce unnecessary frontend frameworks.
* Do not use global mutable state for data that should belong to an individual game.
* Do not hard-code a single Sudoku puzzle.
* Do not claim that a puzzle is unique without actually validating its uniqueness.
* Do not allow users to edit prefilled cells.
* Do not store sensitive personal information.
* Do not break the application when a user enters invalid input.