class MaxHeap {
    constructor() {
        this.heap = [];
    }

    insert(student) {
        const start = performance.now(); // Start timing

        this.heap.push(student);
        this.bubbleUp();

        const end = performance.now(); // End timing
        console.log(`Insertion Time: ${(end - start).toFixed(4)} ms`); // Log insertion time
        //this.logMemoryUsage('After Insertion'); // Log memory usage after insertion
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        const student = this.heap[index];

        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];

            if (this.compare(student, parent) <= 0) break;

            this.heap[index] = parent;
            index = parentIndex;
        }

        this.heap[index] = student;
    }

    compare(studentA, studentB) {
        let scoreA = this.computePriority(studentA);
        let scoreB = this.computePriority(studentB);
        return scoreB - scoreA; // Higher scores indicate higher priority
    }

    extractMax() {
        const start = performance.now(); // Start timing

        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();

        const end = performance.now(); // End timing
        console.log(`Extraction Time: ${(end - start).toFixed(4)} ms`); // Log extraction time
        //this.logMemoryUsage('After Extraction'); // Log memory usage after extraction

        return max;
    }

    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
        const element = this.heap[0];

        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (this.compare(leftChild, element) > 0) {
                    swap = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swap === null && this.compare(rightChild, element) > 0) ||
                    (swap !== null && this.compare(rightChild, leftChild) > 0)
                ) {
                    swap = rightChildIndex;
                }
            }

            if (swap === null) break;

            this.heap[index] = this.heap[swap];
            index = swap;
        }

        this.heap[index] = element;
    }

    computePriority(student) {
        let score = student.isAthlete ? 5 : 0; // Base score for being an athlete
        score += student.unsuccessfulAttempts; // Add unsuccessful attempts to the score

        // Calculate attended slots since the last reset
        const targetAttendedSlots = 3;
        const attendedSlotsSinceLastReset = student.attendedSlots - student.noShows * 2;

        // Check if the student can reset their noShows count
        if (attendedSlotsSinceLastReset >= targetAttendedSlots) {
            const slotsToReset = Math.floor(attendedSlotsSinceLastReset / targetAttendedSlots);
            score -= slotsToReset; // Decrease score for each reset opportunity
        }

        return score; // Return the calculated priority score
    }

    // logMemoryUsage(message) {
    //     const memoryUsage = process.memoryUsage();
    //     console.log(`${message}:`);
    //     console.log(`  RSS: ${memoryUsage.rss} bytes`);
    //     console.log(`  Heap Total: ${memoryUsage.heapTotal} bytes`);
    //     console.log(`  Heap Used: ${memoryUsage.heapUsed} bytes`);
    //     console.log(`  External: ${memoryUsage.external} bytes`);
    // }

    isEmpty() {
        return this.heap.length === 0;
    }
}

export default MaxHeap;