import sys
import os
import time


def main():
    total_start = time.perf_counter()

    file_path = sys.argv[1] if len(sys.argv) > 1 else "data/input.csv"

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Input file not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        rows = [line.strip() for line in f if line.strip()]

    part1 = 0
    part2 = 0

    part1_start = time.perf_counter()
    for row in rows:
        part1 += compute_two_digit_value(row)
    part1_time = int((time.perf_counter() - part1_start) * 1000)

    part2_start = time.perf_counter()
    for row in rows:
        if len(row) >= 12:
            part2 += largest_12_digit_value(row)
    part2_time = int((time.perf_counter() - part2_start) * 1000)

    print("\n========= Answers =========")
    print(f"Part 1: {part1}")
    print(f"Part 2: {part2}")

    print("\n========= Timings =========")
    print(f"Part 1 Time: {part1_time}ms")
    print(f"Part 2 Time: {part2_time}ms")

    total_time = int((time.perf_counter() - total_start) * 1000)
    print(f"\nTotal Runtime: {total_time} ms\n")


# Find the largest two-digit number that can be formed in a row
def compute_two_digit_value(row: str) -> int:
    length = len(row)
    if length < 3:
        return 0

    last_idx = length - 1
    max1 = ""
    max1_idx = -1

    for i in range(last_idx):
        char = row[i]
        if char > max1:
            max1 = char
            max1_idx = i

    if max1_idx == -1:
        return 0

    max2 = ""
    for i in range(max1_idx + 1, length):
        char = row[i]
        if char > max2:
            max2 = char

    d1 = ord(max1) - ord("0")
    d2 = ord(max2) - ord("0")

    return d1 * 10 + d2 if 0 <= d1 <= 9 and 0 <= d2 <= 9 else 0


# Find the largest 12-digit number that can be formed in a row
def largest_12_digit_value(row: str) -> int:
    k = 12
    to_drop = len(row) - k

    stack = []

    for char in row:
        while stack and to_drop > 0 and stack[-1] < char:
            stack.pop()
            to_drop -= 1
        stack.append(char)

    value = 0
    for i in range(k):
        value = value * 10 + (ord(stack[i]) - ord("0"))

    return value


if __name__ == "__main__":
    main()
