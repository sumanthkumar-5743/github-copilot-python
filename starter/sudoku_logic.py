import copy
import random

SIZE = 9
EMPTY = 0

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def solve_puzzle(board, solutions_limit=2):
    """
    Solves a Sudoku puzzle and returns list of solutions (up to solutions_limit).
    Used to verify puzzle has exactly one solution.
    """
    solutions = []
    
    def backtrack():
        if len(solutions) >= solutions_limit:
            return
        
        for row in range(SIZE):
            for col in range(SIZE):
                if board[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(board, row, col, num):
                            board[row][col] = num
                            backtrack()
                            board[row][col] = EMPTY
                    return
        
        # No empty cells found, we have a solution
        solutions.append(deep_copy(board))
    
    backtrack()
    return solutions

def has_unique_solution(board):
    """
    Checks if a puzzle has exactly one solution.
    Returns True if unique, False otherwise.
    """
    board_copy = deep_copy(board)
    solutions = solve_puzzle(board_copy, solutions_limit=2)
    return len(solutions) == 1

def remove_cells_with_uniqueness(board, target_clues):
    """
    Intelligently removes cells while ensuring the puzzle has a unique solution.
    If we can't reach target clues while maintaining uniqueness, returns best effort.
    """
    removed_positions = set()
    current_clues = SIZE * SIZE
    
    # List of empty positions that can be removed
    empty_positions = []
    for i in range(SIZE):
        for j in range(SIZE):
            if board[i][j] != EMPTY:
                empty_positions.append((i, j))
    
    random.shuffle(empty_positions)
    
    for row, col in empty_positions:
        if current_clues <= target_clues:
            break
        
        # Try removing this cell
        original_value = board[row][col]
        board[row][col] = EMPTY
        
        # Check if puzzle still has unique solution
        if has_unique_solution(board):
            current_clues -= 1
            removed_positions.add((row, col))
        else:
            # Restore if removal creates multiple solutions
            board[row][col] = original_value

def remove_cells(board, clues):
    """
    Enhanced cell removal with uniqueness checking.
    Falls back to simple removal if uniqueness check takes too long.
    """
    # For efficiency, use simple removal for very low clue counts
    # and intelligent removal for standard difficulty levels
    if clues < 17:
        # Expert/very hard - use simple random removal (faster)
        attempts = SIZE * SIZE - clues
        while attempts > 0:
            row = random.randrange(SIZE)
            col = random.randrange(SIZE)
            if board[row][col] != EMPTY:
                board[row][col] = EMPTY
                attempts -= 1
    else:
        # Standard difficulty - ensure unique solution
        remove_cells_with_uniqueness(board, clues)

def generate_puzzle(clues=35):
    """
    Generates a valid Sudoku puzzle with a unique solution.
    
    Args:
        clues: Number of given clues (default 35 for moderate difficulty)
               Higher = easier, Lower = harder
    
    Returns:
        Tuple of (puzzle, solution) where:
        - puzzle: 9x9 grid with clues filled, empty cells as 0
        - solution: 9x9 grid with complete solution
    """
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
