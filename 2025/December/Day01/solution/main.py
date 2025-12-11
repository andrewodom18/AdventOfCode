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


def main():
    total_start = time.time()

    file_path = sys.argv[1] if len(sys.argv) > 1 else "data/input.csv"
    input_file = Path(file_path)

    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {file_path}")

    dial = 50
    part1_zero_count = 0
    part2_zero_count = 0

    processing_start = time.time()

    with input_file.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            direction = line[0]
            distance = int(line[1:])

            if direction == "L":
                hits = count_zero_clicks_left(dial, distance)
            elif direction == "R":
                hits = count_zero_clicks_right(dial, distance)
            else:
                raise ValueError(f"Invalid direction: {direction}")

            part2_zero_count += hits

            # Move the dial
            if direction == "L":
                dial -= distance
            else:
                dial += distance

            dial %= 100
            if dial < 0:
                dial += 100

            if dial == 0:
                part1_zero_count += 1

    processing_time = int((processing_start - time.time()) * -1000)
    total_time = int((total_start - time.time()) * -1000)

    print("\n========= Answers =========")
    print(f"Part 1 password: {part1_zero_count}")
    print(f"Part 2 password: {part2_zero_count}")

    print("\n========= Timings =========")
    print(f"Processing time: {processing_time} ms")
    print(f"Total runtime: {total_time} ms\n")


if __name__ == "__main__":
    main()
