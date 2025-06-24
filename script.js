const SIZE = 9;
const board = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
let rowMasks = new Array(SIZE).fill(0);
let colMasks = new Array(SIZE).fill(0);
let boxMasks = new Array(SIZE).fill(0);
let timerInterval;
let startTime;
let solvedBoard = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
let emptyCells = 0;
let difficulty = 'easy';

// Initialize the board
function initBoard() {
  createBoardUI();
  document.querySelectorAll('#sudoku-board input').forEach(input => {
    input.addEventListener('input', validateInput);
    input.addEventListener('focus', clearError);
  });
}

function validateInput(e) {
  const input = e.target;
  input.value = input.value.replace(/[^1-9]/g, '');
  input.classList.remove('invalid');
  if (input.value) {
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const num = parseInt(input.value);
    if (solvedBoard[row][col] === num && board[row][col] === num) return;
    if (!isValidPlacement(row, col, num)) {
      input.classList.add('invalid');
      showError(`Number ${num} is repeated in row, column or 3x3 block!`);
    }
  }
  updatePerformance();
}

function clearError() {
  document.getElementById('error-message').textContent = '';
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
}

function boxIndex(i, j) {
  return Math.floor(i / 3) * 3 + Math.floor(j / 3);
}

function isSafe(i, j, num) {
  const mask = 1 << num;
  return !(rowMasks[i] & mask || colMasks[j] & mask || boxMasks[boxIndex(i, j)] & mask);
}

function placeNumber(i, j, num) {
  const mask = 1 << num;
  board[i][j] = num;
  rowMasks[i] |= mask;
  colMasks[j] |= mask;
  boxMasks[boxIndex(i, j)] |= mask;
}

function removeNumber(i, j, num) {
  const mask = ~(1 << num);
  board[i][j] = 0;
  rowMasks[i] &= mask;
  colMasks[j] &= mask;
  boxMasks[boxIndex(i, j)] &= mask;
}

function solveSudoku(i = 0, j = 0) {
  if (i === SIZE) return true;
  const [nextI, nextJ] = j === SIZE - 1 ? [i + 1, 0] : [i, j + 1];
  if (board[i][j] !== 0) return solveSudoku(nextI, nextJ);
  for (let num = 1; num <= 9; num++) {
    if (isSafe(i, j, num)) {
      placeNumber(i, j, num);
      if (solveSudoku(nextI, nextJ)) return true;
      removeNumber(i, j, num);
    }
  }
  return false;
}

function createBoardUI() {
  const boardDiv = document.getElementById("sudoku-board");
  boardDiv.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "1");
    input.dataset.row = Math.floor(i / 9);
    input.dataset.col = i % 9;
    boardDiv.appendChild(input);
  }
}

function readUIToBoard() {
  const cells = document.querySelectorAll("#sudoku-board input");
  rowMasks.fill(0);
  colMasks.fill(0);
  boxMasks.fill(0);
  emptyCells = 0;
  cells.forEach((cell, idx) => {
    const val = parseInt(cell.value) || 0;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    board[row][col] = val;
    if (val !== 0) {
      placeNumber(row, col, val);
    } else {
      emptyCells++;
    }
  });
}

function loadBoardToUI() {
  const cells = document.querySelectorAll("#sudoku-board input");
  cells.forEach((cell, idx) => {
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    cell.value = board[row][col] === 0 ? "" : board[row][col];
    if (solvedBoard[row][col] === board[row][col] && board[row][col] !== 0) {
      cell.style.fontWeight = 'bold';
      cell.style.color = '#2980b9';
    } else {
      cell.style.fontWeight = 'normal';
      cell.style.color = 'black';
    }
    cell.classList.remove('invalid');
  });
  updatePerformance();
}

function solve() {
  readUIToBoard();
  if (solveSudoku()) {
    for (let i = 0; i < SIZE; i++) {
      solvedBoard[i] = [...board[i]];
    }
    loadBoardToUI();
    clearInterval(timerInterval);
    updatePerformance();
    showError("Puzzle solved successfully!");
  } else {
    showError("No solution found!");
  }
}

function generateFullBoard() {
  for (let i = 0; i < SIZE; i++) {
    board[i] = new Array(SIZE).fill(0);
  }
  rowMasks.fill(0);
  colMasks.fill(0);
  boxMasks.fill(0);
  const success = solveSudoku();
  if (!success) {
    showError("Failed to generate a valid Sudoku puzzle!");
    return;
  }
  for (let i = 0; i < SIZE; i++) {
    solvedBoard[i] = [...board[i]];
  }
}

function removeCellsForDifficulty() {
  let clues;
  switch(difficulty) {
    case 'easy': clues = 40; break;
    case 'medium': clues = 30; break;
    case 'hard': clues = 20; break;
    default: clues = 30;
  }
  let positions = Array.from({ length: 81 }, (_, i) => i);
  let cellsToRemove = 81 - clues;
  while (cellsToRemove--) {
    const idx = Math.floor(Math.random() * positions.length);
    const pos = positions.splice(idx, 1)[0];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    board[row][col] = 0;
  }
  emptyCells = 81 - clues;
}

function generate() {
  difficulty = document.getElementById("difficulty").value;
  generateFullBoard();
  removeCellsForDifficulty();
  loadBoardToUI();
  startTimer();
  updatePerformance();
  showError("");
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById("time").innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    updatePerformance();
  }, 1000);
}

function giveHint() {
  const cells = document.querySelectorAll("#sudoku-board input");
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].value === "") {
      const row = parseInt(cells[i].dataset.row);
      const col = parseInt(cells[i].dataset.col);
      const possibleNumbers = getPossibleNumbers(row, col);
      if (possibleNumbers.length === 1) {
        cells[i].value = possibleNumbers[0];
        cells[i].style.color = "#27ae60";
        return;
      }
    }
  }
  for (let i = 0; i < cells.length; i++) {
    if (cells[i].value === "") {
      const row = parseInt(cells[i].dataset.row);
      const col = parseInt(cells[i].dataset.col);
      if (solvedBoard[row][col]) {
        cells[i].value = solvedBoard[row][col];
        cells[i].style.color = "#27ae60";
        return;
      }
    }
  }
  showError("No hints available or puzzle might be complete!");
}

function getPossibleNumbers(row, col) {
  const possible = [];
  for (let num = 1; num <= 9; num++) {
    if (isSafe(row, col, num)) {
      possible.push(num);
    }
  }
  return possible;
}

function checkErrors() {
  const cells = document.querySelectorAll("#sudoku-board input");
  let hasErrors = false;
  cells.forEach(cell => {
    if (cell.value) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const num = parseInt(cell.value);
      if (!isValidPlacement(row, col, num)) {
        cell.classList.add('invalid');
        hasErrors = true;
      }
    }
  });
  if (hasErrors) {
    showError("There are invalid numbers in the puzzle!");
  } else {
    showError("No errors found!");
  }
  return hasErrors;
}

function isValidPlacement(row, col, num) {
  if (solvedBoard[row][col] === num && board[row][col] === num) return true;
  for (let j = 0; j < SIZE; j++) {
    if (j !== col && board[row][j] === num) return false;
  }
  for (let i = 0; i < SIZE; i++) {
    if (i !== row && board[i][col] === num) return false;
  }
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let i = boxStartRow; i < boxStartRow + 3; i++) {
    for (let j = boxStartCol; j < boxStartCol + 3; j++) {
      if (i !== row && j !== col && board[i][j] === num) return false;
    }
  }
  return true;
}

function updatePerformance() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000) || 1;
  const cells = document.querySelectorAll("#sudoku-board input");
  let correctCells = 0;
  let incorrectCells = 0;
  cells.forEach(cell => {
    if (cell.value) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      if (solvedBoard[row][col] === parseInt(cell.value)) {
        correctCells++;
      } else {
        incorrectCells++;
      }
    }
  });
  const progress = Math.floor((correctCells / (81 - emptyCells)) * 100) || 0;
  const speedScore = Math.max(0, 100 - Math.floor(elapsed / 5));
  /* ---- IQ estimate: rises with progress, falls with time --------- */
const baseIQ  = { easy: 80,  medium: 80, hard: 80 };   // starting point
const rangeIQ = { easy: 20,  medium: 25,  hard: 30  };   // max bonus

const decayRate = {        // IQ loss per second
  easy:   1 / 20,          // -1 every 20 s
  medium: 1 / 30,          // -1 every 30 s
  hard:   1 / 45           // -1 every 45 s
};

const bonus      = (progress / 100) * rangeIQ[difficulty];     // +0…20/25/30
const timeLoss   = elapsed * decayRate[difficulty];            // -loss over time
let   iqEstimate = baseIQ[difficulty] + bonus - timeLoss;

iqEstimate = Math.max(baseIQ[difficulty], Math.round(iqEstimate));

  document.getElementById("performance-text").innerHTML = `
    <p><strong>Correct:</strong> ${correctCells}</p>
    <p><strong>Incorrect:</strong> ${incorrectCells}</p>
    <p><strong>IQ Estimate:</strong> ${Math.round(iqEstimate)}</p>
  `;
}

// Initialize the board when the page loads
window.onload = initBoard;
