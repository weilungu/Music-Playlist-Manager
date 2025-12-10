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
let selectedAudioFile = null; // 選取的音訊檔案
let audioFileMap = {}; // 歌曲名稱+歌手 -> File 物件的映射

// localStorage 相關常數
const PLAYLIST_STORAGE_KEY = 'musicPlaylist';
const SORT_DIRECTION_STORAGE_KEY = 'sortDirection';
const AUDIO_FILES_STORAGE_KEY = 'musicAudioFiles';

// IndexedDB 相關
const DB_NAME = 'MusicPlaylistDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';

let db = null;

// 保存播放清單到 localStorage
function savePlaylistToStorage() {
    try {
        const playlistArray = playlistList.toArray();
        const playlistData = JSON.stringify(playlistArray);
        localStorage.setItem(PLAYLIST_STORAGE_KEY, playlistData);
    } catch (e) {
        console.error('儲存播放清單到 localStorage 失敗:', e);
    }
}

// 保存播放清單和音訊檔案到 localStorage
async function savePlaylistAndAudioToStorage() {
    savePlaylistToStorage();
    await saveAudioFilesToStorage();
}

// 從 localStorage 加載播放清單
function loadPlaylistFromStorage() {
    try {
        const playlistData = localStorage.getItem(PLAYLIST_STORAGE_KEY);
        if (playlistData) {
            const playlistArray = JSON.parse(playlistData);
            return playlistArray;
        }
    } catch (e) {
        console.error('從 localStorage 加載播放清單失敗:', e);
    }
    return [];
}

// 保存排序方向到 localStorage
function saveSortDirectionToStorage() {
    try {
        localStorage.setItem(SORT_DIRECTION_STORAGE_KEY, sortDirection);
    } catch (e) {
        console.error('儲存排序方向到 localStorage 失敗:', e);
    }
}

// 從 localStorage 加載排序方向
function loadSortDirectionFromStorage() {
    try {
        const direction = localStorage.getItem(SORT_DIRECTION_STORAGE_KEY);
        if (direction && (direction === 'asc' || direction === 'desc')) {
            return direction;
        }
    } catch (e) {
        console.error('從 localStorage 加載排序方向失敗:', e);
    }
    return 'asc';
}

// 初始化 IndexedDB
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB 開啟失敗:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB 初始化成功');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'key' });
                console.log('建立 IndexedDB 物件儲存區');
            }
        };
    });
}

// 儲存檔案到 IndexedDB
async function saveFileToIndexedDB(key, file) {
    if (!db) {
        await initIndexedDB();
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ key, file });
        
        request.onerror = () => {
            console.error(`保存檔案 ${key} 到 IndexedDB 失敗:`, request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            console.log(`成功保存檔案 ${key} 到 IndexedDB`);
            resolve();
        };
    });
}

// 從 IndexedDB 加載檔案
async function loadFileFromIndexedDB(key) {
    if (!db) {
        await initIndexedDB();
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onerror = () => {
            console.error(`加載檔案 ${key} 從 IndexedDB 失敗:`, request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            if (request.result && request.result.file) {
                console.log(`成功加載檔案 ${key} 從 IndexedDB`);
                resolve(request.result.file);
            } else {
                resolve(null);
            }
        };
    });
}

// 刪除檔案從 IndexedDB
async function deleteFileFromIndexedDB(key) {
    if (!db) {
        await initIndexedDB();
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        
        request.onerror = () => {
            console.error(`刪除檔案 ${key} 從 IndexedDB 失敗:`, request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            console.log(`成功刪除檔案 ${key} 從 IndexedDB`);
            resolve();
        };
    });
}

// 從 IndexedDB 加載所有音訊檔案
async function loadAllAudioFilesFromIndexedDB() {
    if (!db) {
        await initIndexedDB();
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onerror = () => {
            console.error('加載所有檔案從 IndexedDB 失敗:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            const results = request.result;
            console.log(`從 IndexedDB 加載 ${results.length} 個檔案`);
            resolve(results);
        };
    });
}
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result); // Data URL 格式：data:audio/mpeg;base64,...
        };
        reader.onerror = () => {
            reject(reader.error);
        };
        reader.readAsDataURL(file);
    });
}

// 將 Base64 字符串轉換回 File 物件
function base64ToFile(base64Data, filename, mimeType = 'audio/mpeg') {
    try {
        // 處理 Data URL 格式
        let base64String = base64Data;
        if (base64Data.includes(',')) {
            base64String = base64Data.split(',')[1];
        }
        
        const bstr = atob(base64String);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
        }
        
        return new File([u8arr], filename, { type: mimeType });
    } catch (e) {
        console.error(`base64ToFile 轉換失敗:`, e);
        return null;
    }
}

// 保存音訊檔案到 IndexedDB 和 localStorage
async function saveAudioFilesToStorage() {
    try {
        // 首先嘗試保存到 IndexedDB（更適合大檔案）
        console.log('開始保存音訊檔案到 IndexedDB...');
        for (const [key, file] of Object.entries(audioFileMap)) {
            try {
                await saveFileToIndexedDB(key, file);
            } catch (e) {
                console.error(`保存檔案 ${key} 到 IndexedDB 失敗:`, e);
            }
        }
        
        // 同時保存到 localStorage（作為備份，只保存檔案資訊）
        try {
            const audioFilesInfo = {};
            for (const [key, file] of Object.entries(audioFileMap)) {
                audioFilesInfo[key] = {
                    filename: file.name,
                    type: file.type,
                    lastModified: file.lastModified,
                    size: file.size
                };
            }
            localStorage.setItem(AUDIO_FILES_STORAGE_KEY, JSON.stringify(audioFilesInfo));
            console.log('成功保存音訊檔案資訊到 localStorage');
        } catch (e) {
            console.warn('保存到 localStorage 失敗（可能空間不足）:', e);
        }
    } catch (e) {
        console.error('儲存音訊檔案失敗:', e);
    }
}

// 從 IndexedDB 和 localStorage 加載音訊檔案
async function loadAudioFilesFromStorage() {
    try {
        console.log('開始加載音訊檔案...');
        audioFileMap = {};
        
        // 首先嘗試從 IndexedDB 加載
        try {
            const files = await loadAllAudioFilesFromIndexedDB();
            for (const item of files) {
                if (item.file) {
                    audioFileMap[item.key] = item.file;
                    console.log(`成功從 IndexedDB 加載: ${item.key}`);
                }
            }
            
            if (Object.keys(audioFileMap).length > 0) {
                console.log(`共從 IndexedDB 加載 ${Object.keys(audioFileMap).length} 個檔案`);
                return true;
            }
        } catch (e) {
            console.warn('從 IndexedDB 加載失敗（可能瀏覽器不支持），嘗試 localStorage:', e);
        }
        
        // 如果 IndexedDB 失敗或無檔案，嘗試從 localStorage 加載備份
        try {
            const audioFilesInfo = localStorage.getItem(AUDIO_FILES_STORAGE_KEY);
            if (audioFilesInfo) {
                const parsedInfo = JSON.parse(audioFilesInfo);
                console.log('找到 localStorage 備份，共', Object.keys(parsedInfo).length, '個檔案');
                // localStorage 中只有檔案資訊，實際檔案應該在 IndexedDB 中
                // 如果都沒有，則檔案遺失
                return Object.keys(audioFileMap).length > 0;
            }
        } catch (e) {
            console.warn('從 localStorage 加載備份失敗:', e);
        }
        
        return Object.keys(audioFileMap).length > 0;
    } catch (e) {
        console.error('從儲存加載音訊檔案失敗:', e);
        return false;
    }
}

// 計算播放清單中「歌手${n}」的最高編號
function getMaxArtistNumber() {
    const allSongs = playlistList.toArray();
    let maxNumber = 0;
    
    allSongs.forEach(song => {
        const match = song.artist.match(/^歌手(\d+)$/);
        if (match) {
            const number = parseInt(match[1], 10);
            if (number > maxNumber) {
                maxNumber = number;
            }
        }
    });
    
    return maxNumber;
}

// 播放當前歌曲
function playCurrentSong() {
    if (!currentNode || !currentNode.data) {
        console.error('沒有要播放的歌曲');
        return false;
    }
    
    const song = currentNode.data;
    const fileKey = `${song.title}||${song.artist}`;
    const file = audioFileMap[fileKey];
    
    if (!file) {
        alert(`找不到歌曲「${song.title}」的音訊檔案`);
        return false;
    }
    
    const audioPlayer = document.getElementById('audio-player');
    const fileUrl = URL.createObjectURL(file);
    audioPlayer.src = fileUrl;
    audioPlayer.play().catch(err => {
        console.error('播放音訊失敗:', err);
        return false;
    });
    
    return true;
}

// 停止播放當前歌曲
function stopCurrentSong() {
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== 頁面加載開始 ===');
    console.log('localStorage 中的鍵:', Object.keys(localStorage));
    
    // 從 localStorage 加載排序方向
    sortDirection = loadSortDirectionFromStorage();
    console.log('加載排序方向:', sortDirection);
    
    // 從 localStorage 加載播放清單
    let savedSongs = loadPlaylistFromStorage();
    console.log('加載播放清單，共', savedSongs.length, '首歌曲');
    
    // 如果 localStorage 沒有資料，使用範例歌曲
    if (savedSongs.length === 0) {
        console.log('使用範例歌曲');
        savedSongs = [
            { title: '歌曲1', artist: '歌手A', addedAt: Date.now() },
            { title: '歌曲2', artist: '歌手B', addedAt: Date.now() },
            { title: '歌曲3', artist: '歌手C', addedAt: Date.now() }
        ];
    }
    
    // 初始化播放清單資料
    savedSongs.forEach(song => {
        addSongToStructures(song);
    });
    
    // 從 localStorage 加載音訊檔案
    console.log('開始加載音訊檔案...');
    await loadAudioFilesFromStorage();
    console.log('音訊檔案加載完成，共', Object.keys(audioFileMap).length, '個檔案');
    
    // 更新排序方向按鈕的箭頭圖示
    const sortDirectionBtn = document.getElementById('sort-direction-btn');
    if (sortDirectionBtn) {
        const icon = sortDirectionBtn.querySelector('i');
        if (sortDirection === 'asc') {
            icon.className = 'fa-solid fa-arrow-up';
        } else {
            icon.className = 'fa-solid fa-arrow-down';
        }
    }
    
    updatePlaylistDisplay();
    updateButtonStates();
    
    // 選取檔案按鈕事件
    document.getElementById('select-file-btn').addEventListener('click', () => {
        document.getElementById('audio-file-input').click();
    });
    
    // 檔案輸入變更事件
    document.getElementById('audio-file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedAudioFile = file;
            const fileName = file.name;
            document.getElementById('selected-file-name').textContent = `已選取: ${fileName}`;
            document.getElementById('selected-file-name').style.display = 'inline';
            
            // 從檔案名稱提取歌曲名稱（移除副檔名）
            const songNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
            document.getElementById('song-name-input').value = songNameWithoutExtension;
            
            // 自動填入歌手名稱（根據播放清單中現有的最高編號）
            const maxNumber = getMaxArtistNumber();
            document.getElementById('artist-name-input').value = `歌手${maxNumber + 1}`;
        } else {
            selectedAudioFile = null;
            document.getElementById('selected-file-name').textContent = '';
            document.getElementById('selected-file-name').style.display = 'none';
        }
    });
    
    // 新增歌曲按鈕事件 - O(1) hashtable insert + O(log n) BST insert
    document.getElementById('add-song-btn').addEventListener('click', async () => {
        // 檢查是否選取檔案
        if (!selectedAudioFile) {
            alert('請新增檔案');
            return;
        }
        
        const songName = document.getElementById('song-name-input').value.trim();
        const artistName = document.getElementById('artist-name-input').value.trim();
        
        if (songName && artistName) {
            // 檢查歌曲和歌手是否已存在
            const existingSong = playlistList.toArray().find(song => 
                song.title === songName && song.artist === artistName
            );
            
            if (existingSong) {
                alert('已存在此歌曲及歌手');
                return;
            }
            
            const song = { title: songName, artist: artistName };
            addSongToStructures(song);
            // 記錄檔案映射
            const fileKey = `${songName}||${artistName}`;
            audioFileMap[fileKey] = selectedAudioFile;
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
            
            // 儲存到 localStorage（包含音訊檔案）
            await savePlaylistAndAudioToStorage();
            
            // 清空輸入欄位
            document.getElementById('song-name-input').value = '';
            document.getElementById('artist-name-input').value = '';
            // 清空選取的檔案
            selectedAudioFile = null;
            document.getElementById('audio-file-input').value = '';
            document.getElementById('selected-file-name').textContent = '';
            document.getElementById('selected-file-name').style.display = 'none';
        } else {
            alert('請輸入歌曲名稱和歌手名稱');
        }
    });
    
    // 移除「刪除歌曲」按鈕事件，改為在歌曲項目上顯示垃圾桶 icon 來刪除
    
    // 音訊播放器結束事件 - 自動播放下一首
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.addEventListener('ended', () => {
        if (!isPlaying) {
            return;
        }
        
        // 搜尋模式：在搜尋結果中切換到下一首
        if (isSearchMode && searchResults.length > 0) {
            navigateInSearchResults('next');
        } else {
            // 正常模式：在完整播放清單中切換到下一首
            if (!playlistList.head) {
                // 播放清單已空，停止播放
                isPlaying = false;
                currentNode = null;
                const playButton = document.getElementById('play');
                playButton.textContent = '播放';
                playButton.classList.remove('playing');
                updatePlaylistDisplay();
                return;
            }
            
            if (!currentNode) {
                currentNode = playlistList.head;
            } else {
                currentNode = currentNode.next || playlistList.head; // 循環到第一首
            }
        }
        
        // 播放下一首歌曲
        const playSuccess = playCurrentSong();
        
        if (playSuccess === false) {
            // 播放失敗，停止播放
            isPlaying = false;
            currentNode = null;
            const playButton = document.getElementById('play');
            playButton.textContent = '播放';
            playButton.classList.remove('playing');
        }
        
        updatePlaylistDisplay();
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
            
            // 如果有選取的歌曲，從選取的歌曲開始播放
            if (selectedNode) {
                currentNode = selectedNode;
                selectedNode = null; // 播放後清除選取狀態
            } else if (isSearchMode && searchResults.length > 0) {
                // 搜尋模式下，從搜尋結果的第一首開始
                const firstSong = searchResults[0];
                const nodeKey = `${firstSong.title}||${firstSong.artist}`;
                currentNode = nodeTable[nodeKey];
            } else {
                // 正常模式，從第一首開始播放
                currentNode = playlistList.head;
            }
            
            // 播放當前歌曲
            const playSuccess = playCurrentSong();
            
            if (playSuccess !== false) {
                isPlaying = true;
                playButton.textContent = '停止';
                playButton.classList.add('playing');
            } else {
                // 播放失敗，重置狀態
                isPlaying = false;
                currentNode = null;
            }
        } else {
            // 停止播放
            isPlaying = false;
            currentNode = null; // 停止時清除當前節點，下次從頭開始
            playButton.textContent = '播放';
            playButton.classList.remove('playing');
            
            // 停止音樂
            stopCurrentSong();
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
        
        // 播放上一首歌曲
        const playSuccess = playCurrentSong();
        
        if (playSuccess === false) {
            // 播放失敗，停止播放
            isPlaying = false;
            currentNode = null;
            const playButton = document.getElementById('play');
            playButton.textContent = '播放';
            playButton.classList.remove('playing');
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
        
        // 播放下一首歌曲
        const playSuccess = playCurrentSong();
        
        if (playSuccess === false) {
            // 播放失敗，停止播放
            isPlaying = false;
            currentNode = null;
            const playButton = document.getElementById('play');
            playButton.textContent = '播放';
            playButton.classList.remove('playing');
        }
        
        updatePlaylistDisplay();
    });
    
    
    // 隨機播放按鈕 - O(n) 遍歷取隨機節點（shuffle）
    document.getElementById('random').addEventListener('click', () => {
        // 搜尋模式：在搜尋結果中隨機
        if (isSearchMode && searchResults.length > 0) {
            const randomIndex = Math.floor(Math.random() * searchResults.length);
            const randomSong = searchResults[randomIndex];
            const nodeKey = `${randomSong.title}||${randomSong.artist}`;
            currentNode = nodeTable[nodeKey];
        } else {
            // 正常模式：在完整播放清單中隨機
            if (!playlistList.head) {
                alert('播放清單是空的');
                return;
            }
            const randomNode = playlistList.shuffle();
            currentNode = randomNode;
        }
        
        // 播放隨機選擇的歌曲
        const playSuccess = playCurrentSong();
        
        if (playSuccess !== false) {
            if (!isPlaying) {
                isPlaying = true;
                const playButton = document.getElementById('play');
                playButton.textContent = '停止';
                playButton.classList.add('playing');
            }
        } else {
            // 播放失敗，停止播放
            isPlaying = false;
            currentNode = null;
            const playButton = document.getElementById('play');
            playButton.textContent = '播放';
            playButton.classList.remove('playing');
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

    // 排序方向切換按鈕已在初始化時設定，此處直接新增事件監聽器
    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener('click', () => {
            // 切換方向
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            
            // 保存排序方向到 localStorage
            saveSortDirectionToStorage();
            
            // 更新箭頭圖示
            const icon = sortDirectionBtn.querySelector('i');
            if (sortDirection === 'asc') {
                icon.className = 'fa-solid fa-arrow-up';
            } else {
                icon.className = 'fa-solid fa-arrow-down';
            }
            
            // 觸發排序更新
            renderSortedBySelection();
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
    
    // 點擊空白處取消選取
    document.addEventListener('click', (e) => {
        // 由於歌曲點擊事件已阻止冒泡，此處只會接收到非歌曲項目的點擊
        if (selectedNode) {
            selectedNode = null;
            updatePlaylistDisplay();
        }
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
        
        // 檢查音訊檔案是否存在
        const fileKey = `${song.title}||${song.artist}`;
        const hasAudio = audioFileMap[fileKey] !== undefined;
        
        if (!hasAudio) {
            li.classList.add('missing-audio');
        }
        
        const label = document.createElement('span');
        label.textContent = `${index + 1}. ${song.title} - ${song.artist}`;

        // O(1) 比對當前播放歌曲
        if (isPlaying && currentNode && currentNode.data && currentNode.data.title === song.title && currentNode.data.artist === song.artist) {
            li.classList.add('now-playing');
        }
        
        // 比對選取狀態
        const isSelected = selectedNode && selectedNode.data && selectedNode.data.title === song.title && selectedNode.data.artist === song.artist;
        if (isSelected) {
            li.classList.add('selected');
        }
        
        // 添加 label
        li.appendChild(label);
        
        // 始終添加鉛筆 icon（通過 CSS 控制顯示）
        const edit = document.createElement('i');
        edit.className = 'fa-solid fa-pen song-edit';
        edit.title = '編輯';
        edit.dataset.title = song.title;
        edit.dataset.artist = song.artist;
        li.appendChild(edit);
        
        // 始終添加垃圾桶 icon（通過 CSS 控制顯示）
        const trash = document.createElement('i');
        trash.className = 'fa-solid fa-trash song-delete';
        trash.title = '刪除';
        trash.dataset.title = song.title;
        trash.dataset.artist = song.artist;
        li.appendChild(trash);
        
        // 點擊整個 li 選取/取消選取歌曲
        li.addEventListener('click', (e) => {
            // 如果點擊的是垃圾桶或鉛筆圖示，不觸發選取
            if (e.target.classList.contains('song-delete') || e.target.classList.contains('song-edit')) {
                return;
            }
            e.stopPropagation(); // 阻止事件冒泡到 document
            toggleSongSelection(song.title, song.artist);
        });

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
        
        // 檢查音訊檔案是否存在
        const fileKey = `${song.title}||${song.artist}`;
        const hasAudio = audioFileMap[fileKey] !== undefined;
        
        if (!hasAudio) {
            li.classList.add('missing-audio');
        }
        
        const label = document.createElement('span');
        label.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
        
        if (isPlaying && currentSong && currentSong.title === song.title && currentSong.artist === song.artist) {
            li.classList.add('now-playing');
        }
        
        // 比對選取狀態
        const isSelected = selectedNode && selectedNode.data && selectedNode.data.title === song.title && selectedNode.data.artist === song.artist;
        if (isSelected) {
            li.classList.add('selected');
        }
        
        // 添加 label
        li.appendChild(label);
        
        // 始終添加鉛筆 icon（通過 CSS 控制顯示）
        const edit = document.createElement('i');
        edit.className = 'fa-solid fa-pen song-edit';
        edit.title = '編輯';
        edit.dataset.title = song.title;
        edit.dataset.artist = song.artist;
        li.appendChild(edit);
        
        // 始終添加垃圾桶 icon（通過 CSS 控制顯示）
        const trash = document.createElement('i');
        trash.className = 'fa-solid fa-trash song-delete';
        trash.title = '刪除';
        trash.dataset.title = song.title;
        trash.dataset.artist = song.artist;
        li.appendChild(trash);
        
        // 點擊整個 li 選取/取消選取歌曲
        li.addEventListener('click', (e) => {
            // 如果點擊的是垃圾桶或鉛筆圖示，不觸發選取
            if (e.target.classList.contains('song-delete') || e.target.classList.contains('song-edit')) {
                return;
            }
            e.stopPropagation(); // 阻止事件冒泡到 document
            toggleSongSelection(song.title, song.artist);
        });
        
        songList.appendChild(li);
    });
}

// 切換歌曲選取狀態 - O(1)
function toggleSongSelection(songTitle, artistName) {
    const nodeKey = `${songTitle}||${artistName}`;
    const node = nodeTable[nodeKey];
    if (!node) return;
    
    // 如果正在播放該歌曲，不允許選取
    if (isPlaying && currentNode && currentNode.data && currentNode.data.title === songTitle) {
        return;
    }
    
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
    // 使用「歌曲名稱+歌手」組合作為節點表的鍵，避免相同名稱但不同歌手的歌曲衝突
    const nodeKey = `${song.title}||${song.artist}`;
    nodeTable[nodeKey] = node; // O(1) 存節點引用
    bst.insert(song); // 仍以標題插入 BST 做搜尋 / 顯示用
    
    // 保存到 localStorage
    savePlaylistToStorage();
}

// 過濾 queue 的 items（簡單重建）- O(n) 重建 queue- O(n) 重建 queue
// 事件委派：處理垃圾桶 icon 的點擊刪除
document.addEventListener('click', async (e) => {
    const target = e.target;
    if (target && target.classList && target.classList.contains('song-delete')) {
        const title = target.dataset.title;
        const artist = target.dataset.artist;
        const song = songTable[title];
        const nodeKey = `${title}||${artist}`;
        const node = nodeTable[nodeKey];
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
            delete nodeTable[nodeKey];
            // 也刪除音訊檔案映射
            delete audioFileMap[nodeKey];
            // 從 IndexedDB 中刪除檔案
            await deleteFileFromIndexedDB(nodeKey).catch(err => {
                console.warn(`從 IndexedDB 刪除檔案 ${nodeKey} 失敗:`, err);
            });
            filterQueue(nextQueue, s => s.title !== title);
            filterQueue(prevQueue, s => s.title !== title);
            
            // 如果處於搜尋模式，也要從搜尋結果中移除
            if (isSearchMode && searchResults.length > 0) {
                searchResults = searchResults.filter(s => !(s.title === title && s.artist === artist));
                // 如果搜尋結果變空，更新標題
                if (searchResults.length === 0) {
                    const playlistTitle = document.getElementById('playlist-title');
                    playlistTitle.textContent = '搜尋結果 (0)';
                } else {
                    const playlistTitle = document.getElementById('playlist-title');
                    playlistTitle.textContent = `搜尋結果 (${searchResults.length})`;
                }
            }
            
            // 保存到 localStorage（包含音訊檔案）
            await savePlaylistAndAudioToStorage();
            
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
    
    // 如果處於搜尋模式，對搜尋結果進行排序
    if (isSearchMode && searchResults.length > 0) {
        sortSearchResults(field, sortDirection);
    } else {
        // 正常模式，重新排序底層播放清單
        reorderUnderlyingList(field, sortDirection);
    }
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
    
    // 處理編輯 icon 點擊
    document.getElementById('song-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('song-edit')) {
            const title = e.target.dataset.title;
            const artist = e.target.dataset.artist;
            openEditModal(title, artist);
        }
    });
    
    // 處理 modal 關閉
    document.getElementById('cancel-edit-btn').addEventListener('click', closeEditModal);
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') {
            closeEditModal();
        }
    });
    
    // 處理編輯保存
    document.getElementById('save-edit-btn').addEventListener('click', saveEdit);
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
        const nodeKey = `${song.title}||${song.artist}`;
        nodeTable[nodeKey] = node;
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

// 對搜尋結果進行排序 - O(n log n)
function sortSearchResults(field, direction) {
    if (!searchResults || searchResults.length === 0) return;
    
    const currentTitle = currentNode && currentNode.data && currentNode.data.title;
    
    // 產生排序 key
    const keyFn = (s) => {
        if (field === 'time') return Number(s.addedAt || 0);
        if (field === 'title') return (s.title || '').trim().toLowerCase();
        if (field === 'artist') return (s.artist || '').trim().toLowerCase();
        return (s.title || '').trim().toLowerCase();
    };
    
    searchResults.sort((a, b) => {
        const ka = keyFn(a);
        const kb = keyFn(b);
        if (ka < kb) return -1;
        if (ka > kb) return 1;
        // 次要比較：用完整標題
        const ta = (a.title || '').toLowerCase();
        const tb = (b.title || '').toLowerCase();
        if (ta < tb) return -1;
        if (ta > tb) return 1;
        return 0;
    });
    
    if (direction === 'desc') searchResults.reverse();
    
    // 更新搜尋結果數量標題
    const playlistTitle = document.getElementById('playlist-title');
    playlistTitle.textContent = `搜尋結果 (${searchResults.length})`;
    
    // 重新渲染
    renderList(searchResults, currentNode ? currentNode.data : null);
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
    const nodeKey = `${nextSong.title}||${nextSong.artist}`;
    currentNode = nodeTable[nodeKey];
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

// 打開編輯 modal
let editingOriginalTitle = '';
let editingOriginalArtist = '';

function openEditModal(title, artist) {
    editingOriginalTitle = title;
    editingOriginalArtist = artist;
    
    document.getElementById('edit-title-input').value = title;
    document.getElementById('edit-artist-input').value = artist;
    document.getElementById('edit-modal').style.display = 'flex';
}

// 關閉編輯 modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingOriginalTitle = '';
    editingOriginalArtist = '';
}

// 保存編輯
async function saveEdit() {
    const newTitle = document.getElementById('edit-title-input').value.trim();
    const newArtist = document.getElementById('edit-artist-input').value.trim();
    
    if (!newTitle || !newArtist) {
        alert('歌曲名稱與歌手不可為空');
        return;
    }
    
    const oldKey = `${editingOriginalTitle}||${editingOriginalArtist}`;
    const newKey = `${newTitle}||${newArtist}`;
    
    // 檢查是否修改
    if (oldKey === newKey) {
        closeEditModal();
        return;
    }
    
    // 檢查新名稱是否已存在
    if (nodeTable[newKey]) {
        alert(`歌曲「${newTitle} - ${newArtist}」已存在於播放清單中`);
        return;
    }
    
    // 更新資料結構
    const node = nodeTable[oldKey];
    if (node) {
        // 更新節點資料
        node.data.title = newTitle;
        node.data.artist = newArtist;
        
        // 更新 nodeTable
        delete nodeTable[oldKey];
        nodeTable[newKey] = node;
        
        // 更新 songTable
        delete songTable[editingOriginalTitle];
        songTable[newTitle] = node.data;
        
        // 更新 audioFileMap
        if (audioFileMap[oldKey]) {
            audioFileMap[newKey] = audioFileMap[oldKey];
            delete audioFileMap[oldKey];
        }
        
        // 儲存到 localStorage（包含音訊檔案）
        await savePlaylistAndAudioToStorage();
        
        // 重新顯示
        if (isSearchMode) {
            performSearch(document.getElementById('search-input').value);
        } else {
            updatePlaylistDisplay();
        }
    }
    
    closeEditModal();
}
