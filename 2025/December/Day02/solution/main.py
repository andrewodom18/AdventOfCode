import sys
import time
from typing import List, Tuple, Set


def build_repeated(p: int, k: int, pow10d: int) -> int:
    """
    Builds a number by repeating pattern p, k times.
    Example: p=xyz, k=3 -> xyzxyzxyz
    """
    res = 0
    for _ in range(k):
        next_val = res * pow10d + p
        if next_val < 0:  # overflow guard (mostly theoretical in Python)
            return sys.maxsize
        res = next_val
    return res


def merge_ranges(ranges: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    """
    Merges overlapping or contiguous ranges into a minimal set of non-overlapping ranges.
    """
    ranges.sort(key=lambda x: x[0])
    merged = []

    cs, ce = ranges[0]
    for s, e in ranges[1:]:
        if s <= ce:
            if e > ce:
                ce = e
        else:
            merged.append((cs, ce))
            cs, ce = s, e

    merged.append((cs, ce))
    return merged


def sum_inside_ranges(values: Set[int], ranges: List[Tuple[int, int]]) -> int:
    """
    Sums all values from the set that fall within any of the provided ranges.
    """
    sorted_vals = sorted(values)
    total = 0
    idx = 0

    for v in sorted_vals:
        while idx < len(ranges) and v > ranges[idx][1]:
            idx += 1
        if idx >= len(ranges):
            break
        s, e = ranges[idx]
        if s <= v <= e:
            total += v

    return total


def num_digits(x: int) -> int:
    if x == 0:
        return 1
    d = 0
    while x != 0:
        x //= 10
        d += 1
    return d


def pow10(n: int) -> int:
    return 10**n


def main():
    start_total = time.time()

    file_path = sys.argv[1] if len(sys.argv) > 1 else "data/input.csv"

    try:
        with open(file_path, "r") as f:
            raw = f.read().strip()
    except FileNotFoundError:
        raise FileNotFoundError(f"Input file not found: {file_path}")

    ranges = []
    for token in raw.split(","):
        parts = token.strip().split("-")
        if len(parts) != 2:
            continue
        start = int(parts[0])
        end = int(parts[1])
        ranges.append((start, end))

    merged = merge_ranges(ranges)
    min_start = merged[0][0]
    max_end = merged[-1][1]

    max_digits = num_digits(max_end)

    part1_set: Set[int] = set()
    part2_set: Set[int] = set()

    # PART 1
    start_p1 = time.time()
    for L in range(2, max_digits + 1, 2):
        half = L // 2
        pow_half = pow10(half)
        min_half = pow_half // 10
        max_half = pow_half - 1

        for p in range(min_half, max_half + 1):
            n = p * pow_half + p
            if n > max_end:
                break
            if n >= min_start:
                part1_set.add(n)
                part2_set.add(n)
    part1_time = int((time.time() - start_p1) * 1000)

    # PART 2: repeated-pattern numbers ppp...p
    start_p2 = time.time()
    for L in range(2, max_digits + 1):
        for k in range(2, L + 1):
            if L % k != 0:
                continue
            d = L // k
            if d <= 0:
                continue

            pow_d = pow10(d)
            min_p = pow_d // 10
            max_p = pow_d - 1

            for p in range(min_p, max_p + 1):
                n = build_repeated(p, k, pow_d)
                if n > max_end:
                    break
                if n >= min_start:
                    part2_set.add(n)
    part2_time = int((time.time() - start_p2) * 1000)

    part1_answer = sum_inside_ranges(part1_set, merged)
    part2_answer = sum_inside_ranges(part2_set, merged)

    print("\n========= Answers =========")
    print(f"Part 1: {part1_answer}")
    print(f"Part 2: {part2_answer}")

    print("\n========= Timings =========")
    print(f"Part 1 Time: {part1_time} ms")
    print(f"Part 2 Time: {part2_time} ms")

    total_time = int((time.time() - start_total) * 1000)
    print(f"\nTotal Runtime: {total_time} ms\n")


if __name__ == "__main__":
    main()
