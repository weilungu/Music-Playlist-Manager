class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    add(data) {
        const newNode = new Node(data);
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

    // ✅ 改進：提供 removeNode(node) 方法
    removeNode(node) {
        // 如果有節點引用，刪除是 O(1)
        if (node.prev) {
            node.prev.next = node.next;
        } else {
            this.head = node.next;
        }
        
        if (node.next) {
            node.next.prev = node.prev;
        } else {
            this.tail = node.prev;
        }
        
        this.size--;
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

export default DoublyLinkedList;