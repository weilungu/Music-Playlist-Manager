// main.js
// 使用資料結構管理播放清單與播放控制
import DoublyLinkedList from './dataStructures/LinkedList.js';
import Queue from './dataStructures/Queue.js';
import BinarySearchTree from './dataStructures/BinarySearchTree.js';

// 播放清單：Doubly Linked List - O(1) add/remove at ends, O(n) traverse
const playlistList = new DoublyLinkedList();

// 上/下一首：直接使用 DoublyLinkedList 的 prev/next 指標 - O(1)
// Queue 保留用於特殊排程場景
const nextQueue = new Queue();
const prevQueue = new Queue();

// 取名與歌手查詢：hashtable（使用內建 object）- O(1) lookup
const songTable = {};

// 新增：節點快速查找表 - O(1) lookup by song title
const nodeTable = {};

// 排序歌曲：Binary Search Tree（依 title 排序）- O(log n) insert, O(n) traversal
const bst = new BinarySearchTree();

let isPlaying = false;
let currentNode = null; // 目前播放的 DoublyLinkedList 節點

document.addEventListener('DOMContentLoaded', () => {
    // 初始化一些範例歌曲到資料結構
    const initialSongs = [
        { title: '歌曲1', artist: '歌手A' },
        { title: '歌曲2', artist: '歌手B' },
        { title: '歌曲3', artist: '歌手C' }
    ];
    initialSongs.forEach(song => {
        addSongToStructures(song);
    });
    updatePlaylistDisplay();
    updateButtonStates();
    
    // 新增歌曲按鈕事件 - O(1) hashtable insert + O(log n) BST insert
    document.getElementById('add-song-btn').addEventListener('click', () => {
        const songName = document.getElementById('song-name-input').value.trim();
        const artistName = document.getElementById('artist-name-input').value.trim();
        
        if (songName && artistName) {
            const song = { title: songName, artist: artistName };
            addSongToStructures(song);
            // 如果目前沒有播放節點，預設到第一首
            if (!currentNode) {
                currentNode = playlistList.head;
            }
            updatePlaylistDisplay();
            
            // 清空輸入欄位
            document.getElementById('song-name-input').value = '';
            document.getElementById('artist-name-input').value = '';
        } else {
            alert('請輸入歌曲名稱和歌手名稱');
        }
    });
    
    // 刪除歌曲按鈕事件 - O(1) hashtable + node lookup, O(log n) BST delete
    document.getElementById('remove-song-btn').addEventListener('click', () => {
        const songName = document.getElementById('song-name-input').value.trim();
        
        if (songName) {
            const song = songTable[songName];
            const node = nodeTable[songName];
            if (song && node) {
                // 調整目前播放節點（刪除前處理）
                if (currentNode === node) {
                    currentNode = currentNode.next || currentNode.prev || null;
                }
                
                // O(1) 從 DoublyLinkedList 刪除節點
                playlistList.removeNode(node);
                // O(log n) 從 BST 移除
                bst.delete(songName);
                // O(1) 從 hashtable 移除
                delete songTable[songName];
                delete nodeTable[songName];
                
                // 清理 queue (保留，但實際上 prev/next 已不依賴它)
                filterQueue(nextQueue, s => s.title !== songName);
                filterQueue(prevQueue, s => s.title !== songName);

                updatePlaylistDisplay();
                document.getElementById('song-name-input').value = '';
                document.getElementById('artist-name-input').value = '';
            } else {
                alert('找不到該歌曲');
            }
        } else {
            alert('請輸入要刪除的歌曲名稱');
        }
    });
    
    // 播放/停止按鈕 - O(1) 狀態切換
    document.getElementById('play').addEventListener('click', () => {
        const playButton = document.getElementById('play');
        
        if (!isPlaying) {
            // 開始播放
            if (!playlistList.head) {
                alert('播放清單是空的');
                return;
            }
            
            // 每次播放都從第一首開始
            currentNode = playlistList.head;
            
            isPlaying = true;
            playButton.textContent = '停止';
            playButton.classList.add('playing');
        } else {
            // 停止播放
            isPlaying = false;
            playButton.textContent = '播放';
            playButton.classList.remove('playing');
        }
        
        updatePlaylistDisplay();
        updateButtonStates();
    });
    
    // 上一首按鈕 - O(1) 使用雙向鏈結的 prev 指標
    document.getElementById('prev').addEventListener('click', () => {
        if (!playlistList.head) {
            alert('播放清單是空的');
            return;
        }
        
        if (!isPlaying) {
            return;
        }
        
        if (!currentNode) {
            currentNode = playlistList.tail; // 從最後一首開始
        } else {
            // O(1) 直接使用 prev 指標，循環播放
            currentNode = currentNode.prev || playlistList.tail;
        }
        
        updatePlaylistDisplay();
    });
    

    // 下一首按鈕 - O(1) 使用雙向鏈結的 next 指標
    document.getElementById('next').addEventListener('click', () => {
        if (!playlistList.head) {
            alert('播放清單是空的');
            return;
        }
        
        if (!isPlaying) {
            return;
        }
        
        if (!currentNode) {
            currentNode = playlistList.head; // 從第一首開始
        } else {
            // O(1) 直接使用 next 指標，循環播放
            currentNode = currentNode.next || playlistList.head;
        }
        
        updatePlaylistDisplay();
    });
    
    
    // 隨機播放按鈕 - O(n) 遍歷取隨機節點（shuffle）
    document.getElementById('random').addEventListener('click', () => {
        if (!playlistList.head) {
            alert('播放清單是空的');
            return;
        }
        // O(n) 透過 DoublyLinkedList.shuffle() 取得隨機節點
        const randomNode = playlistList.shuffle();
        currentNode = randomNode;
        
        if (!isPlaying) {
            isPlaying = true;
            const playButton = document.getElementById('play');
            playButton.textContent = '停止';
            playButton.classList.add('playing');
        }
        
        updatePlaylistDisplay();
        updateButtonStates();
    });
    
    // 搜尋按鈕 - O(1) hashtable 查歌名 + O(n) 過濾歌手
    document.getElementById('search-btn').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        if (searchTerm) {
            // O(1) 使用 hashtable 依歌曲名查找
            const direct = songTable[searchTerm];
            // O(n) 依歌手名過濾（可優化：建立 artistTable）
            const byArtist = Object.values(songTable).filter(s => s.artist === searchTerm);
            const results = [];
            if (direct) results.push(direct);
            results.push(...byArtist.filter(s => !direct || s.title !== direct.title));
            if (results.length > 0) {
                alert(`找到 ${results.length} 首歌曲：\n` +
                    results.map(s => `${s.title} - ${s.artist}`).join('\n'));
            } else {
                alert('找不到相關歌曲');
            }
        }
    });

    // 排序（依標題）- O(n) BST 中序遍歷
    const sortBtn = document.getElementById('sort-btn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            const sorted = [];
            // O(n) BST 中序遍歷，得到排序結果
            bst.inOrderTraversal(bst.root, song => sorted.push(song));
            renderList(sorted, currentNode ? currentNode.data : null);
        });
    }
});

// 更新按鈕狀態 - O(1)
function updateButtonStates() {
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    
    if (isPlaying) {
        prevButton.disabled = false;
        nextButton.disabled = false;
    } else {
        prevButton.disabled = true;
        nextButton.disabled = true;
    }
}

// 更新播放清單顯示 - O(n) 遍歷與 DOM 操作
// 未來優化方向：虛擬滾動、DOM diff、只更新變化的項目
function updatePlaylistDisplay() {
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
    const arr = playlistList.toArray(); // O(n) 遍歷鏈結串列
    if (arr.length === 0) {
        songList.innerHTML = '<li style="text-align: center; color: #999;">播放清單是空的</li>';
        currentNode = null;
        return;
    }
    // O(n) DOM 操作
    arr.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
        // O(1) 比對當前播放歌曲
        if (isPlaying && currentNode && currentNode.data && currentNode.data.title === song.title) {
            li.classList.add('now-playing');
        }
        
        songList.appendChild(li);
    });
}

// 顯示傳入的歌單陣列 - O(n) 遍歷與 DOM 操作
function renderList(list, currentSong) {
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
    if (!list || list.length === 0) {
        songList.innerHTML = '<li style="text-align: center; color: #999;">播放清單是空的</li>';
        return;
    }
    // O(n) 渲染排序後的清單
    list.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
        if (isPlaying && currentSong && currentSong.title === song.title) {
            li.classList.add('now-playing');
        }
        songList.appendChild(li);
    });
}

// 加入歌曲到各資料結構 - O(1) add to list tail + O(1) hashtable + O(log n) BST
function addSongToStructures(song) {
    playlistList.add(song); // O(1) 加到尾端
    const newNode = playlistList.tail; // O(1) 取得剛加入的節點
    songTable[song.title] = song; // O(1) hashtable 存歌曲
    nodeTable[song.title] = newNode; // O(1) 存節點引用，避免後續 O(n) 查找
    bst.insert(song); // O(log n) BST 插入（平均情況）
}

// 過濾 queue 的 items（簡單重建）- O(n) 重建 queue- O(n) 重建 queue
// 注意：實際上 prev/next 已改用雙向指標，此函數較少使用
function filterQueue(queue, predicate) {
    const items = queue.toArray(); // O(n)
    queue.clear(); // O(1)
    items.forEach(item => {
        if (predicate(item)) queue.enqueue(item); // O(1) per item
    });
}