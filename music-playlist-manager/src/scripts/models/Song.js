/**
 * Song - 歌曲資料模型
 * 
 * 所有操作皆為 O(1)
 */
class Song {
    /**
     * @param {string} title - 歌曲標題
     * @param {string} artist - 歌手名稱
     * @param {number} duration - 歌曲長度（秒）
     */
    constructor(title, artist, duration) {
        this.title = title;
        this.artist = artist;
        this.duration = duration;
    }

    /** 取得歌曲詳細資訊字串 - O(1) */
    getDetails() {
        return `${this.title} by ${this.artist}, Duration: ${this.duration} seconds`;
    }
}

export default Song;