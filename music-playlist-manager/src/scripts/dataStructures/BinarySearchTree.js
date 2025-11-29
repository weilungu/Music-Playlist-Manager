class TreeNode {
    constructor(song) {
        this.song = song;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor(keySelector) {
        this.root = null;
        // keySelector: function(song) -> comparable key
        this.keySelector = keySelector || (s => (s.title || ''));
    }

    getKey(song) {
        return this.keySelector ? this.keySelector(song) : (song.title || '');
    }

    insert(song) {
        const newNode = new TreeNode(song);
        if (!this.root) {
            this.root = newNode;
            return;
        }
        this.insertNode(this.root, newNode);
    }

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

    delete(keyValue) {
        this.root = this.deleteNode(this.root, keyValue);
    }

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

    findMinNode(node) {
        while (node && node.left) {
            node = node.left;
        }
        return node;
    }

    search(keyValue) {
        return this.searchNode(this.root, keyValue);
    }

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

    inOrderTraversal(node, callback) {
        if (node) {
            this.inOrderTraversal(node.left, callback);
            callback(node.song);
            this.inOrderTraversal(node.right, callback);
        }
    }
}

export default BinarySearchTree;