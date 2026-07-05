document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');

    // Standard Unicode Chess Pieces
    const PIECES = {
        'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
        'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟'
    };

    const INITIAL_BOARD = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];

    let board = [];
    let currentPlayer = 'w';
    let selectedSquare = null;
    let validMoves = [];

    function initializeGame() {
        board = INITIAL_BOARD.map(row => [...row]);
        currentPlayer = 'w';
        selectedSquare = null;
        validMoves = [];
        updateStatus();
        renderBoard();
    }

    function renderBoard() {
        boardElement.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const isLight = (row + col) % 2 === 0;
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const pieceId = board[row][col];
                if (pieceId) {
                    square.textContent = PIECES[pieceId];
                    square.classList.add(pieceId.startsWith('w') ? 'white-piece' : 'black-piece');
                }

                // Highlight selected square
                if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                    square.classList.add('selected');
                }

                // Highlight valid moves
                if (validMoves.some(move => move.r === row && move.c === col)) {
                    square.classList.add('valid-move');
                }

                square.addEventListener('click', () => handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }

    function handleSquareClick(row, col) {
        const clickedPiece = board[row][col];

        // If a square is already selected, try to move
        if (selectedSquare) {
            const isMoveValid = validMoves.some(move => move.r === row && move.c === col);

            if (isMoveValid) {
                // Move piece
                board[row][col] = board[selectedSquare.row][selectedSquare.col];
                board[selectedSquare.row][selectedSquare.col] = null;

                // Switch turn
                currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
                selectedSquare = null;
                validMoves = [];
                updateStatus();
                renderBoard();
                return;
            } else if (clickedPiece && clickedPiece.startsWith(currentPlayer)) {
                // Change selection to another own piece
                selectedSquare = { row, col };
                validMoves = calculateValidMoves(row, col, clickedPiece);
                renderBoard();
                return;
            } else {
                // Clicked elsewhere, deselect
                selectedSquare = null;
                validMoves = [];
                renderBoard();
                return;
            }
        }

        // If no square is selected, select it if it's the current player's piece
        if (clickedPiece && clickedPiece.startsWith(currentPlayer)) {
            selectedSquare = { row, col };
            validMoves = calculateValidMoves(row, col, clickedPiece);
            renderBoard();
        }
    }

    function calculateValidMoves(row, col, piece) {
        const moves = [];
        const type = piece[1];
        const color = piece[0];
        const opponentColor = color === 'w' ? 'b' : 'w';

        // Helper to check if a square is valid to move to (empty or enemy)
        const addMoveIfValid = (r, c) => {
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] === null) {
                    moves.push({ r, c });
                    return true; // continue
                } else if (board[r][c].startsWith(opponentColor)) {
                    moves.push({ r, c });
                    return false; // block further moves in this direction
                } else {
                    return false; // blocked by own piece
                }
            }
            return false; // out of bounds
        };

        const checkDirection = (dr, dc) => {
            let r = row + dr;
            let c = col + dc;
            while (addMoveIfValid(r, c)) {
                r += dr;
                c += dc;
            }
        };

        switch (type) {
            case 'P':
                const dir = color === 'w' ? -1 : 1;
                const startRow = color === 'w' ? 6 : 1;
                // Forward 1
                if (row + dir >= 0 && row + dir < 8 && board[row + dir][col] === null) {
                    moves.push({ r: row + dir, c: col });
                    // Forward 2 from start
                    if (row === startRow && board[row + 2 * dir][col] === null) {
                        moves.push({ r: row + 2 * dir, c: col });
                    }
                }
                // Captures
                if (row + dir >= 0 && row + dir < 8) {
                    if (col - 1 >= 0 && board[row + dir][col - 1] !== null && board[row + dir][col - 1].startsWith(opponentColor)) {
                        moves.push({ r: row + dir, c: col - 1 });
                    }
                    if (col + 1 < 8 && board[row + dir][col + 1] !== null && board[row + dir][col + 1].startsWith(opponentColor)) {
                        moves.push({ r: row + dir, c: col + 1 });
                    }
                }
                break;
            case 'R':
                checkDirection(1, 0); checkDirection(-1, 0);
                checkDirection(0, 1); checkDirection(0, -1);
                break;
            case 'N':
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                knightMoves.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
                break;
            case 'B':
                checkDirection(1, 1); checkDirection(-1, -1);
                checkDirection(1, -1); checkDirection(-1, 1);
                break;
            case 'Q':
                checkDirection(1, 0); checkDirection(-1, 0);
                checkDirection(0, 1); checkDirection(0, -1);
                checkDirection(1, 1); checkDirection(-1, -1);
                checkDirection(1, -1); checkDirection(-1, 1);
                break;
            case 'K':
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ];
                kingMoves.forEach(([dr, dc]) => addMoveIfValid(row + dr, col + dc));
                break;
        }

        return moves;
    }

    function updateStatus() {
        statusElement.textContent = `${currentPlayer === 'w' ? "White's" : "Black's"} Turn`;
    }

    resetBtn.addEventListener('click', initializeGame);

    // Start game
    initializeGame();
});
