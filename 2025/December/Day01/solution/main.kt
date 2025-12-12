import java.io.File
import kotlin.system.measureTimeMillis

fun main(args: Array<String>) {

    val totalTime = measureTimeMillis {

        val filePath = args.getOrNull(0) ?: "data/input.csv"
        val inputFile = File(filePath)

        require(inputFile.exists()) { "Input file not found: $filePath" }

        val instructions = inputFile.readLines()
            .filter { it.isNotBlank() }
            .map { line ->
                val direction = line[0]
                val distance = line.substring(1).toInt()
                when (direction) {
                    'L', 'R' -> direction to distance
                    else -> error("Invalid direction: $direction")
                }
            }

        var part1ZeroCount = 0L
        val part1Time = measureTimeMillis {
            var dial = 50
            for ((direction, distance) in instructions) {
                dial = if (direction == 'L') dial - distance else dial + distance
                dial %= 100
                if (dial < 0) dial += 100
                if (dial == 0) part1ZeroCount++
            }
        }

        var part2ZeroCount = 0L
        val part2Time = measureTimeMillis {
            var dial = 50
            for ((direction, distance) in instructions) {
                val hits = when (direction) {
                    'L' -> countZeroClicksLeft(dial, distance)
                    'R' -> countZeroClicksRight(dial, distance)
                    else -> error("Invalid direction: $direction")
                }

                part2ZeroCount += hits

                dial = if (direction == 'L') dial - distance else dial + distance
                dial %= 100
                if (dial < 0) dial += 100
            }
        }

        val processingTime = part1Time + part2Time
        println("\n========= Answers =========")
        println("Part 1: $part1ZeroCount")
        println("Part 2: $part2ZeroCount")

        println("\n========= Timings =========")
        println("Part 1 Time: ${part1Time} ms")
        println("Part 2 Time: ${part2Time} ms")
        println("Processing Time: ${processingTime} ms")
    }

    println("Total Runtime: ${totalTime} ms\n")
}

// Counts how many times the dial lands on 0 when moving right
fun countZeroClicksRight(start: Int, distance: Int): Long {
    val s = start % 100
    val stepsToZero = if (s == 0) 100 else 100 - s
    if (distance < stepsToZero) return 0L
    return 1L + (distance - stepsToZero) / 100
}

// Counts how many times the dial lands on 0 when moving left
fun countZeroClicksLeft(start: Int, distance: Int): Long {
    val s = start % 100
    val stepsToZero = if (s == 0) 100 else s
    if (distance < stepsToZero) return 0L
    return 1L + (distance - stepsToZero) / 100
}
