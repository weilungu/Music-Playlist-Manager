class PlayerController {
    constructor(playlist) {
        this.playlist = playlist; // The playlist to manage
        this.currentSongIndex = 0; // Index of the currently playing song
    }

    playSong(index) {
        if (index >= 0 && index < this.playlist.size()) {
            this.currentSongIndex = index;
            const song = this.playlist.get(index);
            console.log(`Playing: ${song.title} by ${song.artist}`);
        } else {
            console.log("Invalid song index.");
        }
    }

    nextSong() {
        if (this.currentSongIndex < this.playlist.size() - 1) {
            this.currentSongIndex++;
        } else {
            this.currentSongIndex = 0; // Loop back to the start
        }
        this.playSong(this.currentSongIndex);
    }

    previousSong() {
        if (this.currentSongIndex > 0) {
            this.currentSongIndex--;
        } else {
            this.currentSongIndex = this.playlist.size() - 1; // Loop to the end
        }
        this.playSong(this.currentSongIndex);
    }

    randomSong() {
        const randomIndex = Math.floor(Math.random() * this.playlist.size());
        this.playSong(randomIndex);
    }

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