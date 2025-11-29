# Music-Playlist-Manager 資料結構與演算法複雜度分析 v2

---

## 一、專案資料結構總覽

### 1. DoublyLinkedList（播放清單）
- 檔案：`src/scripts/dataStructures/LinkedList.js`
- 功能：O(1) 新增/刪除/前後切換，O(n) 遍歷、隨機選取
- 已支援：`add`/`append`、`remove`/`removeNode`、`moveNext`/`movePrev`、`toArray`/`fromArray`、`clear`、`traverse`/`traverseReverse`
- 可改進：
  - `get(index)` 依索引取歌
  - `find(callback)` 條件查找
  - `insertAt`/`removeAt` 指定位置操作
  - `setCurrent(node)` 直接設定播放節點

### 2. Queue（下⼀⾸播放佇列）
- 檔案：`src/scripts/dataStructures/Queue.js`
- 功能：O(1) 入隊/出隊/peek，O(n) 遍歷
- 已支援：`enqueue`、`dequeue`、`peek`、`isEmpty`、`getSize`、`toArray`、`clear`
- 可改進：
  - 支援儲存 LinkedList 節點引用（目前存物件）
  - 佇列持久化（localStorage）

### 3. HashTable（快速查詢）
- 檔案：缺（建議新增 `src/scripts/dataStructures/HashTable.js`）
- 功能：O(1) 查詢/新增/刪除
- 目前以 JS 物件暫代（`main.js` 的 `songTable`/`nodeTable`）
- 可改進：
  - 實作 Chaining（陣列鏈結法）
  - 支援 MultiMap（歌手對多首歌）
  - 完整 API：`has`、`keys`、`values`、`entries`、`getAll`、`getLoadFactor`
  - 改進 hash function（prime/djb2）

### 4. BinarySearchTree（排序所有歌曲）
- 檔案：`src/scripts/dataStructures/BinarySearchTree.js`
- 功能：O(log n) 插入/刪除/查詢，O(n) 排序
- 已支援：`insert`、`delete`、`search`、`inOrderTraversal`、`findMinNode`
- 可改進：
  - 支援自訂比較函數（目前 keySelector）
  - `findMax`、`getHeight`、`isEmpty`、`getSize`、`toArray`（排序陣列）
  - 平衡樹（AVL/Red-Black）

---

## 二、演算法複雜度分析

| 操作 | 資料結構 | 時間複雜度 |
|------|-----------|------------|
| 新增歌曲 | DoublyLinkedList/HashTable/BST | O(1)+O(1)+O(log n) |
| 刪除歌曲 | DoublyLinkedList/HashTable/BST | O(1)+O(1)+O(log n) |
| 搜尋歌名 | HashTable | O(1) |
| 搜尋歌手 | HashTable (MultiMap) | O(1) |
| 前後切換 | DoublyLinkedList | O(1) |
| 隨機播放 | DoublyLinkedList | O(n) |
| 排序顯示 | BST | O(n) |
| 佇列入隊/出隊 | Queue | O(1) |

---

## 三、現有架構可改進重點

### 1. 資料結構 API 完整性
- DoublyLinkedList 應補齊 `get(index)`、`find(callback)`、`insertAt`、`removeAt`、`setCurrent(node)`
- Queue 可支援儲存節點引用，並考慮持久化
- HashTable 應獨立實作，支援碰撞處理與一對多
- BinarySearchTree 應補齊遍歷、輔助、平衡等方法

### 2. 資料同步與一致性
- 新增/刪除歌曲時，需同步更新所有結構（LinkedList/Queue/HashTable/BST）
- HashTable 儲存節點引用，刪除時 O(1) 定位

### 3. 搜尋與排序優化
- 歌手搜尋應用 MultiMap
- 排序可支援多種欄位（title/artist/duration）與方向
- BST 可根據不同 keySelector 建立多棵樹

### 4. 複雜度與效能
- 目前所有核心操作已達最佳複雜度
- 排序/隨機播放仍為 O(n)，可接受
- 若歌曲數量大，BST 需平衡化

### 5. 其他建議
- 單元測試覆蓋所有資料結構方法
- 錯誤處理與邊界情況（空清單、重複歌曲）
- 佇列與播放清單的互動規則明確化
- UI/UX 優化（與資料結構分離）

---

## 四、接下來可改進的地方（優先級）

1. 新增/補齊 HashTable.js，支援碰撞與 MultiMap
2. DoublyLinkedList 補齊 get/find/insertAt/removeAt/setCurrent
3. BinarySearchTree 補齊 findMax/getHeight/isEmpty/getSize/toArray
4. 新增單元測試，驗證所有資料結構方法
5. 撰寫錯誤處理與邊界測試
6. 佇列持久化（localStorage）
7. 多欄位排序與多棵 BST 支援
8. 若歌曲數量大，考慮 AVL/Red-Black Tree
9. 撰寫開發文件，明確資料結構與控制器責任

---

## 五、總結

本專案資料結構設計已具備高效能與可擴充性，核心操作複雜度已優化。建議優先補齊 HashTable 與 DoublyLinkedList/BST 的 API，並加強資料同步、測試與錯誤處理，確保系統穩定與易維護。
