/**
 * TreeNode - BST 節點
 */
class TreeNode {
    constructor(song) {
        this.song = song;
        this.left = null;
        this.right = null;
    }
}

/**
 * BinarySearchTree - 二元搜尋樹
 * 
 * 時間複雜度（平均情況，平衡樹）：
 *   insert: O(log n)
 *   delete: O(log n)
 *   search: O(log n)
 *   inOrderTraversal: O(n)
 * 
 * 注意：最壞情況（退化成鏈結串列）為 O(n)
 */
class BinarySearchTree {
    /**
     * @param {Function} keySelector - 取得排序鍵的函式，預設使用 song.title
     */
    constructor(keySelector) {
        this.root = null;
        this.keySelector = keySelector || (s => (s.title || ''));
    }

    /** 取得歌曲的排序鍵 - O(1) */
    getKey(song) {
        return this.keySelector ? this.keySelector(song) : (song.title || '');
    }

    /** 插入歌曲 - O(log n) 平均 */
    insert(song) {
        const newNode = new TreeNode(song);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        this.insertNode(this.root, newNode);
    }

    /** 遞迴插入節點 - O(log n) 平均 */
    insertNode(node, newNode) {
        const newKey = this.getKey(newNode.song);
        const nodeKey = this.getKey(node.song);
        if (newKey < nodeKey) {
            if (!node.left) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (!node.right) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    /** 刪除指定鍵值的節點 - O(log n) 平均 */
    delete(keyValue) {
        this.root = this.deleteNode(this.root, keyValue);
    }

    /** 遞迴刪除節點 - O(log n) 平均 */
    deleteNode(node, keyValue) {
        if (!node) {
            return null;
        }
        const nodeKey = this.getKey(node.song);
        if (keyValue < nodeKey) {
            node.left = this.deleteNode(node.left, keyValue);
            return node;
        } else if (keyValue > nodeKey) {
            node.right = this.deleteNode(node.right, keyValue);
            return node;
        } else {
            if (!node.left && !node.right) {
                return null;
            }
            if (!node.left) {
                return node.right;
            }
            if (!node.right) {
                return node.left;
            }
            const tempNode = this.findMinNode(node.right);
            node.song = tempNode.song;
            const tempKey = this.getKey(tempNode.song);
            node.right = this.deleteNode(node.right, tempKey);
            return node;
        }
    }

    /** 找到子樹中最小的節點 - O(log n) 平均 */
    findMinNode(node) {
        while (node && node.left) {
            node = node.left;
        }
        return node;
    }

    /** 搜尋指定鍵值的歌曲 - O(log n) 平均 */
    search(keyValue) {
        return this.searchNode(this.root, keyValue);
    }

    /** 遞迴搜尋 - O(log n) 平均 */
    searchNode(node, keyValue) {
        if (!node) {
            return null;
        }
        const nodeKey = this.getKey(node.song);
        if (keyValue < nodeKey) {
            return this.searchNode(node.left, keyValue);
        } else if (keyValue > nodeKey) {
            return this.searchNode(node.right, keyValue);
        } else {
            return node.song;
        }
    }

    /** 中序遍歷（排序結果）- O(n) */
    inOrderTraversal(node, callback) {
        if (node) {
            this.inOrderTraversal(node.left, callback);
            callback(node.song);
            this.inOrderTraversal(node.right, callback);
        }
    }
}

export default BinarySearchTree;