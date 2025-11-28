class Song {
    constructor(title, artist, duration) {
        this.title = title;
        this.artist = artist;
        this.duration = duration; // duration in seconds
    }

    getDetails() {
        return `${this.title} by ${this.artist}, Duration: ${this.duration} seconds`;
    }
}

export default Song;