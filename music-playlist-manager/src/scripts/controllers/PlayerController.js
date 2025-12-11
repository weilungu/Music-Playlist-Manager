/**
 * PlayerController - 播放控制器
 * 
 * 時間複雜度：
 *   playSong: O(n) - 依賴 playlist.get()
 *   nextSong/previousSong: O(n) - 依賴 playSong
 *   randomSong: O(n) - 依賴 playSong
 *   searchSong: O(log n) 或 O(n) - 依賴 playlist.search 實作
 */
class PlayerController {
    /**
     * @param {Object} playlist - 要管理的播放清單物件
     */
    constructor(playlist) {
        this.playlist = playlist;
        this.currentSongIndex = 0;
    }

    /** 播放指定索引的歌曲 - O(n) */
    playSong(index) {
        if (index >= 0 && index < this.playlist.size()) {
            this.currentSongIndex = index;
            const song = this.playlist.get(index);
            console.log(`Playing: ${song.title} by ${song.artist}`);
        } else {
            console.log("Invalid song index.");
        }
    }

    /** 播放下一首（循環）- O(n) */
    nextSong() {
        if (this.currentSongIndex < this.playlist.size() - 1) {
            this.currentSongIndex++;
        } else {
            this.currentSongIndex = 0;
        }
        this.playSong(this.currentSongIndex);
    }

    /** 播放上一首（循環）- O(n) */
    previousSong() {
        if (this.currentSongIndex > 0) {
            this.currentSongIndex--;
        } else {
            this.currentSongIndex = this.playlist.size() - 1;
        }
        this.playSong(this.currentSongIndex);
    }

    /** 隨機播放 - O(n) */
    randomSong() {
        const randomIndex = Math.floor(Math.random() * this.playlist.size());
        this.playSong(randomIndex);
    }

    /** 搜尋歌曲 - O(log n) 或 O(n) */
    searchSong(title) {
        const song = this.playlist.search(title);
        if (song) {
            console.log(`Found: ${song.title} by ${song.artist}`);
        } else {
            console.log("Song not found.");
        }
    }
}

export default PlayerController;