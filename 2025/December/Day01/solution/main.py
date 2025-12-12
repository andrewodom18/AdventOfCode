import sys
import time
from pathlib import Path


def count_zero_clicks_right(start: int, distance: int) -> int:
    """Counts how many times the dial lands on 0 when moving right."""
    s = start % 100
    steps_to_zero = 100 if s == 0 else 100 - s
    if distance < steps_to_zero:
        return 0
    return 1 + (distance - steps_to_zero) // 100


def count_zero_clicks_left(start: int, distance: int) -> int:
    """Counts how many times the dial lands on 0 when moving left."""
    s = start % 100
    steps_to_zero = 100 if s == 0 else s
    if distance < steps_to_zero:
        return 0
    return 1 + (distance - steps_to_zero) // 100


def measure_ms(fn):
    start = time.perf_counter()
    result = fn()
    return int((time.perf_counter() - start) * 1000), result


def main():
    total_start = time.perf_counter()

    file_path = sys.argv[1] if len(sys.argv) > 1 else "data/input.csv"
    input_file = Path(file_path)

    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {file_path}")

    instructions = []
    with input_file.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            direction = line[0]
            distance = int(line[1:])
            if direction not in {"L", "R"}:
                raise ValueError(f"Invalid direction: {direction}")
            instructions.append((direction, distance))

    def solve_part1():
        dial = 50
        count = 0
        for direction, distance in instructions:
            dial = dial - distance if direction == "L" else dial + distance
            dial %= 100
            if dial < 0:
                dial += 100
            if dial == 0:
                count += 1
        return count

    def solve_part2():
        dial = 50
        hits_total = 0
        for direction, distance in instructions:
            if direction == "L":
                hits = count_zero_clicks_left(dial, distance)
                dial -= distance
            elif direction == "R":
                hits = count_zero_clicks_right(dial, distance)
                dial += distance
            else:
                raise ValueError(f"Invalid direction: {direction}")

            hits_total += hits
            dial %= 100
            if dial < 0:
                dial += 100
        return hits_total

    part1_time, part1_zero_count = measure_ms(solve_part1)
    part2_time, part2_zero_count = measure_ms(solve_part2)
    processing_time = part1_time + part2_time
    total_time = int((time.perf_counter() - total_start) * 1000)

    print("\n========= Answers =========")
    print(f"Part 1: {part1_zero_count}")
    print(f"Part 2: {part2_zero_count}")

    print("\n========= Timings =========")
    print(f"Part 1 Time: {part1_time} ms")
    print(f"Part 2 Time: {part2_time} ms")
    print(f"Processing Time: {processing_time} ms")
    print(f"\nTotal Runtime: {total_time} ms\n")


if __name__ == "__main__":
    main()
