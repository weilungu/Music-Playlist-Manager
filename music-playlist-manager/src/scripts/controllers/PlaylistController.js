class PlaylistController {
    constructor() {
        this.playlist = new LinkedList(); // 使用鏈結串列管理播放清單
        this.currentSongIndex = -1; // 當前播放歌曲的索引
    }

    addSong(song) {
        this.playlist.append(song); // 新增歌曲到播放清單
    }

    removeSong(songTitle) {
        this.playlist.remove(songTitle); // 根據曲名刪除歌曲
    }

    nextSong() {
        if (this.currentSongIndex < this.playlist.size() - 1) {
            this.currentSongIndex++;
        } else {
            this.currentSongIndex = 0; // 循環播放
        }
        return this.playlist.get(this.currentSongIndex); // 返回下一首歌曲
    }

    previousSong() {
        if (this.currentSongIndex > 0) {
            this.currentSongIndex--;
        } else {
            this.currentSongIndex = this.playlist.size() - 1; // 循環播放
        }
        return this.playlist.get(this.currentSongIndex); // 返回上一首歌曲
    }

    getCurrentSong() {
        return this.playlist.get(this.currentSongIndex); // 返回當前播放的歌曲
    }

    getPlaylist() {
        return this.playlist; // 返回整個播放清單
    }
}