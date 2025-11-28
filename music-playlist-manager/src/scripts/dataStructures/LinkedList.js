class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    add(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
    }

    remove(data) {
        if (!this.head) return;

        if (this.head.data === data) {
            this.head = this.head.next;
            this.size--;
            return;
        }

        let current = this.head;
        while (current.next) {
            if (current.next.data === data) {
                current.next = current.next.next;
                this.size--;
                return;
            }
            current = current.next;
        }
    }

    traverse() {
        const elements = [];
        let current = this.head;
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        return elements;
    }

    getSize() {
        return this.size;
    }
}

class SinglyLinkedList extends LinkedList {
    constructor() {
        super();
    }

    // Additional methods specific to singly linked list can be added here
}

class DoublyNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

class DoublyLinkedList extends SinglyLinkedList {
    constructor() {
        super();
        this.tail = null;
    }

    add(data) {
        const newNode = new DoublyNode(data);
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        this.size++;
    }

    remove(data) {
        if (!this.head) return;

        // 如果要移除的是頭節點
        if (this.head.data === data) {
            this.head = this.head.next;
            if (this.head) {
                this.head.prev = null;
            } else {
                // 如果移除後串列為空，tail 也要設為 null
                this.tail = null;
            }
            this.size--;
            return;
        }

        // 搜尋要移除的節點
        let current = this.head;
        while (current) {
            if (current.data === data) {
                // 更新前一個節點的 next 指標
                if (current.prev) {
                    current.prev.next = current.next;
                }
                // 更新後一個節點的 prev 指標
                if (current.next) {
                    current.next.prev = current.prev;
                } else {
                    // 如果移除的是尾節點，更新 tail
                    this.tail = current.prev;
                }
                this.size--;
                return;
            }
            current = current.next;
        }
    }

    traverse() {
        const elements = [];
        let current = this.head;
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        return elements;
    }

    traverseReverse() {
        const elements = [];
        let current = this.tail;
        while (current) {
            elements.push(current.data);
            current = current.prev;
        }
        return elements;
    }

    getSize() {
        return this.size;
    }
}

export { SinglyLinkedList, DoublyLinkedList };