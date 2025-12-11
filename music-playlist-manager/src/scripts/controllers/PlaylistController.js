/**
 * PlaylistController - 播放清單控制器
 * 
 * 時間複雜度：
 *   addSong: O(1) - 使用連結串列 append
 *   removeSong: O(n) - 需搜尋節點
 *   nextSong/previousSong: O(n) - 依賴 playlist.get()
 *   getCurrentSong: O(n) - 依賴 playlist.get()
 *   getPlaylist: O(1)
 */
class PlaylistController {
    constructor() {
        this.playlist = new LinkedList();
        this.currentSongIndex = -1;
    }

    /** 新增歌曲 - O(1) */
    addSong(song) {
        this.playlist.append(song);
    }

    /** 移除歌曲 - O(n) */
    removeSong(songTitle) {
        this.playlist.remove(songTitle);
    }

    /** 下一首（循環）- O(n) */
    nextSong() {
        if (this.currentSongIndex < this.playlist.size() - 1) {
            this.currentSongIndex++;
        } else {
            this.currentSongIndex = 0;
        }
        return this.playlist.get(this.currentSongIndex);
    }

    /** 上一首（循環）- O(n) */
    previousSong() {
        if (this.currentSongIndex > 0) {
            this.currentSongIndex--;
        } else {
            this.currentSongIndex = this.playlist.size() - 1;
        }
        return this.playlist.get(this.currentSongIndex);
    }

    /** 取得當前歌曲 - O(n) */
    getCurrentSong() {
        return this.playlist.get(this.currentSongIndex);
    }

    /** 取得播放清單 - O(1) */
    getPlaylist() {
        return this.playlist;
    }
}