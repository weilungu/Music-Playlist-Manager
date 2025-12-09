# localStorage 實作說明

## 功能概述
已使用 `localStorage` 實現播放清單的持久化存儲，使得頁面重新整理後資料不會遺失。

## 實作細節

### 1. 新增的 localStorage 函數

#### `savePlaylistToStorage()`
- **功能**：將當前播放清單序列化並存儲到 localStorage
- **儲存鍵**：`musicPlaylist`
- **調用時機**：
  - 新增歌曲時（`addSongToStructures()` 內）
  - 刪除歌曲時（刪除事件委派內）

#### `loadPlaylistFromStorage()`
- **功能**：從 localStorage 讀取播放清單
- **返回值**：播放清單陣列，若無資料則返回空陣列

#### `saveSortDirectionToStorage()`
- **功能**：將排序方向存儲到 localStorage
- **儲存鍵**：`sortDirection`

#### `loadSortDirectionFromStorage()`
- **功能**：從 localStorage 讀取排序方向
- **返回值**：`'asc'` 或 `'desc'`，預設為 `'asc'`

### 2. 初始化流程修改

在 `DOMContentLoaded` 事件中：
1. 先從 localStorage 加載排序方向
2. 嘗試從 localStorage 加載播放清單
3. 若 localStorage 無資料，使用預設範例歌曲
4. 將所有歌曲加載到資料結構中
5. 更新排序方向按鈕的箭頭圖示

### 3. 數據持久化時機

- **新增歌曲**：每次添加歌曲時自動保存
- **刪除歌曲**：每次刪除歌曲時自動保存
- **排序方向**：每次改變排序方向時自動保存

## 測試步驟

1. **測試新增功能**：
   - 在瀏覽器中打開應用
   - 新增幾首歌曲
   - 重新整理頁面（F5 或 Ctrl+R）
   - 驗證新增的歌曲是否仍然存在

2. **測試刪除功能**：
   - 選取一首歌曲並刪除
   - 重新整理頁面
   - 驗證刪除的歌曲是否不再出現

3. **測試排序方向**：
   - 改變排序方向（點擊箭頭按鈕）
   - 重新整理頁面
   - 驗證排序方向是否被保留

4. **測試清除 localStorage**：
   - 在瀏覽器開發者工具中清除 localStorage
   - 重新整理頁面
   - 驗證應用是否使用預設範例歌曲

## localStorage 鍵值

| 鍵名 | 用途 | 數據格式 |
|------|------|----------|
| `musicPlaylist` | 存儲播放清單 | JSON 字符串（歌曲陣列） |
| `sortDirection` | 存儲排序方向 | 字符串（'asc' 或 'desc'） |

## 瀏覽器相容性

- 所有現代瀏覽器（Chrome, Firefox, Safari, Edge）都支持 localStorage
- localStorage 的儲存限制通常為 5-10 MB（取決於瀏覽器）

## 錯誤處理

所有 localStorage 操作都包含 try-catch 區塊，以防止因 localStorage 滿或其他錯誤導致的應用崩潰。
