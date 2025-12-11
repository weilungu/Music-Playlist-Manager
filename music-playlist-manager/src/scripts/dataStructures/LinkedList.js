/**
 * Node - 雙向連結串列節點
 */
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

/**
 * DoublyLinkedList - 雙向連結串列
 * 
 * 時間複雜度：
 *   add/append: O(1) - 加到尾端
 *   removeNode: O(1) - 已知節點引用
 *   remove: O(n) - 需搜尋節點
 *   traverse/toArray: O(n)
 *   shuffle: O(n) - 隨機選取
 *   moveNext/movePrev: O(1) - 指標移動
 *   clear: O(1)
 */
class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // ========== 基本操作 ==========

    /** 新增節點到尾端 - O(1) */
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
        return newNode;
    }

    /** add 的別名 - O(1) */
    append(data) {
        return this.add(data);
    }

    /** 清空串列 - O(1) */
    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.current = null;
    }

    /** 依資料搜尋並移除節點 - O(n) */
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

    /** 依節點引用直接移除 - O(1) */
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

    /** 遍歷所有節點 - O(n) */
    traverse() {
        const elements = [];
        let current = this.head;
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        return elements;
    }

    /** 反向遍歷 - O(n) */
    traverseReverse() {
        const elements = [];
        let current = this.tail;
        while (current) {
            elements.push(current.data);
            current = current.prev;
        }
        return elements;
    }

    /** 取得串列長度 - O(1) */
    getSize() {
        return this.size;
    }

    /** 隨機取得一個節點 - O(n) */
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

    // ========== 播放相關操作 ==========

    /** 移到下一首（循環）- O(1) */
    moveNext() {
        if (!this.current) {
            this.current = this.head;
        } else {
            this.current = this.current.next || this.head;
        }
        return this.current ? this.current.data : null;
    }

    /** 移到上一首（循環）- O(1) */
    movePrev() {
        if (!this.current) {
            this.current = this.tail;
        } else {
            this.current = this.current.prev || this.tail;
        }
        return this.current ? this.current.data : null;
    }

    // ========== 轉換方法 ==========

    /** 轉換為陣列 - O(n) */
    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push(current.data);
            current = current.next;
        }
        return arr;
    }

    /** 從陣列重建串列 - O(n) */
    fromArray(arr) {
        this.clear();
        arr.forEach(data => this.append(data));
    }
}

export default DoublyLinkedList;