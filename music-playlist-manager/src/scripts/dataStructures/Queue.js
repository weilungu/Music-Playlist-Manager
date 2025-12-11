/**
 * Queue - 使用環形陣列實作的佇列
 * 
 * 時間複雜度：
 *   enqueue: O(1) 攤銷（擴容時 O(n)）
 *   dequeue: O(1)
 *   front/peek: O(1)
 *   isEmpty/size: O(1)
 *   toArray: O(n)
 *   clear: O(1)
 */
class Queue {
    constructor(initialCapacity = 16) {
        this._items = new Array(initialCapacity);
        this._head = 0;    // 隊首索引
        this._tail = 0;    // 下一個插入位置
        this._size = 0;    // 目前元素數量
    }

    /**
     * 將元素加入佇列尾端 - O(1) 攤銷
     */
    enqueue(item) {
        // 若已滿則擴容
        if (this._size === this._items.length) {
            this._resize(this._items.length * 2);
        }
        this._items[this._tail] = item;
        this._tail = (this._tail + 1) % this._items.length;
        this._size++;
    }

    /**
     * 移除並回傳隊首元素 - O(1)
     */
    dequeue() {
        if (this._size === 0) {
            return null;
        }
        const item = this._items[this._head];
        this._items[this._head] = undefined; // 避免記憶體洩漏
        this._head = (this._head + 1) % this._items.length;
        this._size--;
        return item;
    }

    /**
     * 回傳隊首元素但不移除 - O(1)
     */
    front() {
        return this._size === 0 ? null : this._items[this._head];
    }

    /**
     * front 的別名 - O(1)
     */
    peek() {
        return this.front();
    }

    /**
     * 檢查佇列是否為空 - O(1)
     */
    isEmpty() {
        return this._size === 0;
    }

    /**
     * 回傳佇列長度 - O(1)
     */
    size() {
        return this._size;
    }

    /**
     * size 的別名 - O(1)
     */
    getSize() {
        return this._size;
    }

    /**
     * 轉換為陣列（依序從頭到尾）- O(n)
     */
    toArray() {
        const result = new Array(this._size);
        for (let i = 0; i < this._size; i++) {
            result[i] = this._items[(this._head + i) % this._items.length];
        }
        return result;
    }

    /**
     * 清空佇列 - O(1)
     */
    clear() {
        this._items = new Array(16);
        this._head = 0;
        this._tail = 0;
        this._size = 0;
    }

    /**
     * 內部方法：擴容陣列 - O(n)
     */
    _resize(newCapacity) {
        const newItems = new Array(newCapacity);
        for (let i = 0; i < this._size; i++) {
            newItems[i] = this._items[(this._head + i) % this._items.length];
        }
        this._items = newItems;
        this._head = 0;
        this._tail = this._size;
    }
}

export default Queue;