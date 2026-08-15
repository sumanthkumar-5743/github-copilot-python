// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let solution = [];
let currentDifficulty = 'medium';
let hintsUsed = 0;
let hintedCells = new Set();
let currentGameTime = 0;
const LEADERBOARD_KEY = 'sudoku_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;
const THEME_KEY = 'sudoku_theme';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

// Timer state
let timerStartTime = null;
let timerIntervalId = null;
let timerStopped = false;

// Theme management
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || LIGHT_THEME;
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeToggleIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || LIGHT_THEME;
  const newTheme = currentTheme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
  applyTheme(newTheme);
}

function updateThemeToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.innerHTML = theme === DARK_THEME ? '☀️' : '🌙';
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
  if (timerStartTime === null || timerStopped) return;
  const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
  document.getElementById('timer-display').innerText = `Time: ${formatTime(elapsed)}`;
}

function startTimer() {
  timerStartTime = Date.now();
  timerStopped = false;
  if (timerIntervalId) clearInterval(timerIntervalId);
  timerIntervalId = setInterval(updateTimerDisplay, 100);
  updateTimerDisplay();
}

function stopTimer() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  timerStopped = true;
}

function getConflictingCells(row, col, value) {
  const conflictingCells = [];
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  
  if (!value || value === '0') return conflictingCells;
  
  const numValue = parseInt(value, 10);
  
  // Check row
  for (let j = 0; j < SIZE; j++) {
    if (j !== col) {
      const idx = row * SIZE + j;
      const inp = inputs[idx];
      if (inp.value === value && !inp.disabled) {
        conflictingCells.push(idx);
      }
    }
  }
  
  // Check column
  for (let i = 0; i < SIZE; i++) {
    if (i !== row) {
      const idx = i * SIZE + col;
      const inp = inputs[idx];
      if (inp.value === value && !inp.disabled) {
        conflictingCells.push(idx);
      }
    }
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3);
  const boxCol = Math.floor(col / 3);
  const startRow = boxRow * 3;
  const startCol = boxCol * 3;
  
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (i !== row || j !== col) {
        const idx = i * SIZE + j;
        const inp = inputs[idx];
        if (inp.value === value && !inp.disabled) {
          conflictingCells.push(idx);
        }
      }
    }
  }
  
  return conflictingCells;
}

function updateCellConflicts(row, col) {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const idx = row * SIZE + col;
  const inp = inputs[idx];
  const value = inp.value;
  
  // Clear all invalid-entry classes
  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].disabled && !inputs[i].classList.contains('hinted')) {
      inputs[i].classList.remove('invalid-entry');
    }
  }
  
  if (!value) return;
  
  // Find and highlight conflicts
  const conflicts = getConflictingCells(row, col, value);
  conflicts.forEach(conflictIdx => {
    inputs[conflictIdx].classList.add('invalid-entry');
  });
  
  // Highlight the current cell if it has conflicts
  if (conflicts.length > 0) {
    inp.classList.add('invalid-entry');
  }
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      const boxRow = Math.floor(i / 3);
      const boxCol = Math.floor(j / 3);
      const shouldShade = (boxRow + boxCol) % 2 === 0;
      input.className = shouldShade ? 'sudoku-cell box-shade' : 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        const row = parseInt(e.target.dataset.row, 10);
        const col = parseInt(e.target.dataset.col, 10);
        updateCellConflicts(row, col);
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz, sol) {
  puzzle = puz;
  solution = sol;
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  const res = await fetch(`/new?difficulty=${currentDifficulty}`);
  const data = await res.json();
  renderPuzzle(data.puzzle, data.solution);
  document.getElementById('message').innerText = '';
  hintsUsed = 0;
  hintedCells.clear();
  updateHintCounter();
  startTimer();
}

function updateHintCounter() {
  document.getElementById('hint-counter').innerText = `Hints Used: ${hintsUsed}`;
}

function provideHint() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  
  // Find empty cells that haven't been hinted yet
  const emptyCells = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const inp = inputs[idx];
      const cellKey = `${i},${j}`;
      // Find cells that are empty and not hinted
      if (inp.value === '' && !hintedCells.has(cellKey) && !inp.disabled) {
        emptyCells.push({ row: i, col: j, idx: idx, input: inp });
      }
    }
  }
  
  if (emptyCells.length === 0) {
    document.getElementById('message').innerText = 'No more hints available!';
    document.getElementById('message').style.color = '#ff9800';
    return;
  }
  
  // Pick a random empty cell
  const hint = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const correctValue = solution[hint.row][hint.col];
  
  // Fill in the hint
  hint.input.value = correctValue;
  hint.input.disabled = true;
  const boxRow = Math.floor(hint.row / 3);
  const boxCol = Math.floor(hint.col / 3);
  const hasBoxShade = (boxRow + boxCol) % 2 === 0;
  const baseClass = hasBoxShade ? 'sudoku-cell box-shade' : 'sudoku-cell';
  hint.input.className = baseClass + ' hinted';
  
  // Track the hinted cell
  const cellKey = `${hint.row},${hint.col}`;
  hintedCells.add(cellKey);
  hintsUsed++;
  updateHintCounter();
}

function checkPuzzle() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const msg = document.getElementById('message');
  
  let filledCells = 0;
  let correctCells = 0;
  let incorrectCells = [];
  
  // Check each filled cell against the solution
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const inp = inputs[idx];
      const userValue = inp.value ? parseInt(inp.value, 10) : 0;
      
      // Only check cells that user has filled (not prefilled and not empty)
      if (userValue !== 0 && !inp.disabled) {
        filledCells++;
        const correctValue = solution[i][j];
        
        if (userValue === correctValue) {
          correctCells++;
        } else {
          incorrectCells.push({idx, row: i, col: j});
        }
      }
    }
  }
  
  // Reset all non-disabled cells to their base classes (preserve box-shade)
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const inp = inputs[idx];
      if (inp.disabled) continue;
      
      const boxRow = Math.floor(i / 3);
      const boxCol = Math.floor(j / 3);
      const hasBoxShade = (boxRow + boxCol) % 2 === 0;
      const baseClass = hasBoxShade ? 'sudoku-cell box-shade' : 'sudoku-cell';
      inp.className = baseClass;
    }
  }
  
  // Highlight incorrect cells
  incorrectCells.forEach(({idx, row, col}) => {
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    const hasBoxShade = (boxRow + boxCol) % 2 === 0;
    const baseClass = hasBoxShade ? 'sudoku-cell box-shade' : 'sudoku-cell';
    inputs[idx].className = baseClass + ' incorrect';
  });
  
  // Provide feedback
  if (filledCells === 0) {
    msg.style.color = '#ff9800';
    msg.innerText = 'Please fill in some cells first.';
  } else if (incorrectCells.length === 0) {
    msg.style.color = '#388e3c';
    msg.innerText = `Perfect! All ${filledCells} filled cells are correct.`;
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = `${correctCells} correct, ${incorrectCells.length} incorrect out of ${filledCells} filled cells.`;
  }
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();
  const msg = document.getElementById('message');
  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map(x => x[0]*SIZE + x[1]));
  
  // Reset all non-disabled cells to their base classes (preserve box-shade)
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const inp = inputs[idx];
      if (inp.disabled) continue;
      
      const boxRow = Math.floor(i / 3);
      const boxCol = Math.floor(j / 3);
      const hasBoxShade = (boxRow + boxCol) % 2 === 0;
      const baseClass = hasBoxShade ? 'sudoku-cell box-shade' : 'sudoku-cell';
      inp.className = baseClass;
      if (incorrect.has(idx)) {
        inp.className = baseClass + ' incorrect';
      }
    }
  }
  if (incorrect.size === 0) {
    msg.style.color = '#388e3c';
    msg.innerText = 'Congratulations! You solved it!';
    stopTimer();
    currentGameTime = Math.floor((Date.now() - timerStartTime) / 1000);
    showNameModal();
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'Some cells are incorrect.';
  }
}

function getLeaderboardFromStorage() {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
}

function saveScoreToLeaderboard(playerName, time, hints, difficulty) {
  const leaderboard = getLeaderboardFromStorage();
  
  // Add new score
  leaderboard.push({
    name: playerName,
    time: time,
    hints: hints,
    difficulty: difficulty,
    timestamp: Date.now()
  });
  
  // Sort by time (ascending - lower is better), then by hints (ascending)
  leaderboard.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return a.hints - b.hints;
  });
  
  // Keep only top MAX_LEADERBOARD_ENTRIES
  const topScores = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
  
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboard = getLeaderboardFromStorage();
  const tbody = document.getElementById('leaderboard-body');
  
  if (leaderboard.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No scores yet. Complete a puzzle to join the leaderboard!</td></tr>';
    return;
  }
  
  tbody.innerHTML = leaderboard.map((entry, index) => {
    const displayDifficulty = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);
    return `<tr>
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${formatTime(entry.time)}</td>
      <td>${entry.hints}</td>
      <td>${displayDifficulty}</td>
    </tr>`;
  }).join('');
}

function showNameModal() {
  const modal = document.getElementById('name-modal');
  const input = document.getElementById('player-name-input');
  modal.style.display = 'block';
  input.focus();
  input.value = '';
}

function hideNameModal() {
  const modal = document.getElementById('name-modal');
  modal.style.display = 'none';
}

// Wire buttons
window.addEventListener('load', () => {
  // Initialize theme first
  initializeTheme();
  
  // Wire theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('hint').addEventListener('click', provideHint);
  document.getElementById('check-puzzle').addEventListener('click', checkPuzzle);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  
  // Wire difficulty selector
  const difficultyBtns = document.querySelectorAll('.difficulty-btn');
  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all buttons
      difficultyBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      e.target.classList.add('active');
      // Update current difficulty and start new game
      currentDifficulty = e.target.dataset.difficulty;
      newGame();
    });
  });
  
  // Wire modal buttons
  document.getElementById('save-score-btn').addEventListener('click', () => {
    const playerName = document.getElementById('player-name-input').value.trim();
    if (playerName) {
      saveScoreToLeaderboard(playerName, currentGameTime, hintsUsed, currentDifficulty);
      hideNameModal();
    } else {
      alert('Please enter your name');
    }
  });
  
  document.getElementById('skip-score-btn').addEventListener('click', () => {
    hideNameModal();
  });
  
  // Allow Enter key to save score
  document.getElementById('player-name-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('save-score-btn').click();
    }
  });
  
  // Load leaderboard on page load
  displayLeaderboard();
  
  // initialize
  newGame();
});