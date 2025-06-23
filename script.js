const board = [];
const SIZE = 9;
let rowMasks = new Array(9).fill(0);
let colMasks = new Array(9).fill(0);
let boxMasks = new Array(9).fill(0);

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

function loadBoardToUI() {
  const cells = document.querySelectorAll("#sudoku-board input");
  cells.forEach((cell, idx) => {
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    cell.value = board[row][col] === 0 ? "" : board[row][col];
  });
}

function readUIToBoard() {
  const cells = document.querySelectorAll("#sudoku-board input");
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const val = parseInt(cells[i * 9 + j].value) || 0;
      board[i][j] = val;
    }
  }

  // Reset bitmasks
  rowMasks.fill(0);
  colMasks.fill(0);
  boxMasks.fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] !== 0) {
        placeNumber(i, j, board[i][j]);
      }
    }
  }
}

function solve() {
  readUIToBoard();
  const start = performance.now();
  const solved = solveSudoku();
  const end = performance.now();

  const time = (end - start).toFixed(2);
  document.getElementById("metrics").innerText = solved
    ? `✅ Solved in ${time} ms`
    : "❌ No solution found";

  loadBoardToUI();
}

function createBoardUI() {
  const boardDiv = document.getElementById("sudoku-board");
  boardDiv.innerHTML = "";
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "1");
    input.oninput = () => {
      input.value = input.value.replace(/[^1-9]/g, '');
    };
    boardDiv.appendChild(input);
  }
}

function generateFullBoard() {
  for (let i = 0; i < SIZE; i++) {
    board[i] = new Array(SIZE).fill(0);
  }
  rowMasks.fill(0);
  colMasks.fill(0);
  boxMasks.fill(0);
  solveSudoku();
}

function removeCellsForDifficulty(level) {
  let clues;
  if (level === "easy") clues = 40;
  else if (level === "medium") clues = 30;
  else clues = 20;

  const positions = Array.from({ length: 81 }, (_, i) => i);
  while (positions.length > clues) {
    const idx = Math.floor(Math.random() * positions.length);
    const pos = positions.splice(idx, 1)[0];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    board[row][col] = 0;
  }
}

function generate() {
  generateFullBoard();
  const level = document.getElementById("difficulty").value;
  removeCellsForDifficulty(level);
  loadBoardToUI();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

createBoardUI();

