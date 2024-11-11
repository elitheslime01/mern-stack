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
    insert(value, priority) {
        const newNode = new Node(value, priority);
        if (!this.root) {
            this.root = newNode;
        } else {
            this._insertNode(this.root, newNode);
        }
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

    // Extract the highest priority element (the node with the lowest priority value)
    extractMax() {
        if (!this.root) {
            return null; // Queue is empty
        }
        const maxNode = this._extractMaxNode(this.root);
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

    // Check if the queue is empty
    isEmpty() {
        return this.root === null;
    }
}

export default BSTPriorityQueue