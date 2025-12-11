import java.io.File
import kotlin.system.measureTimeMillis

fun main(args: Array<String>) {

    val totalTime = measureTimeMillis {
        val filePath = args.getOrNull(0) ?: "data/input.csv"
        val inputFile = File(filePath)

        require(inputFile.exists()) { "Input file not found: $filePath" }

        val rows = inputFile.readLines().filter { it.isNotEmpty() }

        var part1 = 0L
        var part2 = 0L

        val part1Time = measureTimeMillis {
            for (row in rows) {
                part1 += computeTwoDigitValue(row)
            }
        }

        val part2Time = measureTimeMillis {
            for (row in rows) {
                if (row.length >= 12) {
                    part2 += largest12DigitValue(row)
                }
            }
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

// Find the largest two-digit number that can be formed in a row
private fun computeTwoDigitValue(row: String): Int {
    val length = row.length
    if (length < 3) return 0
    val lastIdx = length - 1

    var max1 = Char.MIN_VALUE
    var max1Idx = -1

    for (i in 0 until lastIdx) {
        val char = row[i]
        if (char > max1) {
            max1 = char
            max1Idx = i
        }
    }
    if (max1Idx == -1) return 0

    var max2 = Char.MIN_VALUE
    for (i in max1Idx + 1..lastIdx) {
        val char = row[i]
        if (char > max2) {
            max2 = char
        }
    }

    // Convert chars to digits
    val d1 = max1 - '0'
    val d2 = max2 - '0'

    return if (d1 in 0..9 && d2 in 0..9) d1 * 10 + d2 else 0
}

// Find the largest 12-digit number that can be formed in a row
private fun largest12DigitValue(row: String): Long {
    val k = 12
    val totalLength = row.length
    var toDrop = totalLength - k

    val stack = CharArray(totalLength)
    var top = -1

    for (char in row) {
        while (top >= 0 && toDrop > 0 && stack[top] < char) {
            top--
            toDrop--
        }
        stack[++top] = char
    }

    var value = 0L
    for (i in 0 until k) {
        value = value * 10 + (stack[i] - '0')
    }
    return value
}
