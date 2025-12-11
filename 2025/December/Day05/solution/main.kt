import java.io.File
import kotlin.system.measureTimeMillis

fun main(args: Array<String>) {

    val totalTime = measureTimeMillis {
        val filePath = args.getOrNull(0) ?: "data/input.csv"
        val inputFile = File(filePath)

        require(inputFile.exists()) { "Input file not found: $filePath" }

        val lines = inputFile.readLines()
        val merged = mutableListOf<Pair<Long, Long>>()

        // Find the blank line separating ranges and ingredient ids
        val blankIndex = lines.indexOfFirst { it.isBlank() }
        val rangeLines = lines.take(blankIndex)
        val idLines = lines.drop(blankIndex + 1)

        // Parse range lines (3-5) into pairs (3, 5)
        val ranges = rangeLines.map { line ->
            val (a, b) = line.split("-").map { it.trim().toLong() }
            a to b
        }

        // Sort ranges by their starting value
        val sorted = ranges.sortedBy { it.first }

        // Merge overlapping ranges
        var (curStart, curEnd) = sorted.first()

        var part1 = 0L
        var part2 = 0L

        // Count how many ingredient ids fall within any of the ranges
        val part1Time = measureTimeMillis {
            part1 = idLines.count { idLine ->
                val id = idLine.toLong()
                ranges.any { (start, end) -> id in start..end }
            }.toLong()
        }

        // Merge all ranges to see the total amount of ingriedient ids considered fresh
        val part2Time = measureTimeMillis {
            // Iterate through sorted ranges and merge them
            for ((start, end) in sorted.drop(1)) {
                if (start <= curEnd + 1) {
                    curEnd = maxOf(curEnd, end)
                } else {
                    merged.add(curStart to curEnd)
                    curStart = start
                    curEnd = end
                }
            }
            // Add the last merged range
            merged.add(curStart to curEnd)
            // Calculate total count of ids in merged ranges
            part2 = merged.sumOf { (start, end) -> end - start + 1 }
        }

        println("\n========= Answers =========")
        println("Part 1: $part1")
        println("Part 2: $part2")

        println("\n========= Timings =========")
        println("Part 1 Time: ${part1Time}ms")
        println("Part 2 Time: ${part2Time}ms")
    }

    println("Total Runtime: ${totalTime} ms\n")
}
