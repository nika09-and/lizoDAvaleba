const N = 3;
const row = [0, 0, -1, 1];
const col = [-1, 1, 0, 0];
const goal = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];

function isGoalState(board) {
  return JSON.stringify(board) === JSON.stringify(goal);
}

function isValid(x, y) {
  return x >= 0 && x < N && y >= 0 && y < N;
}

function cloneBoard(board) {
  return board.map(r => [...r]);
}

function boardToString(board) {
  return board.map(row => row.join(' ')).join('\n');
}

function findZero(board) {
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      if (board[i][j] === 0) return [i, j];
}

// ---------- DFS ----------
function solveDFS(board, x, y, visited, depth, path, maxDepth) {
  if (depth > maxDepth) return false;
  const key = JSON.stringify(board);
  if (visited.has(key)) return false;
  visited.add(key);
  path.push(cloneBoard(board));

  if (isGoalState(board)) return true;

  for (let i = 0; i < 4; i++) {
    const newX = x + row[i];
    const newY = y + col[i];

    if (isValid(newX, newY)) {
      const newBoard = cloneBoard(board);
      [newBoard[x][y], newBoard[newX][newY]] = [newBoard[newX][newY], newBoard[x][y]];
      if (solveDFS(newBoard, newX, newY, visited, depth + 1, path, maxDepth)) return true;
    }
  }

  path.pop(); // backtrack
  return false;
}

function runDFS() {
  const start = [[1, 2, 3], [4, 0, 5], [6, 7, 8]];
  const [x, y] = findZero(start);
  const visited = new Set();
  const path = [];

  const success = solveDFS(start, x, y, visited, 0, path, 50);
  const output = document.getElementById('output');
  output.textContent = "Solving with DFS...\n\n" + (
    success
      ? path.map((b, i) => `Step ${i}:\n${boardToString(b)}`).join('\n\n')
      : "No solution found (or max depth exceeded)"
  );
}

// ---------- A* ----------
class Node {
  constructor(board, x, y, depth, cost, parent = null) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.depth = depth;
    this.cost = cost;
    this.parent = parent;
  }
}

function manhattanDistance(board) {
  let dist = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const val = board[i][j];
      if (val === 0) continue;
      const goalX = Math.floor((val - 1) / N);
      const goalY = (val - 1) % N;
      dist += Math.abs(i - goalX) + Math.abs(j - goalY);
    }
  }
  return dist;
}

function solveAStar(start, x, y) {
  const open = [];
  const visited = new Set();
  const root = new Node(start, x, y, 0, manhattanDistance(start));
  open.push(root);

  while (open.length > 0) {
    open.sort((a, b) => (a.depth + a.cost) - (b.depth + b.cost));
    const curr = open.shift();

    const key = JSON.stringify(curr.board);
    if (visited.has(key)) continue;
    visited.add(key);

    if (isGoalState(curr.board)) {
      const path = [];
      let node = curr;
      while (node) {
        path.unshift(node.board);
        node = node.parent;
      }
      return path;
    }

    for (let i = 0; i < 4; i++) {
      const newX = curr.x + row[i];
      const newY = curr.y + col[i];

      if (isValid(newX, newY)) {
        const newBoard = cloneBoard(curr.board);
        [newBoard[curr.x][curr.y], newBoard[newX][newY]] = [newBoard[newX][newY], newBoard[curr.x][curr.y]];
        const cost = manhattanDistance(newBoard);
        const child = new Node(newBoard, newX, newY, curr.depth + 1, cost, curr);
        open.push(child);
      }
    }
  }

  return null;
}

function runAStar() {
  const start = [[1, 2, 3], [4, 0, 5], [6, 7, 8]];
  const [x, y] = findZero(start);
  const path = solveAStar(start, x, y);

  const output = document.getElementById('output');
  output.textContent = "Solving with A*...\n\n" + (
    path
      ? path.map((b, i) => `Step ${i}:\n${boardToString(b)}`).join('\n\n')
      : "No solution found"
  );
}
