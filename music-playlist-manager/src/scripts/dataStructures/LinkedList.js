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

    // ---基本操作---

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

        // 如果刪除的是當前播放節點
        if (this.current === node) {
            this.current = node.next || this.head;
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
    
    shuffle() {
        if (!this.head) return null;
        const nodes = [];
        let current = this.head;
        while (current) {
            nodes.push(current);
            current = current.next;
        }
        const randomIndex = Math.floor(Math.random() * nodes.length);
        return nodes[randomIndex];
    }

    // ---播放相關操作---
    moveNext() {
        if (!this.current) {
            this.current = this.head;
        } else {
            this.current = this.current.next || this.head; // 循環播放
        }
        return this.current ? this.current.data : null;
    }

    movePrev() {
        if (!this.current) {
            this.current = this.tail;
        } else {
            this.current = this.current.prev || this.tail; // 循環播放
        }
        return this.current ? this.current.data : null;
    }

    // ---轉換成 Array---

    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push(current.data);
            current = current.next;
        }
        return arr;
    }

    fromArray(arr) {
        this.clear();
        arr.forEach(data => this.append(data));
    }
}

export default DoublyLinkedList;