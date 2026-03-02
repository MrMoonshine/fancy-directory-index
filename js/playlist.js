function set_theme() {
    let root = document.documentElement;
    root.style.setProperty("--color-main", localStorage.getItem(COOKIE_COLOR) ?? "teal");
    let bg = localStorage.getItem(COOKIE_BACKGROUND) ?? "none";
    if (bg.length < 1) {
        bg = "none";
    }
    let backgroundAvailable = bg != "none";
    root.style.setProperty("--background-image", backgroundAvailable ? `url("${bg}")` : bg);

    let hsv = color_hex_to_hsv(localStorage.getItem(COOKIE_COLOR));
    console.log(hsv);
    root.style.setProperty("--color-main-hue", `${hsv[0]}`);
    root.style.setProperty("--color-main-sat", `${hsv[1]}%`);
    console.log(root.style.getPropertyValue("--color-main-hue"));
}

class PlaylistCard {
    constructor(parent, data, playlistMain) {
        this.data = data;
        this.playlistMain = playlistMain;

        // Main wrapper div
        this.dom = document.createElement('div');
        this.dom.className = 'playlist-card border';           // ← add if you want a class on wrapper

        // Icon image
        const img = document.createElement('img');
        img.className = 'icon';
        img.alt = '[IMG]';
        img.src = this.data.icon;           // You should validate/sanitize this in real code

        // Hidden input
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'id';
        hiddenInput.value = this.data.id;   // Sanitize/escape if coming from untrusted source

        // Text center div
        const textDiv = document.createElement('div');
        textDiv.className = 'text-center';
        textDiv.textContent = this.data.name;  // Safest way — automatically escapes HTML

        const songCountText = document.createElement('div');
        songCountText.className = 'text-small text-petite';
        songCountText.innerText = `${this.data.songCount} songs`;
        textDiv.appendChild(songCountText);

        this.dom.addEventListener("click", () => {
            api_get((apidataall) => {
                try {
                    let apidata = apidataall.data;
                    this.playlistMain.update(apidata[0]);
                } catch (error) {
                    console.error("Unable to set playlist!");
                }

            }, "playlists", this.data.id);
        });

        // Assemble
        this.dom.appendChild(img);
        this.dom.appendChild(hiddenInput);
        this.dom.appendChild(textDiv);
        parent.appendChild(this.dom);
    }
}

class PlaylistSong {
    constructor(parent, song, playlisticon = "") {
        this.song = song;

        this.dom = document.createElement("div");
        this.dom.className = "playlist-song-item";

        this.playbutton = document.createElement("div");
        this.playbutton.className = "playbutton-container";

        let playbuttonSby = document.createElement("img");
        playbuttonSby.className = "playbutton standby my-auto";
        playbuttonSby.alt = "PLAY";
        playbuttonSby.src = "/fancy-directory-index/assets/media-playback-playing-dull.png";

        let playbutton = document.createElement("img");
        playbutton.className = "playbutton active hue-rotate my-auto";
        playbutton.alt = ">";
        playbutton.src = "/fancy-directory-index/assets/media-playback-playing.png";

        let thumbnail = new Image();
        thumbnail.className = "thumbnail";
        thumbnail.alt = "[IMG]";
        thumbnail.addEventListener("error", () => {
            if(thumbnail.classList.contains(CSS_IMAGE_UNKNOWN)){
                return;
            }
            thumbnail.src = playlisticon;
            thumbnail.classList.add(CSS_IMAGE_UNKNOWN);
        });

        if (song.thumbnail) {
            thumbnail.src = `/nas/web/thumbnails/${song.thumbnail}`;
        }else{
            thumbnail.src = playlisticon;
            thumbnail.classList.add(CSS_IMAGE_UNKNOWN);
        }

        let title = document.createElement("div");
        title.className = "my-auto";
        MusicPlayer.songTitleUIPrepare(song.song ?? "UNKNOWN", title);

        let dateadded = document.createElement("div");
        dateadded.className = "my-auto";
        dateadded.innerText = song.timestamp;

        let optionsbutton = document.createElement("button");
        optionsbutton.innerText = "...";

        this.playbutton.appendChild(playbutton);
        this.playbutton.appendChild(playbuttonSby);
        this.dom.appendChild(this.playbutton);
        this.dom.appendChild(thumbnail);
        this.dom.appendChild(title);
        this.dom.appendChild(dateadded);
        this.dom.appendChild(optionsbutton);
        parent.appendChild(this.dom);
    }
}

class Playlist {
    constructor(dom) {
        this.dom = dom;
        this.songItems = [];
        this.songs = [];
        this.name = "";

        this.player = new MusicPlayer(document.querySelector("#music-player"));
        this.titleDom = document.querySelector("#playlist-title-display");
    }

    update(data) {
        this.clear();
        console.log(data);
        this.name = data.name ?? "UNKNOWN";
        this.titleDom.innerText = this.name;

        this.songs = data.songs ?? [];
        for(let i = 0; i < (data.songs ?? []).length; i++){
            let song = data.songs[i];
            let item = new PlaylistSong(this.dom, song, data.icon ?? "");
            if(!song.thumbnail){
                song.thumbnail = data.icon;
            }
            item.playbutton.addEventListener("click", () => {
                console.log(item.song);
                //this.player.playRaw(item.song.song, item.song.filename, item.song.thumbnail ?? "");
                this.player.setPlaylist(this.name, this.songs, i);
                this.player.nextSong();
            });
            this.songItems.push(item);
        }
    }

    clear() {
        this.songItems.forEach(item => {
            item.dom.remove();
        });
        this.songItems = [];
        this.songs = [];
    }
}

set_theme();

var PLAYLISTS = JSON.parse(document.getElementById('playlist-data').dataset.json);
console.log(PLAYLISTS);

const playlistLibraryCardspace = document.querySelector("#playlist-library-cardspace");
const playlistSongSelection = document.querySelector("#playlist-song-selection");

var playlistMain = new Playlist(playlistSongSelection);

(PLAYLISTS ?? []).forEach(playlist => {
    let card = new PlaylistCard(playlistLibraryCardspace, playlist, playlistMain);
});