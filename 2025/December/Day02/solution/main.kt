import java.io.File
import kotlin.system.measureTimeMillis

fun main(args: Array<String>) {

    val totalTime = measureTimeMillis {

        val filePath = args.getOrNull(0) ?: "data/input.csv"
        val inputFile = File(filePath)

        require(inputFile.exists()) { "Input file not found: $filePath" }

        val raw = inputFile.readText().trim()

        val ranges = raw.split(',')
            .mapNotNull { token ->
                val parts = token.trim().split('-')
                if (parts.size != 2) return@mapNotNull null
                val start = parts[0].toLong()
                val end = parts[1].toLong()
                start to end
            }

        val merged = mergeRanges(ranges)
        val minStart = merged.first().first
        val maxEnd = merged.last().second

        fun numDigits(x: Long): Int {
            var n = x
            var d = 0
            while (n != 0L) {
                n /= 10
                d++
            }
            return if (d == 0) 1 else d
        }

        fun pow10(n: Int): Long {
            var r = 1L
            repeat(n) { r *= 10 }
            return r
        }

        val maxDigits = numDigits(maxEnd)

        val part1Set = HashSet<Long>(100_000)
        val part2Set = HashSet<Long>(200_000)

        val part1Time = measureTimeMillis {
            for (L in 2..maxDigits step 2) {
                val half = L / 2
                val pow = pow10(half)
                val minHalf = pow / 10
                val maxHalf = pow - 1

                for (p in minHalf..maxHalf) {
                    val n = p * pow + p
                    if (n > maxEnd) break
                    if (n >= minStart) {
                        part1Set.add(n)
                        part2Set.add(n)
                    }
                }
            }
        }

        // PART 2: repeated-pattern numbers ppp...p
        val part2Time = measureTimeMillis {
            for (L in 2..maxDigits) {
                for (k in 2..L) {
                    if (L % k != 0) continue
                    val d = L / k
                    if (d <= 0) continue

                    val pow = pow10(d)
                    val minP = pow / 10
                    val maxP = pow - 1

                    for (p in minP..maxP) {
                        val n = buildRepeated(p, k, pow)
                        if (n > maxEnd) break
                        if (n >= minStart) part2Set.add(n)
                    }
                }
            }
        }

        val part1Answer = sumInsideRanges(part1Set, merged)
        val part2Answer = sumInsideRanges(part2Set, merged)

        println("\n========= Answers =========")
        println("Part 1: $part1Answer")
        println("Part 2: $part2Answer")

        println("\n========= Timings =========")
        println("Part 1 Time:     ${part1Time} ms")
        println("Part 2 Time:     ${part2Time} ms")
    }

    println("Total Runtime: ${totalTime} ms\n")
}

// Builds a number by repeating pattern p, k times. E.g. p=xyz, k=3 -> xyzxyzxyz
fun buildRepeated(p: Long, k: Int, pow10d: Long): Long {
    var res = 0L
    repeat(k) {
        val next = res * pow10d + p
        if (next < 0) return Long.MAX_VALUE // overflow guard
        res = next
    }
    return res
}

// Merges overlapping or contiguous ranges into minimal set of non-overlapping ranges
fun mergeRanges(ranges: List<Pair<Long, Long>>): List<Pair<Long, Long>> {
    val sorted = ranges.sortedBy { it.first }
    val merged = ArrayList<Pair<Long, Long>>(sorted.size)

    var (cs, ce) = sorted[0]
    for (i in 1 until sorted.size) {
        val (s, e) = sorted[i]
        if (s <= ce) {
            if (e > ce) ce = e
        } else {
            merged.add(cs to ce)
            cs = s
            ce = e
        }
    }
    merged.add(cs to ce)
    return merged
}

// Sums all values from the set that fall within any of the provided ranges
fun sumInsideRanges(values: Set<Long>, ranges: List<Pair<Long, Long>>): Long {
    val sortedVals = values.sorted()
    var sum = 0L
    var idx = 0

    for (v in sortedVals) {
        while (idx < ranges.size && v > ranges[idx].second) idx++
        if (idx >= ranges.size) break
        val (s, e) = ranges[idx]
        if (v in s..e) sum += v
    }

    return sum
}
