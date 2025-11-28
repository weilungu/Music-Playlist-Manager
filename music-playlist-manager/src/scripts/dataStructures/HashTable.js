class HashTable {
    constructor(size) {
        this.size = size;
        this.table = new Array(size);
    }

    hash(key) {
        let hashValue = 0;
        for (let char of key) {
            hashValue += char.charCodeAt(0);
        }
        return hashValue % this.size;
    }

    add(key, value) {
        const index = this.hash(key);
        if (!this.table[index]) {
            this.table[index] = [];
        }
        this.table[index].push({ key, value });
    }

    get(key) {
        const index = this.hash(key);
        if (!this.table[index]) {
            return null;
        }
        for (let item of this.table[index]) {
            if (item.key === key) {
                return item.value;
            }
        }
        return null;
    }

    remove(key) {
        const index = this.hash(key);
        if (!this.table[index]) {
            return false;
        }
        this.table[index] = this.table[index].filter(item => item.key !== key);
        return true;
    }

    contains(key) {
        return this.get(key) !== null;
    }
}

export default HashTable;