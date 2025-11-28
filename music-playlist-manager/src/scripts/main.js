// main.js
import PlaylistController from './controllers/PlaylistController.js';
import PlayerController from './controllers/PlayerController.js';

document.addEventListener('DOMContentLoaded', () => {
    const playlistController = new PlaylistController();
    const playerController = new PlayerController();

    // Initialize the application
    playlistController.initialize();
    playerController.initialize();

    // Event listeners for user interactions
    document.getElementById('addSongButton').addEventListener('click', () => {
        const songName = document.getElementById('songNameInput').value;
        const artistName = document.getElementById('artistNameInput').value;
        playlistController.addSong(songName, artistName);
    });

    document.getElementById('removeSongButton').addEventListener('click', () => {
        const songName = document.getElementById('songNameInput').value;
        playlistController.removeSong(songName);
    });

    document.getElementById('playButton').addEventListener('click', () => {
        playerController.play();
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        playerController.next();
    });

    document.getElementById('prevButton').addEventListener('click', () => {
        playerController.previous();
    });

    document.getElementById('randomButton').addEventListener('click', () => {
        playerController.playRandom();
    });

    document.getElementById('searchButton').addEventListener('click', () => {
        const songName = document.getElementById('songNameInput').value;
        playerController.searchSong(songName);
    });
});