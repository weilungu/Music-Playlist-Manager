# 音樂播放清單管理器 - 資料結構設計與優化分析

> 本文件記錄所有資料結構的設計決策、缺失分析與改進方向

---

## 📋 核心設計原則

### 資料同步策略
由於使用多種資料結構，需要維護一致性：

```javascript
class MusicManager {
    constructor() {
        this.playlist = new DoublyLinkedList();  // 主要播放順序
        this.queue = new Queue();                 // 即將播放
        this.songHashByTitle = new HashTable(100); // 曲名索引
        this.songHashByArtist = new HashTable(100); // 歌手索引
        this.sortedSongs = new BinarySearchTree(); // 排序檢視
    }
}
```

### 時間複雜度目標

| 操作 | 目標複雜度 | 使用結構 |
|------|-----------|---------|
| 新增歌曲   | O(1) | DoublyLinkedList.append() |
| 刪除歌曲   | O(1) | 需要節點引用 |
| 搜尋(曲名) | O(1) | HashTable |
| 搜尋(歌手) | O(1) | HashTable (MultiMap) |
| 下一首/上一首 | O(1) | DoublyLinkedList |
| 隨機播放 | O(n) | Fisher-Yates Shuffle |
| 排序顯示 | O(n) | BST 中序遍歷 |
| 加入播放佇列 | O(1) | Queue.enqueue() |

---

## 🔗 1. Doubly Linked List（核心播放清單）

### 為什麼用雙向而非單向？
- 前後切換都是 O(1)
- 刪除節點不需要追蹤前一個節點
- 支援「上一首」功能

### ❌ 目前的缺失

#### 1. 節點結構缺少 `prev` 指標
```javascript
// ❌ 目前：單向鏈結串列
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// ✅ 應該改為：雙向鏈結串列
class DoublyNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;  // 👈 新增
    }
}
```

#### 2. 缺少追蹤當前播放位置
```javascript
class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;  // 👈 需要維護尾節點
        this.current = null; // 👈 追蹤當前播放
        this.size = 0;     // 👈 快取大小
    }
}
```

#### 3. 缺少的關鍵方法
```javascript
// ❌ 缺少：
get(index)              // 根據索引取得節點
find(callback)          // 根據條件查找
getSize()               // 回傳清單長度
isEmpty()               // 檢查是否為空
toArray()               // 轉為陣列（供 shuffle 使用）
fromArray(arr)          // 從陣列建立
clear()                 // 清空所有節點
insertAt(index, data)   // 在指定位置插入
removeAt(index)         // 刪除指定位置

// 播放器專用方法：
getCurrent()            // O(1) - 當前播放歌曲
moveNext()              // O(1) - 移到下一首
movePrev()              // O(1) - 移到上一首
setCurrent(node)        // 設定當前播放位置
```

### ✅ 建議實作

#### 前後切換（循環播放）
```javascript
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
```

#### O(1) 刪除節點
```javascript
// 提供 removeNode(node) 而非 remove(data)
removeNode(node) {
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
```

#### Shuffle 支援
```javascript
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
```

---

## 📦 2. Queue（播放佇列）

### 使用場景

#### 優先播放佇列策略
```
正在播放: Song A (來自 playlist)
Queue: [Song X, Song Y, Song Z]
下一首 → Song X (從 queue 取出)
再下一首 → Song Y
佇列空了 → 回到 playlist 的 next
```

### ❌ 缺少的方法
```javascript
class Queue {
    // ✅ 已有：enqueue, dequeue
    
    // ❌ 缺少：
    peek()        // 查看隊首元素但不移除
    isEmpty()     // 檢查是否為空
    getSize()     // 回傳隊列長度
    clear()       // 清空隊列
    toArray()     // 轉為陣列（用於顯示待播清單）
}
```

### ✅ 建議實作

#### 與 Playlist 整合
```javascript
class PlayerController {
    playNext() {
        if (!this.queue.isEmpty()) {
            return this.queue.dequeue(); // O(1) - 優先播放佇列
        } else {
            return this.playlist.moveNext(); // O(1) - 播放清單
        }
    }
    
    addToQueue(song) {
        this.queue.enqueue(song); // O(1)
    }
}
```

#### Queue 應該存什麼？
```javascript
// 選項 A：存儲歌曲物件
queue.enqueue(song);

// 選項 B：存儲 LinkedList 節點引用（推薦）
queue.enqueue(node); // 可以直接在 playlist 中定位

// 選項 C：只存儲歌曲 ID
queue.enqueue(song.id);
```

**建議：選項 A（歌曲物件）**，因為佇列中的歌曲可能不在主播放清單中

---

## 🗂️ 3. Hash Table（快速搜尋）

### 🔴 嚴重問題：碰撞處理不完整

#### ❌ 目前的問題
```javascript
add(key, value) {
    const index = this.hash(key);
    this.table[index] = { key, value };
    // ⚠️ 如果兩個不同的 key 產生相同的 hash，會互相覆蓋！
}
```

#### ✅ 正確的 Chaining 實作
```javascript
add(key, value) {
    const index = this.hash(key);
    
    // 初始化 bucket（使用陣列處理碰撞）
    if (!this.table[index]) {
        this.table[index] = [];
    }
    
    // 檢查是否已存在（更新 or 新增）
    const existing = this.table[index].find(item => item.key === key);
    if (existing) {
        existing.value = value; // 更新
    } else {
        this.table[index].push({ key, value }); // 新增
    }
}

get(key) {
    const index = this.hash(key);
    const bucket = this.table[index];
    
    if (!bucket) return null;
    
    const item = bucket.find(item => item.key === key);
    return item ? item.value : null;
}
```

### 🔴 關鍵問題：不支援一對多關係

**場景：一個歌手有多首歌**

```javascript
// ❌ 目前無法處理
hashByArtist.add("Taylor Swift", song1);
hashByArtist.add("Taylor Swift", song2); // 會覆蓋 song1

// ✅ 需要支援 MultiMap
class HashTable {
    add(key, value, allowMultiple = false) {
        const index = this.hash(key);
        
        if (!this.table[index]) {
            this.table[index] = [];
        }
        
        if (allowMultiple) {
            // 允許同一個 key 對應多個 value
            this.table[index].push({ key, value });
        } else {
            // 一對一關係
            const existing = this.table[index].find(item => item.key === key);
            if (existing) {
                existing.value = value;
            } else {
                this.table[index].push({ key, value });
            }
        }
    }
    
    getAll(key) {
        // 取得某個 key 的所有 value（回傳陣列）
        const index = this.hash(key);
        const bucket = this.table[index];
        
        if (!bucket) return [];
        
        return bucket
            .filter(item => item.key === key)
            .map(item => item.value);
    }
}
```

### 🔴 Hash Function 太簡單

```javascript
// ❌ 目前的實作
hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash += key.charCodeAt(i);
    }
    return hash % this.size;
}

// 問題：
// "abc" → 97+98+99 = 294
// "bca" → 98+99+97 = 294  ← 碰撞！

// ✅ 改進的 Hash Function
hash(key) {
    let hash = 0;
    const prime = 31; // 使用質數減少碰撞
    
    for (let i = 0; i < key.length; i++) {
        hash = (hash * prime + key.charCodeAt(i)) % this.size;
    }
    
    return hash;
}

// 或使用更好的 DJB2 演算法
hashDJB2(key) {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) + hash) + key.charCodeAt(i);
    }
    return Math.abs(hash % this.size);
}
```

### ❌ 缺少的方法
```javascript
class HashTable {
    // ❌ 缺少：
    has(key)              // 檢查 key 是否存在
    keys()                // 回傳所有 key
    values()              // 回傳所有 value
    entries()             // 回傳所有 [key, value] 對
    clear()               // 清空 hash table
    getSize()             // 回傳實際元素數量
    getLoadFactor()       // 回傳負載因子（用於判斷是否需要 resize）
}
```

### ✅ 實際應用策略

```javascript
// 使用兩個 Hash Table
this.songHashByTitle = new HashTable(100);   // title → Song (一對一)
this.songHashByArtist = new HashTable(100);  // artist → [Songs] (一對多)

// 新增歌曲時同步更新
addSong(song) {
    const node = this.playlist.append(song);
    
    // Hash Table 儲存「節點引用」而非歌曲資料
    // 這樣刪除時可以直接從 LinkedList 移除（O(1)）
    this.songHashByTitle.add(song.title, node);
    this.songHashByArtist.add(song.artist, node, true); // allowMultiple=true
    this.sortedSongs.insert(song);
}

// 搜尋歌手的所有歌曲
searchByArtist(artist) {
    return this.songHashByArtist.getAll(artist); // O(1)
}
```

---

## 🌳 4. Binary Search Tree（排序檢視）

### 使用場景

BST 用於**排序檢視**，不影響播放順序：
- 依字母順序顯示所有歌曲
- 依歌手名稱分類顯示
- 依播放次數、評分排序

### ❌ 缺失的關鍵方法

```javascript
class BinarySearchTree {
    // ✅ 已有：insert, search, delete
    
    // ❌ 缺少：遍歷方法（最重要！）
    inOrderTraversal(callback)    // 中序（升序）
    preOrderTraversal(callback)   // 前序
    postOrderTraversal(callback)  // 後序
    
    // ❌ 缺少：查詢方法
    findMin()                     // 找最小值
    findMax()                     // 找最大值
    getHeight()                   // 樹的高度
    
    // ❌ 缺少：輔助方法
    isEmpty()                     // 是否為空
    getSize()                     // 節點數量
    toArray()                     // 轉為排序陣列
}
```

### 🔴 關鍵問題：比較函數寫死了

```javascript
// ❌ 目前的實作
insert(data) {
    // 假設 data 是數字或可直接比較的
    if (data < node.data) { ... }
}

// ⚠️ 問題：如果要比較 Song 物件怎麼辦？
// Song { title: "Yesterday", artist: "Beatles", duration: 125 }
```

### ✅ 建議實作：支援自訂比較函數

```javascript
class BinarySearchTree {
    constructor(compareFunc) {
        this.root = null;
        this.size = 0;
        // 預設按 title 字母順序
        this.compare = compareFunc || ((a, b) => {
            return a.title.localeCompare(b.title);
        });
    }
    
    insert(data) {
        const newNode = new TreeNode(data);
        this.size++;
        
        if (!this.root) {
            this.root = newNode;
            return;
        }
        
        this._insertNode(this.root, newNode);
    }
    
    _insertNode(node, newNode) {
        // 使用自訂比較函數
        if (this.compare(newNode.data, node.data) < 0) {
            // newNode 較小
            if (!node.left) {
                node.left = newNode;
            } else {
                this._insertNode(node.left, newNode);
            }
        } else {
            // newNode 較大或相等
            if (!node.right) {
                node.right = newNode;
            } else {
                this._insertNode(node.right, newNode);
            }
        }
    }
}
```

### ✅ 中序遍歷（用於排序顯示）

```javascript
// 必須實作
inOrderTraversal(callback) {
    this._inOrder(this.root, callback);
}

_inOrder(node, callback) {
    if (node) {
        this._inOrder(node.left, callback);
        callback(node.data);
        this._inOrder(node.right, callback);
    }
}

// 或直接回傳排序陣列
toArray() {
    const result = [];
    this.inOrderTraversal(data => result.push(data));
    return result;
}

// 使用範例：取得排序後的歌曲列表
const sortedSongs = bst.toArray();
```

### ⚠️ BST 平衡問題

```javascript
// 問題：如果按順序插入，會退化成 O(n)
// 歌曲：["A", "B", "C", "D", "E"]
// BST 變成：
//   A
//    \
//     B
//      \
//       C
//        \
//         D

// 解決方案 1：使用 AVL Tree 或 Red-Black Tree（較複雜）
// 解決方案 2：插入時隨機化（簡單但不保證平衡）
// 解決方案 3：接受退化，因為總資料量不大（<10000 首歌）
```

**建議：先用基本 BST，測試效能後再決定是否改用平衡樹**

### ✅ 使用範例

```javascript
// 建立多個 BST 用於不同排序方式
const bstByTitle = new BinarySearchTree(
    (a, b) => a.title.localeCompare(b.title)
);

const bstByArtist = new BinarySearchTree(
    (a, b) => {
        const artistCmp = a.artist.localeCompare(b.artist);
        if (artistCmp !== 0) return artistCmp;
        return a.title.localeCompare(b.title); // 同歌手再比歌名
    }
);

const bstByDuration = new BinarySearchTree(
    (a, b) => a.duration - b.duration
);
```

---

## 🎲 隨機播放（Shuffle）設計

### Fisher-Yates Shuffle

```javascript
shuffle() {
    // 1. 轉為陣列 O(n)
    const arr = this.playlist.toArray();
    
    // 2. Fisher-Yates Shuffle O(n)
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    // 3. 重建 LinkedList O(n)
    this.playlist.fromArray(arr);
    
    // 總複雜度：O(n)
}
```

---

## 🎯 完整操作流程範例

### 新增歌曲
```javascript
addSong(songData) {
    const song = new Song(songData);
    
    // 1. 加入播放清單 - O(1)
    const node = this.playlist.append(song);
    
    // 2. 建立索引 - O(1)
    this.songHashByTitle.add(song.title, node);
    this.songHashByArtist.add(song.artist, node, true); // allowMultiple
    
    // 3. 加入排序樹 - O(log n)
    this.sortedSongs.insert(song);
    
    // 總複雜度：O(log n)
}
```

### 刪除歌曲
```javascript
removeSong(title) {
    // 1. 從 Hash Table 找到節點 - O(1)
    const node = this.songHashByTitle.get(title);
    if (!node) return false;
    
    const song = node.data;
    
    // 2. 從 LinkedList 刪除 - O(1)
    this.playlist.removeNode(node);
    
    // 3. 從 Hash Tables 移除 - O(1)
    this.songHashByTitle.remove(title);
    this.songHashByArtist.remove(song.artist, node);
    
    // 4. 從 BST 刪除 - O(log n)
    this.sortedSongs.delete(song);
    
    // 總複雜度：O(log n)
}
```

### 搜尋歌曲
```javascript
// 搜尋單一歌曲（by title）
searchByTitle(title) {
    const node = this.songHashByTitle.get(title); // O(1)
    return node ? node.data : null;
}

// 搜尋歌手的所有歌曲
searchByArtist(artist) {
    const nodes = this.songHashByArtist.getAll(artist); // O(1)
    return nodes.map(node => node.data);
}
```

### 播放控制
```javascript
playNext() {
    // 優先播放佇列
    if (!this.queue.isEmpty()) {
        return this.queue.dequeue(); // O(1)
    }
    // 否則播放清單的下一首
    return this.playlist.moveNext(); // O(1)
}

playPrevious() {
    // 佇列不支援回退，直接使用播放清單
    return this.playlist.movePrev(); // O(1)
}
```

---

## 📊 優先級建議

### 🔴 必須立即修復（會導致功能失效）

1. **LinkedList → DoublyLinkedList**
   - 新增 `prev` 指標
   - 實作 `movePrev()` 方法
   - 新增 `current` 追蹤

2. **HashTable 碰撞處理**
   - 改用 Chaining (陣列儲存)
   - 支援 MultiMap（歌手對多首歌）
   - 實作正確的 `get()` 和 `getAll()`

3. **BST 比較函數**
   - 支援自訂比較邏輯
   - 實作 `inOrderTraversal()`
   - 實作 `toArray()`

### 🟡 重要但不緊急（影響效能）

4. **所有資料結構新增**
   - `isEmpty()` 
   - `getSize()`
   - `clear()`

5. **Hash Function 改進**（減少碰撞）

6. **LinkedList 新增**
   - `toArray()` / `fromArray()`（供 shuffle 使用）
   - `find(callback)`

### 🟢 加分項目（增強功能）

7. BST 新增 `findMin()` / `findMax()`
8. Queue 新增 `peek()` 和 `toArray()`
9. HashTable 新增 `keys()`, `values()`, `entries()`

---

## ❓ 需要討論的關鍵問題

### 1. Hash Table 衝突處理
- ✅ **決定：使用 Chaining**（陣列鏈結法）
- 理由：實作簡單、適合小規模資料

### 2. BST 平衡
- ✅ **決定：先用基本 BST**
- 理由：歌曲數量通常不大，退化風險低
- 未來可考慮：AVL Tree 或 Red-Black Tree

### 3. 記憶體 vs 速度
- ✅ **決定：Hash Table 儲存「節點引用」**
- 理由：刪除時可直接從 LinkedList 移除（O(1)）
- 代價：需要維護資料一致性

### 4. 循環播放
- ✅ **決定：播放到尾端自動回到開頭**
- 實作：`moveNext()` 和 `movePrev()` 都支援循環

### 5. 佇列持久化
- ⚠️ **待決定：是否需要 localStorage**
- 考量：重新整理頁面後佇列是否保留

---

## 🚀 實作順序建議

1. **第一階段：修復核心功能**
   - DoublyLinkedList 完整實作
   - HashTable 碰撞處理
   - BST 遍歷方法

2. **第二階段：補齊輔助方法**
   - 所有 `isEmpty()`, `getSize()`, `clear()`
   - LinkedList 的 `toArray()` / `fromArray()`
   - Queue 的 `peek()`

3. **第三階段：優化與增強**
   - Hash Function 改進
   - BST 多種排序方式
   - 效能測試與調整

---

## 📝 備註

- 本專案是學習資料結構的實作，著重於理解各種結構的優缺點
- 所有時間複雜度分析都基於理想情況（Hash Table 無碰撞、BST 平衡）
- 實際應用時需要考慮邊界情況和錯誤處理
- 建議在實作過程中撰寫單元測試驗證各個方法的正確性
