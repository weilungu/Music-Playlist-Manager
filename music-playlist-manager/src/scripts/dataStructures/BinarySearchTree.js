class TreeNode {
    constructor(song) {
        this.song = song;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
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
        if (newNode.song.title < node.song.title) {
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

    delete(songTitle) {
        this.root = this.deleteNode(this.root, songTitle);
    }

    deleteNode(node, songTitle) {
        if (!node) {
            return null;
        }
        if (songTitle < node.song.title) {
            node.left = this.deleteNode(node.left, songTitle);
            return node;
        } else if (songTitle > node.song.title) {
            node.right = this.deleteNode(node.right, songTitle);
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
            node.right = this.deleteNode(node.right, tempNode.song.title);
            return node;
        }
    }

    findMinNode(node) {
        while (node && node.left) {
            node = node.left;
        }
        return node;
    }

    search(songTitle) {
        return this.searchNode(this.root, songTitle);
    }

    searchNode(node, songTitle) {
        if (!node) {
            return null;
        }
        if (songTitle < node.song.title) {
            return this.searchNode(node.left, songTitle);
        } else if (songTitle > node.song.title) {
            return this.searchNode(node.right, songTitle);
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