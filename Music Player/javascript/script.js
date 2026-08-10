console.log("Hello Ayush")
let currentSong = new Audio();

const ASSETS_FOLDER_NAME = "songs";

let currentPlaylistFolder = "All Songs";
let globalTrackList = [];

async function getSongs(folderName) {
    let response = await fetch(`${ASSETS_FOLDER_NAME}/${folderName}`);
    let htmlText = await response.text();

    let temporaryDiv = document.createElement("div");
    temporaryDiv.innerHTML = htmlText;

    let anchorElements = temporaryDiv.getElementsByTagName("a");
    let pathList = [];

    for (let index = 0; index < anchorElements.length; index++) {
        const element = anchorElements[index];
        if (element.href.endsWith(".mp3")) {
            pathList.push(element.href.split(ASSETS_FOLDER_NAME)[1]);
        }
    }
    return pathList;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = async (trackRelativePath) => {
    currentSong.src = trackRelativePath;
    currentSong.play();
    if (typeof play !== 'undefined') {
        play.src = "assets/Control Buttons/pause-button.svg";
    }
    let cleanPath = trackRelativePath.replaceAll("%5C", "/").replaceAll("%20", " ").replaceAll("%5B", "").replaceAll("%5D", "");
    let songFileName = cleanPath.split('/').pop().replaceAll(".mp3", "").trim();
    let artist = "Unknown Artist";
    let songTitle = songFileName;
    if (songFileName.includes("-")) {
        let parts = songFileName.split("-");
        artist = parts[0].trim();
        songTitle = parts[1].trim();
    }
    document.querySelector(".trackDetailForPlayer").innerHTML = artist;
    document.querySelector(".trackNameForPlayer").innerHTML = songTitle;
    
    console.log("Playing:", trackRelativePath);
    document.querySelector(".duration").innerHTML = "00:00/00:00";
}

async function loadPlaylistTracks(folderName) {
    currentPlaylistFolder = folderName;
    let rawSongPaths = await getSongs(folderName);

    globalTrackList = rawSongPaths.map(path => {
        return path.replaceAll("%5C", "/").replaceAll("%20", " ").replaceAll("%5B", "").replaceAll("%5D", "");
    });

    let SidebarSongsContainer = document.querySelector(".sidebar-songs");
    SidebarSongsContainer.innerHTML = "";

    globalTrackList.forEach(songPath => {
        let fileName = songPath.split('/').pop();
        let cleanName = fileName.replace(".mp3", "");

        let artist = "Unknown Artist";
        let songTitle = cleanName;

        if (cleanName.includes("-")) {
            let parts = cleanName.split("-");
            artist = parts[0].trim();
            songTitle = parts[1].trim();
        }

        SidebarSongsContainer.innerHTML += `
        <div class="sidebar-song">
            <div class="songs-card" data-path="${ASSETS_FOLDER_NAME}${songPath}">
                <div class="music-svg">
                    <svg class="music-svg-icon" xmlns="http://w3.org" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M19 2v12.55A3.5 3.5 0 1 1 17 11.4V6.1l-8 2v8.45A3.5 3.5 0 1 1 7 13.4V5.5L19 2z" />
                    </svg>
                    <div class="song-name">
                        <div class="music-title">${songTitle}</div>
                        <div class="singer">${artist}</div>
                    </div>
                </div>
                <div class="play-svg">
                    <img width="24px" height="24px" src="assets/playButton.svg" alt="Play">
                </div>
            </div>
        </div>`;
    });

    Array.from(document.querySelectorAll(".sidebar-song")).forEach(elementItem => {
        elementItem.addEventListener("click", () => {
            let songCard = elementItem.querySelector(".songs-card");
            let songPath = songCard.getAttribute("data-path");
            playMusic(songPath);
        });
    });
}

async function displayAlbum() {
    let response = await fetch(`${ASSETS_FOLDER_NAME}/`);
    let htmlText = await response.text();
    let temporaryDiv = document.createElement("div");
    temporaryDiv.innerHTML = htmlText;
    let anchors = temporaryDiv.getElementsByTagName("a")
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("songs")) {
            let folder = e.href.split("%5C").slice(-1)[0];

            let response = await fetch(`${ASSETS_FOLDER_NAME}/${folder}/info.json`);
            let htmlText = await response.json();
            console.log(htmlText);
            document.querySelector(".playlist-cards").innerHTML = document.querySelector(".playlist-cards").innerHTML + `<div class="cards" data-folder="${folder}">
                    <div class="card-image">
                        <img src="songs/${folder}/cover.jfif" alt="cover">
                    </div>
                    <div class="information">
                        <div class="playlist-name">${htmlText.title}</div>
                        <div class="playlist-info">${htmlText.information}</div>
                    </div>
                </div>`
        }
        Array.from(document.querySelectorAll(".cards")).forEach(playlistCard => {
            playlistCard.addEventListener("click", async (e) => {
                const folder = e.currentTarget.dataset.folder;
                console.log(folder)
                if (folder) {
                    console.log("Loading folder:", folder);
                    await loadPlaylistTracks(folder);

                    // Automatically play first track of new selected playlist folder
                    if (globalTrackList.length > 0) {
                        playMusic(`${ASSETS_FOLDER_NAME}${globalTrackList[0]}`);
                    }
                }
            });
        });

    })
}
async function main() {
    await loadPlaylistTracks(currentPlaylistFolder);
    await displayAlbum();
    if (globalTrackList.length > 0) {
        let firstSongPath = `${ASSETS_FOLDER_NAME}${globalTrackList[0]}`;
        currentSong.src = firstSongPath;
        document.querySelector(".trackDetailForPlayer").innerHTML = firstSongPath.split("-")[0].replaceAll(".mp3", "").replace(`${ASSETS_FOLDER_NAME}/`, "").replace(`${currentPlaylistFolder}/`, "");
        document.querySelector(".trackNameForPlayer").innerHTML = firstSongPath.split("-").pop().replaceAll(".mp3", "");
        document.querySelector(".duration").innerHTML = "00:00/00:00";
        if (typeof play !== 'undefined') play.src = "assets/Control Buttons/play-button.svg";
    }

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/Control Buttons/pause-button.svg";
        } else {
            currentSong.pause();
            play.src = "assets/Control Buttons/play-button.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        const currentStr = secondsToMinutesSeconds(currentSong.currentTime);
        const durationStr = isNaN(currentSong.duration) || currentSong.duration === 0 ? "00:00" : secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".duration").innerHTML = `${currentStr}/${durationStr}`;

        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            let progressPercent = (currentSong.currentTime / currentSong.duration) * 100;
            document.querySelector(".progress-bar").style.width = progressPercent + "%";
        } else {
            document.querySelector(".progress-bar").style.width = "0%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let clickX = e.clientX - rect.left;
        let percent = (clickX / rect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));

        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            document.querySelector(".progress-bar").style.width = percent + "%";
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        }
    });

    const hamburgerBtn = document.querySelector(".hamburger");
    const sidebarDrawer = document.querySelector(".sidebar");
    if (hamburgerBtn && sidebarDrawer) {
        hamburgerBtn.addEventListener("click", () => {
            sidebarDrawer.classList.toggle("show");
        });
    }

    back.addEventListener("click", () => {
        let currentTrackPath = currentSong.src.split(ASSETS_FOLDER_NAME)[1].replaceAll("%20", " ");
        let index = globalTrackList.indexOf(currentTrackPath);
        if (index - 1 >= 0) {
            playMusic(`${ASSETS_FOLDER_NAME}` + globalTrackList[index - 1]);
        }
    });

    forward.addEventListener("click", () => {
        let currentTrackPath = currentSong.src.split(ASSETS_FOLDER_NAME)[1].replaceAll("%20", " ");
        let index = globalTrackList.indexOf(currentTrackPath);
        if (index !== -1 && index + 1 < globalTrackList.length) {
            playMusic(`${ASSETS_FOLDER_NAME}` + globalTrackList[index + 1]);
        }
    });

    let range = document.querySelector(".range").getElementsByTagName("input")[0]
    range.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume > img").addEventListener("click", e=>{
        console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            range.value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            range.value = 10;
        }
    })
}

main();
