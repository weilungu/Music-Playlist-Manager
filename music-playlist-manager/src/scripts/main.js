// main.js
// 簡單的播放清單管理系統
let playlist = [];
let isPlaying = false;
let currentPlayingIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化一些範例歌曲
    playlist = [
        { title: '歌曲1', artist: '歌手A' },
        { title: '歌曲2', artist: '歌手B' },
        { title: '歌曲3', artist: '歌手C' }
    ];
    
    updatePlaylistDisplay();
    
    // 新增歌曲按鈕事件
    document.getElementById('add-song-btn').addEventListener('click', () => {
        const songName = document.getElementById('song-name-input').value.trim();
        const artistName = document.getElementById('artist-name-input').value.trim();
        
        if (songName && artistName) {
            playlist.push({ title: songName, artist: artistName });
            updatePlaylistDisplay();
            
            // 清空輸入欄位
            document.getElementById('song-name-input').value = '';
            document.getElementById('artist-name-input').value = '';
        } else {
            alert('請輸入歌曲名稱和歌手名稱');
        }
    });
    
    // 刪除歌曲按鈕事件
    document.getElementById('remove-song-btn').addEventListener('click', () => {
        const songName = document.getElementById('song-name-input').value.trim();
        
        if (songName) {
            const index = playlist.findIndex(song => song.title === songName);
            if (index !== -1) {
                playlist.splice(index, 1);
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
    
    // 播放/停止按鈕
    document.getElementById('play').addEventListener('click', () => {
        const playButton = document.getElementById('play');
        
        if (!isPlaying) {
            // 開始播放
            if (playlist.length === 0) {
                alert('播放清單是空的');
                return;
            }
            
            if (currentPlayingIndex === -1) {
                currentPlayingIndex = 0; // 從第一首開始
            }
            
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
    });
    
    // 上一首按鈕
    document.getElementById('prev').addEventListener('click', () => {
        if (playlist.length === 0) {
            alert('播放清單是空的');
            return;
        }
        
        // 只有在播放時才能切換歌曲
        if (!isPlaying) {
            return;
        }
        
        if (currentPlayingIndex > 0) {
            currentPlayingIndex--;
        } else {
            currentPlayingIndex = playlist.length - 1; // 循環到最後一首
        }
        
        updatePlaylistDisplay();
    });
    
    // 下一首按鈕
    document.getElementById('next').addEventListener('click', () => {
        if (playlist.length === 0) {
            alert('播放清單是空的');
            return;
        }
        
        // 只有在播放時才能切換歌曲
        if (!isPlaying) {
            return;
        }
        
        if (currentPlayingIndex < playlist.length - 1) {
            currentPlayingIndex++;
        } else {
            currentPlayingIndex = 0; // 循環到第一首
        }
        
        updatePlaylistDisplay();
    });
    
    // 隨機播放按鈕
    document.getElementById('random').addEventListener('click', () => {
        if (playlist.length === 0) {
            alert('播放清單是空的');
            return;
        }
        
        currentPlayingIndex = Math.floor(Math.random() * playlist.length);
        
        if (!isPlaying) {
            isPlaying = true;
            const playButton = document.getElementById('play');
            playButton.textContent = '停止';
            playButton.classList.add('playing');
        }
        
        updatePlaylistDisplay();
    });
    
    // 搜尋按鈕
    document.getElementById('search-btn').addEventListener('click', () => {
        const searchTerm = document.getElementById('search-input').value.trim();
        if (searchTerm) {
            const results = playlist.filter(song => 
                song.title.includes(searchTerm) || song.artist.includes(searchTerm)
            );
            if (results.length > 0) {
                alert(`找到 ${results.length} 首歌曲：\n` + 
                      results.map(s => `${s.title} - ${s.artist}`).join('\n'));
            } else {
                alert('找不到相關歌曲');
            }
        }
    });
});

// 更新播放清單顯示
function updatePlaylistDisplay() {
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
    
    if (playlist.length === 0) {
        songList.innerHTML = '<li style="text-align: center; color: #999;">播放清單是空的</li>';
        currentPlayingIndex = -1;
        return;
    }
    
    playlist.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
        
        // 如果是當前播放的歌曲且正在播放，加上 playing 樣式
        if (isPlaying && index === currentPlayingIndex) {
            li.classList.add('now-playing');
        }
        
        songList.appendChild(li);
    });
}