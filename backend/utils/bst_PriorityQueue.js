// BSTPriorityQueue.js
class Node {
    constructor(value, priority) {
        this.value = value;
        this.priority = priority; // Lower values indicate higher priority
        this.left = null;
        this.right = null;
    }
}

class BSTPriorityQueue {
    constructor() {
        this.root = null;
    }

    // Insert a new value with a given priority
    insert(value) {
        const start = performance.now();

        const priority = this.computePriority(value);
        const newNode = new Node(value, priority);
        if (!this.root) {
            this.root = newNode;
        } else {
            this._insertNode(this.root, newNode);
        }

        const end = performance.now(); // End timing
        console.log(`Insertion Time: ${(end - start).toFixed(4)} ms`);

        // Log memory usage after insertion
        this.logMemoryUsage('After Insertion');
    }

    // Helper method to insert a node in the BST
    _insertNode(node, newNode) {
        
        if (newNode.priority < node.priority) {
            if (!node.left) {
                node.left = newNode;
            } else {
                this._insertNode(node.left, newNode);
            }
        } else {
            if (!node.right) {
                node.right = newNode;
            } else {
                this._insertNode(node.right, newNode);
            }
        }
    }

    // Compute priority based on the same logic as MaxHeap
    computePriority(student) {
        let score = student.isAthlete ? 5 : 0;
        score += student.unsuccessfulAttempts;
        score -= student.noShows ? 2 * student.noShows : 0;
        return score;
    }

    // Extract the highest priority element (the node with the lowest priority value)
    extractMax() {
        const start = performance.now(); // Start timing


        if (!this.root) {
            return null; // Queue is empty
        }
        const maxNode = this._extractMaxNode(this.root);

        const end = performance.now(); // End timing
        console.log(`Extraction Time: ${(end - start).toFixed(4)} ms`);
        
        // Log memory usage after extraction
        this.logMemoryUsage('After Extraction');

        return maxNode.value; // Return the value of the extracted node
    }

    // Helper method to extract the max node
    _extractMaxNode(node) {
        if (!node.left) {
            const maxNode = node;
            this.root = node.right; // Update root if needed
            return maxNode;
        }
        node.left = this._extractMaxNode(node.left);
        return node;
    }

    // Log memory usage
    logMemoryUsage(message) {
        const memoryUsage = process.memoryUsage();
        console.log(`${message}:`);
        console.log(`  RSS: ${memoryUsage.rss} bytes`);
        console.log(`  Heap Total: ${memoryUsage.heapTotal} bytes`);
        console.log(`  Heap Used: ${memoryUsage.heapUsed} bytes`);
        console.log(`  External: ${memoryUsage.external} bytes`);
    }

    // Check if the queue is empty
    isEmpty() {
        return this.root === null;
    }
}

export default BSTPriorityQueue;