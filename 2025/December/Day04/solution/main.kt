import java.io.File
import kotlin.system.measureTimeMillis

fun main(args: Array<String>) {

    var part1: Int
    var part2: Int

    val totalTime = measureTimeMillis {
        val filePath = args.getOrNull(0) ?: "data/input.txt"
        val inputFile = File(filePath)

        require(inputFile.exists()) { "Input file not found: $filePath" }

        // Read grid once
        val grid = inputFile.readLines().map { it.toCharArray() }
        val rows = grid.size
        val columns = grid[0].size

        // Directions for 8 neighbors
        val directions = intArrayOf(
            -1, -1,  -1, 0,  -1, 1,
             0, -1,          0, 1,
             1, -1,   1, 0,   1, 1
        )

        // Part 1
        val part1Time = measureTimeMillis {
            var count = 0

            // Count accessible paper rolls
            for (row in 0 until rows) {
                for (column in 0 until columns) {
                    if (grid[row][column] != '@') continue

                    var neighbors = 0
                    var i = 0
                    while (i < directions.size) {
                        val nr = row + directions[i]
                        val nc = column + directions[i + 1]
                        if (nr in 0 until rows &&
                            nc in 0 until columns &&
                            grid[nr][nc] == '@'
                        ) {
                            neighbors++
                        }
                        i += 2
                    }

                    if (neighbors < 4) count++
                }
            }

            part1 = count
        }

        // Part 2
        val part2Time = measureTimeMillis {

            // Copy of grid so it is editable
            val mutableGrid = Array(rows) { r -> grid[r].copyOf() }

            // Neighbor count grid
            val neighborCount = Array(rows) { IntArray(columns) }

            // Function to compute neighbors
            fun computeNeighbors(row: Int, column: Int): Int {
                var count = 0
                var i = 0
                while (i < directions.size) {
                    val neighborRow = row + directions[i]
                    val neighborColumn = column + directions[i + 1]
                    if (neighborRow in 0 until rows &&
                        neighborColumn in 0 until columns &&
                        mutableGrid[neighborRow][neighborColumn] == '@'
                    ) {
                        count++
                    }
                    i += 2
                }
                return count
            }

            // Initialize neighbor counts
            for (row in 0 until rows) {
                for (column in 0 until columns) {
                    if (mutableGrid[row][column] == '@') {
                        neighborCount[row][column] = computeNeighbors(row, column)
                    }
                }
            }

            var removedTotal = 0
            val queue = ArrayDeque<Pair<Int, Int>>()

            // Store initially accessible paper rolls
            for (r in 0 until rows) {
                for (c in 0 until columns) {
                    if (mutableGrid[r][c] == '@' &&
                        neighborCount[r][c] < 4
                    ) {
                        queue.add(r to c)
                    }
                }
            }

            // 
            while (queue.isNotEmpty()) {
                val nextQueue = ArrayDeque<Pair<Int, Int>>()

                for ((r, c) in queue) {
                    if (mutableGrid[r][c] != '@') continue

                    // Remove paper roll
                    mutableGrid[r][c] = '.'
                    removedTotal++

                    // Update neighbors
                    var i = 0
                    while (i < directions.size) {
                        val nr = r + directions[i]
                        val nc = c + directions[i + 1]

                        if (nr in 0 until rows &&
                            nc in 0 until columns &&
                            mutableGrid[nr][nc] == '@'
                        ) {
                            neighborCount[nr][nc]--

                            // If it just became accessible, add to queue
                            if (neighborCount[nr][nc] == 3) {
                                nextQueue.add(nr to nc)
                            }
                        }
                        i += 2
                    }
                }

                queue.clear()
                queue.addAll(nextQueue)
            }

            part2 = removedTotal
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
