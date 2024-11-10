class MaxHeap {
    constructor() {
        this.heap = [];
    }

    insert(student) {
        this.heap.push(student);
        this.bubbleUp();
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
        // Prioritize athletes over ordinary students
        if (studentA.isAthlete && !studentB.isAthlete) return 1;
        if (!studentA.isAthlete && studentB.isAthlete) return -1;
        
        // If both are of the same type, prioritize by unsuccessful attempts
        return studentB.unsuccessfulAttempts - studentA.unsuccessfulAttempts; // Max-heap
    }

    extractMax() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
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

    isEmpty() {
        return this.heap.length === 0;
    }
}

export default MaxHeap;