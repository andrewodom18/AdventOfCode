import sys
import os
import time
from collections import deque


def main():
    total_start = time.perf_counter()

    file_path = sys.argv[1] if len(sys.argv) > 1 else "data/input.txt"

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Input file not found: {file_path}")

    # Read grid once
    with open(file_path, "r", encoding="utf-8") as f:
        grid = [list(line.rstrip("\n")) for line in f]

    rows = len(grid)
    columns = len(grid[0])

    # Directions for 8 neighbors (row, col pairs)
    directions = [-1, -1, -1, 0, -1, 1, 0, -1, 0, 1, 1, -1, 1, 0, 1, 1]

    # Part 1
    part1_start = time.perf_counter()
    count = 0

    for row in range(rows):
        for col in range(columns):
            if grid[row][col] != "@":
                continue

            neighbors = 0
            i = 0
            while i < len(directions):
                nr = row + directions[i]
                nc = col + directions[i + 1]

                if 0 <= nr < rows and 0 <= nc < columns and grid[nr][nc] == "@":
                    neighbors += 1
                i += 2

            if neighbors < 4:
                count += 1

    part1 = count
    part1_time = int((time.perf_counter() - part1_start) * 1000)

    # Part 2
    part2_start = time.perf_counter()

    # Copy of grid so it is editable
    mutable_grid = [row.copy() for row in grid]

    # Neighbor count grid
    neighbor_count = [[0] * columns for _ in range(rows)]

    def compute_neighbors(r, c):
        cnt = 0
        i = 0
        while i < len(directions):
            nr = r + directions[i]
            nc = c + directions[i + 1]
            if 0 <= nr < rows and 0 <= nc < columns and mutable_grid[nr][nc] == "@":
                cnt += 1
            i += 2
        return cnt

    # Initialize neighbor counts
    for r in range(rows):
        for c in range(columns):
            if mutable_grid[r][c] == "@":
                neighbor_count[r][c] = compute_neighbors(r, c)

    removed_total = 0
    queue = deque()

    # Store initially accessible paper rolls
    for r in range(rows):
        for c in range(columns):
            if mutable_grid[r][c] == "@" and neighbor_count[r][c] < 4:
                queue.append((r, c))

    # Iterative removal
    while queue:
        next_queue = deque()

        for r, c in queue:
            if mutable_grid[r][c] != "@":
                continue

            # Remove paper roll
            mutable_grid[r][c] = "."
            removed_total += 1

            # Update neighbors
            i = 0
            while i < len(directions):
                nr = r + directions[i]
                nc = c + directions[i + 1]

                if 0 <= nr < rows and 0 <= nc < columns and mutable_grid[nr][nc] == "@":
                    neighbor_count[nr][nc] -= 1

                    # If it just became accessible
                    if neighbor_count[nr][nc] == 3:
                        next_queue.append((nr, nc))
                i += 2

        queue = next_queue

    part2 = removed_total
    part2_time = int((time.perf_counter() - part2_start) * 1000)

    print("\n========= Answers =========")
    print(f"Part 1: {part1}")
    print(f"Part 2: {part2}")

    print("\n========= Timings =========")
    print(f"Part 1 Time: {part1_time}ms")
    print(f"Part 2 Time: {part2_time}ms")

    total_time = int((time.perf_counter() - total_start) * 1000)
    print(f"\nTotal Runtime: {total_time} ms\n")


if __name__ == "__main__":
    main()
