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
let selectedNode = null; // 被選取的歌曲節點
let isSearchMode = false; // 是否處於搜尋模式
let searchResults = []; // 搜尋結果快取
let sortDirection = 'asc'; // 排序方向：'asc' 或 'desc'

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
            // 依目前排序指標與方向，立即重建底層順序
            const select = document.getElementById('sort-select');
            if (select) {
                const field = select.value; // 'time' | 'title' | 'artist'
                reorderUnderlyingList(field, sortDirection);
            } else {
                updatePlaylistDisplay();
            }
            updateButtonStates();
            
            // 清空輸入欄位
            document.getElementById('song-name-input').value = '';
            document.getElementById('artist-name-input').value = '';
        } else {
            alert('請輸入歌曲名稱和歌手名稱');
        }
    });
    
    // 移除「刪除歌曲」按鈕事件，改為在歌曲項目上顯示垃圾桶 icon 來刪除
    
    // 播放/停止按鈕 - O(1) 狀態切換
    document.getElementById('play').addEventListener('click', () => {
        const playButton = document.getElementById('play');
        
        if (!isPlaying) {
            // 開始播放
            if (!playlistList.head) {
                alert('播放清單是空的');
                return;
            }
            
            // 如果有選取的歌曲，從選取的歌曲開始播放
            if (selectedNode) {
                currentNode = selectedNode;
                selectedNode = null; // 播放後清除選取狀態
            } else {
                // 沒有選取時，總是從第一首開始播放
                currentNode = playlistList.head;
            }
            
            isPlaying = true;
            playButton.textContent = '停止';
            playButton.classList.add('playing');
        } else {
            // 停止播放
            isPlaying = false;
            currentNode = null; // 停止時清除當前節點，下次從頭開始
            playButton.textContent = '播放';
            playButton.classList.remove('playing');
        }
        
        updatePlaylistDisplay();
        updateButtonStates();
    });
    
    // 上一首按鈕 - O(1) 使用雙向鏈結的 prev 指標，或 O(n) 在搜尋結果中切換
    document.getElementById('prev').addEventListener('click', () => {
        if (!isPlaying) {
            return;
        }
        
        // 搜尋模式：在搜尋結果中切換
        if (isSearchMode && searchResults.length > 0) {
            navigateInSearchResults('prev');
        } else {
            // 正常模式：在完整播放清單中切換
            if (!playlistList.head) {
                alert('播放清單是空的');
                return;
            }
            
            if (!currentNode) {
                currentNode = playlistList.tail;
            } else {
                currentNode = currentNode.prev || playlistList.tail;
            }
        }
        
        updatePlaylistDisplay();
    });
    

    // 下一首按鈕 - O(1) 使用雙向鏈結的 next 指標，或 O(n) 在搜尋結果中切換
    document.getElementById('next').addEventListener('click', () => {
        if (!isPlaying) {
            return;
        }
        
        // 搜尋模式：在搜尋結果中切換
        if (isSearchMode && searchResults.length > 0) {
            navigateInSearchResults('next');
        } else {
            // 正常模式：在完整播放清單中切換
            if (!playlistList.head) {
                alert('播放清單是空的');
                return;
            }
            
            if (!currentNode) {
                currentNode = playlistList.head;
            } else {
                currentNode = currentNode.next || playlistList.head;
            }
        }
        
        updatePlaylistDisplay();
    });
    
    
    // 隨機播放按鈕 - O(n) 遍歷取隨機節點（shuffle）
    document.getElementById('random').addEventListener('click', () => {
        // 搜尋模式：在搜尋結果中隨機
        if (isSearchMode && searchResults.length > 0) {
            const randomIndex = Math.floor(Math.random() * searchResults.length);
            const randomSong = searchResults[randomIndex];
            currentNode = nodeTable[randomSong.title];
        } else {
            // 正常模式：在完整播放清單中隨機
            if (!playlistList.head) {
                alert('播放清單是空的');
                return;
            }
            const randomNode = playlistList.shuffle();
            currentNode = randomNode;
        }
        
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
            performSearch(searchTerm);
        } else {
            // 空搜尋詞，返回播放清單
            backToPlaylist();
        }
    });

    // 排序方向切換按鈕
    const sortDirectionBtn = document.getElementById('sort-direction-btn');
    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener('click', () => {
            // 切換方向
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            
            // 更新箭頭圖示
            const icon = sortDirectionBtn.querySelector('i');
            if (sortDirection === 'asc') {
                icon.className = 'fa-solid fa-arrow-up';
            } else {
                icon.className = 'fa-solid fa-arrow-down';
            }
        });
    }

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

    // 返回播放清單按鈕
    document.getElementById('back-to-playlist-btn').addEventListener('click', () => {
        backToPlaylist();
    });
});

// 更新按鈕狀態 - O(1)
function updateButtonStates() {
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const playButton = document.getElementById('play');
    
    // 播放清單為空時，播放按鈕不可按
    if (!playlistList.head) {
        playButton.disabled = true;
    } else {
        playButton.disabled = false;
    }
    
    // 上一首和下一首按鈕只有在播放時才可按
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
    // 如果處於搜尋模式，保持搜尋結果顯示
    if (isSearchMode && searchResults.length > 0) {
        renderList(searchResults, currentNode ? currentNode.data : null);
        return;
    } else if (isSearchMode && searchResults.length === 0) {
        // 搜尋模式但無結果
        const songList = document.getElementById('song-list');
        songList.innerHTML = '<li style="text-align: center; color: #999;">找不到相關歌曲</li>';
        return;
    }
    
    // 正常模式：顯示完整播放清單
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
        li.style.cursor = 'pointer'; // 整個 li 可點擊
        
        const label = document.createElement('span');
        label.textContent = `${index + 1}. ${song.title} - ${song.artist}`;

        // 建立垃圾桶 icon（hover 顯示）
        const trash = document.createElement('i');
        trash.className = 'fa-solid fa-trash song-delete';
        trash.title = '刪除';
        trash.dataset.title = song.title;

        // O(1) 比對當前播放歌曲
        if (isPlaying && currentNode && currentNode.data && currentNode.data.title === song.title) {
            li.classList.add('now-playing');
        }
        
        // 比對選取狀態
        if (selectedNode && selectedNode.data && selectedNode.data.title === song.title) {
            li.classList.add('selected');
        }
        
        // 點擊整個 li 選取/取消選取歌曲
        li.addEventListener('click', (e) => {
            // 如果點擊的是垃圾桶圖示，不觸發選取
            if (e.target.classList.contains('song-delete')) {
                return;
            }
            toggleSongSelection(song.title);
        });

        li.appendChild(label);
        li.appendChild(trash);
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
        li.style.cursor = 'pointer'; // 整個 li 可點擊
        
        const label = document.createElement('span');
        label.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
        
        const trash = document.createElement('i');
        trash.className = 'fa-solid fa-trash song-delete';
        trash.title = '刪除';
        trash.dataset.title = song.title;
        
        if (isPlaying && currentSong && currentSong.title === song.title) {
            li.classList.add('now-playing');
        }
        
        // 比對選取狀態
        if (selectedNode && selectedNode.data && selectedNode.data.title === song.title) {
            li.classList.add('selected');
        }
        
        // 點擊整個 li 選取/取消選取歌曲
        li.addEventListener('click', (e) => {
            // 如果點擊的是垃圾桶圖示，不觸發選取
            if (e.target.classList.contains('song-delete')) {
                return;
            }
            toggleSongSelection(song.title);
        });
        
        li.appendChild(label);
        li.appendChild(trash);
        songList.appendChild(li);
    });
}

// 切換歌曲選取狀態 - O(1)
function toggleSongSelection(songTitle) {
    const node = nodeTable[songTitle];
    if (!node) return;
    
    // 如果點擊的是已選取的歌曲，取消選取
    if (selectedNode && selectedNode.data && selectedNode.data.title === songTitle) {
        selectedNode = null;
    } else {
        // 選取新歌曲
        selectedNode = node;
    }
    
    // 更新顯示
    updatePlaylistDisplay();
}

// 加入歌曲到各資料結構 - O(1) add to list tail + O(1) hashtable + O(log n) BST
function addSongToStructures(song) {
    // 設定加入時間戳（毫秒）供排序使用
    if (!song.addedAt) {
        song.addedAt = Date.now();
    }
    const node = playlistList.add(song); // O(1) 加到尾端暫存，稍後重排
    songTable[song.title] = song; // O(1) hashtable 存歌曲
    nodeTable[song.title] = node; // O(1) 存節點引用
    bst.insert(song); // 仍以標題插入 BST 做搜尋 / 顯示用
}

// 過濾 queue 的 items（簡單重建）- O(n) 重建 queue- O(n) 重建 queue
// 事件委派：處理垃圾桶 icon 的點擊刪除
document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.classList && target.classList.contains('song-delete')) {
        const title = target.dataset.title;
        const song = songTable[title];
        const node = nodeTable[title];
        if (song && node) {
            // 調整當前播放節點
            if (currentNode === node) {
                currentNode = currentNode.next || currentNode.prev || null;
            }
            
            // 調整選取節點
            if (selectedNode === node) {
                selectedNode = null;
            }
            
            // 從資料結構中刪除
            playlistList.removeNode(node);
            bst.delete(title);
            delete songTable[title];
            delete nodeTable[title];
            filterQueue(nextQueue, s => s.title !== title);
            filterQueue(prevQueue, s => s.title !== title);
            
            // 如果處於搜尋模式，也要從搜尋結果中移除
            if (isSearchMode && searchResults.length > 0) {
                searchResults = searchResults.filter(s => s.title !== title);
                // 如果搜尋結果變空，更新標題
                if (searchResults.length === 0) {
                    const playlistTitle = document.getElementById('playlist-title');
                    playlistTitle.textContent = '搜尋結果 (0)';
                } else {
                    const playlistTitle = document.getElementById('playlist-title');
                    playlistTitle.textContent = `搜尋結果 (${searchResults.length})`;
                }
            }
            
            updatePlaylistDisplay();
            updateButtonStates();
        }
    }
});
// 注意：實際上 prev/next 已改用雙向指標，此函數較少使用
function filterQueue(queue, predicate) {
    const items = queue.toArray(); // O(n)
    queue.clear(); // O(1)
    items.forEach(item => {
        if (predicate(item)) queue.enqueue(item); // O(1) per item
    });
}

// 依下拉式選單與方向進行排序並渲染
function renderSortedBySelection() {
    const select = document.getElementById('sort-select');
    if (!select) return;
    const field = select.value; // 'time' | 'title' | 'artist'
    reorderUnderlyingList(field, sortDirection);
}

// 綁定下拉選單變更與方向按鈕點擊以重新渲染排序
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('sort-select');
    if (select) {
        select.addEventListener('change', () => {
            renderSortedBySelection();
        });
    }
    const sortDirectionBtn = document.getElementById('sort-direction-btn');
    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener('click', () => {
            renderSortedBySelection();
        });
    }
});

// 重新依指定欄位與方向重建底層串列順序
function reorderUnderlyingList(field, direction) {
    const arr = playlistList.toArray();
    if (!arr || arr.length === 0) {
        updatePlaylistDisplay();
        return;
    }
    const currentTitle = currentNode && currentNode.data && currentNode.data.title;
    // 產生排序 key
    const keyFn = (s) => {
        if (field === 'time') return Number(s.addedAt || 0);
        if (field === 'title') return (s.title || '').trim().toLowerCase().charAt(0);
        if (field === 'artist') return (s.artist || '').trim().toLowerCase();
        return (s.title || '').trim().toLowerCase();
    };
    arr.sort((a, b) => {
        const ka = keyFn(a);
        const kb = keyFn(b);
        if (ka < kb) return -1;
        if (ka > kb) return 1;
        // 次要比較保持穩定：用完整標題
        const ta = (a.title || '').toLowerCase();
        const tb = (b.title || '').toLowerCase();
        if (ta < tb) return -1;
        if (ta > tb) return 1;
        return 0;
    });
    if (direction === 'desc') arr.reverse();

    // 清空並重建串列與節點對照
    playlistList.clear();
    Object.keys(nodeTable).forEach(k => delete nodeTable[k]);
    currentNode = null;
    arr.forEach(song => {
        const node = playlistList.add(song);
        nodeTable[song.title] = node;
        if (currentTitle && song.title === currentTitle) {
            currentNode = node;
        }
    });
    // 若原播放節點不存在則重置
    if (!currentNode && isPlaying) {
        currentNode = playlistList.head;
    }
    updatePlaylistDisplay();
}

// 執行搜尋 - O(1) + O(n)
function performSearch(searchTerm) {
    // O(1) 使用 hashtable 依歌曲名查找
    const byTitle = songTable[searchTerm];
    
    // O(n) 模糊搜尋：歌曲名或歌手名包含搜尋詞
    const allSongs = Object.values(songTable);
    const fuzzyResults = allSongs.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // 去重（精確匹配優先）
    const results = [];
    const addedTitles = new Set();
    
    if (byTitle) {
        results.push(byTitle);
        addedTitles.add(byTitle.title);
    }
    
    fuzzyResults.forEach(song => {
        if (!addedTitles.has(song.title)) {
            results.push(song);
            addedTitles.add(song.title);
        }
    });
    
    // 切換到搜尋模式並顯示結果
    isSearchMode = true;
    searchResults = results;
    
    // 更新標題與按鈕顯示
    const playlistTitle = document.getElementById('playlist-title');
    const backButton = document.getElementById('back-to-playlist-btn');
    
    if (results.length > 0) {
        playlistTitle.textContent = `搜尋結果 (${results.length})`;
        backButton.style.display = 'inline-block';
        renderList(results, currentNode ? currentNode.data : null);
    } else {
        playlistTitle.textContent = '搜尋結果 (0)';
        backButton.style.display = 'inline-block';
        const songList = document.getElementById('song-list');
        songList.innerHTML = '<li style="text-align: center; color: #999;">找不到相關歌曲</li>';
    }
}

// 在搜尋結果中導航 - O(n) 查找當前歌曲索引
function navigateInSearchResults(direction) {
    if (!searchResults || searchResults.length === 0) {
        return;
    }
    
    // 找到當前歌曲在搜尋結果中的索引
    let currentIndex = -1;
    if (currentNode && currentNode.data) {
        currentIndex = searchResults.findIndex(s => s.title === currentNode.data.title);
    }
    
    // 如果找不到當前歌曲，從第一首開始
    if (currentIndex === -1) {
        currentIndex = 0;
    } else {
        // 根據方向切換
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % searchResults.length; // 循環到第一首
        } else if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + searchResults.length) % searchResults.length; // 循環到最後一首
        }
    }
    
    // 更新 currentNode
    const nextSong = searchResults[currentIndex];
    currentNode = nodeTable[nextSong.title];
}

// 返回播放清單 - O(1)
function backToPlaylist() {
    isSearchMode = false;
    searchResults = [];
    
    // 恢復標題與隱藏按鈕
    const playlistTitle = document.getElementById('playlist-title');
    const backButton = document.getElementById('back-to-playlist-btn');
    const searchInput = document.getElementById('search-input');
    
    playlistTitle.textContent = '播放清單';
    backButton.style.display = 'none';
    searchInput.value = ''; // 清空搜尋框
    
    // 重新顯示播放清單
    updatePlaylistDisplay();
}
