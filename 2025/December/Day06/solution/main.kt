import java.io.File
import kotlin.system.measureTimeMillis

fun main(args: Array<String>) {

    val totalTime = measureTimeMillis {
        val filePath = args.getOrNull(0) ?: "data/input.csv"
        val inputFile = File(filePath)

        require(inputFile.exists()) { "Input file not found: $filePath" }

        val lines = inputFile.readLines()
        val height = lines.size
        val width = lines.maxOf { it.length }

        // ensure uniform width by padding with spaces
        val grid = lines.map { it.padEnd(width, ' ') }

        var part1 = 0L
        var part2 = 0L

        val part1Time = measureTimeMillis {

            var col = 0
            while (col < width) {

                // Skip empty columns
                if ((0 until height).all { grid[it][col] == ' ' }) {
                    col++
                    continue
                }

                // Find the span of this problem
                val startCol = col
                while (col < width && (0 until height).any { grid[it][col] != ' ' }) {
                    col++
                }
                val endCol = col

                val numbers = mutableListOf<Long>()
                var operator: Char? = null

                // Extract values from this column group
                for (row in 0 until height) {
                    val cell = grid[row].substring(startCol, endCol).trim()
                    if (cell.isEmpty()) continue

                    if (cell == "+" || cell == "*") {
                        operator = cell[0]
                    } else {
                        numbers.add(cell.toLong())
                    }
                }

                // Compute result
                val result = when (operator) {
                    '+' -> numbers.sum()
                    '*' -> numbers.fold(1L) { acc, n -> acc * n }
                    else -> error("Missing operator in problem")
                }

                part1 += result
            }
        }

        val part2Time = measureTimeMillis {
            part2 = 0L
        }

        println(grid)
        println("\n========= Answers =========")
        println("Part 1: $part1")
        println("Part 2: $part2")

        println("\n========= Timings =========")
        println("Part 1 Time: ${part1Time}ms")
        println("Part 2 Time: ${part2Time}ms")
    }

    println("Total Runtime: ${totalTime} ms\n")
}
