import sys
import os
import time


def main():
    total_start = time.perf_counter()

    file_path = sys.argv[1] if len(sys.argv) > 1 else "data/input.csv"

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Input file not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        lines = [line.rstrip("\n") for line in f]

    merged = []

    # Find the blank line separating ranges and ingredient ids
    blank_index = next(i for i, line in enumerate(lines) if line.strip() == "")
    range_lines = lines[:blank_index]
    id_lines = lines[blank_index + 1 :]

    # Parse range lines (e.g. "3-5") into (3, 5)
    ranges = []
    for line in range_lines:
        a, b = line.split("-")
        ranges.append((int(a.strip()), int(b.strip())))

    # Sort ranges by starting value
    ranges_sorted = sorted(ranges, key=lambda x: x[0])

    # Prepare for merging
    cur_start, cur_end = ranges_sorted[0]

    part1 = 0
    part2 = 0

    # Part 1
    part1_start = time.perf_counter()

    for id_line in id_lines:
        id_val = int(id_line)
        if any(start <= id_val <= end for start, end in ranges):
            part1 += 1

    part1_time = int((time.perf_counter() - part1_start) * 1000)

    # Part 2
    part2_start = time.perf_counter()

    for start, end in ranges_sorted[1:]:
        if start <= cur_end + 1:
            cur_end = max(cur_end, end)
        else:
            merged.append((cur_start, cur_end))
            cur_start, cur_end = start, end

    # Add the last merged range
    merged.append((cur_start, cur_end))

    # Calculate total count of ids in merged ranges
    for start, end in merged:
        part2 += end - start + 1

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
