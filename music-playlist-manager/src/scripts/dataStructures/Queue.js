class Queue {
    constructor() {
        this.items = [];
    }

    // Add an item to the end of the queue
    enqueue(item) {
        this.items.push(item);
    }

    // Remove and return the item at the front of the queue
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }

    // Return the item at the front of the queue without removing it
    front() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[0];
    }

    // Check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Return the size of the queue
    size() {
        return this.items.length;
    }

    // Clear the queue
    clear() {
        this.items = [];
    }
}

export default Queue;