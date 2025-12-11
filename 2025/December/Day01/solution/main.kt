import java.io.File
import kotlin.system.measureTimeMillis

fun main(args: Array<String>) {

    val totalTime = measureTimeMillis {

        val filePath = args.getOrNull(0) ?: "data/input.csv"
        val inputFile = File(filePath)

        require(inputFile.exists()) { "Input file not found: $filePath" }

        var dial = 50
        var part1ZeroCount = 0L
        var part2ZeroCount = 0L

        val processingTime = measureTimeMillis {
            inputFile.bufferedReader().forEachLine { line ->
                if (line.isEmpty()) return@forEachLine

                val direction = line[0]
                val distance = line.substring(1).toInt()

                val hits = when (direction) {
                    'L' -> countZeroClicksLeft(dial, distance)
                    'R' -> countZeroClicksRight(dial, distance)
                    else -> error("Invalid direction: $direction")
                }

                part2ZeroCount += hits

                dial = if (direction == 'L')
                    dial - distance
                else
                    dial + distance

                dial %= 100
                if (dial < 0) dial += 100

                if (dial == 0) part1ZeroCount++
            }
        }
        println("\n========= Answers =========")
        println("Part 1 password: $part1ZeroCount")
        println("Part 2 password: $part2ZeroCount")

        println("\n========= Timings =========")
        println("Processing time: ${processingTime} ms")
    }

    println("Total runtime: ${totalTime} ms\n")
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
