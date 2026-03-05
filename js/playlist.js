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
        img.addEventListener("error", image_fallback_favicon);
        let thumbnailURI = Playlist.thumbnailURI(this.data.icon);;           // You should validate/sanitize this in real code
        console.log(thumbnailURI);
        img.src = thumbnailURI;

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
                    console.error(error);
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
    static songItemIndex = 0;
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
            if (thumbnail.classList.contains(CSS_IMAGE_UNKNOWN)) {
                return;
            }
            thumbnail.src = playlisticon;
            thumbnail.classList.add(CSS_IMAGE_UNKNOWN);
        });

        if (song.thumbnail) {
            thumbnail.src = `/nas/web/thumbnails/${song.thumbnail}`;
        } else {
            thumbnail.src = playlisticon;
            thumbnail.classList.add(CSS_IMAGE_UNKNOWN);
        }

        let title = document.createElement("div");
        title.className = "my-auto overflow-hidden text-nowrap";
        MusicPlayer.songTitleUIPrepare(song.song ?? "UNKNOWN", title);

        let dateadded = document.createElement("div");
        dateadded.className = "my-auto d-mobile-none";
        dateadded.innerText = song.timestamp;

        let optionsbuttonContainer = document.createElement("div");
        optionsbuttonContainer.className = "position-relative";
        let optionsbutton = document.createElement("label");
        optionsbutton.className = "gradient-dull playlist-song-options";
        optionsbutton.innerHTML = "&mldr;";
        optionsbuttonContainer.appendChild(optionsbutton);

        let enablerID = `sioce${PlaylistSong.songItemIndex++}`;
        let optionContainerEnabler = document.createElement("input");
        optionContainerEnabler.type = "radio";
        optionContainerEnabler.name = "sioce";
        optionContainerEnabler.className = "option-container-enabler";
        optionContainerEnabler.id = enablerID;
        optionsbutton.setAttribute("for", enablerID);
        optionsbuttonContainer.appendChild(optionContainerEnabler);

        let optionContainer = document.createElement("div");
        optionContainer.className = "option-container";
        optionsbuttonContainer.appendChild(optionContainer);

        this.deleter = document.createElement("div");
        this.deleter.className = "option";
        this.deleter.innerText = "Remove from Playlist";

        optionContainer.appendChild(this.deleter);

        this.playbutton.appendChild(playbutton);
        this.playbutton.appendChild(playbuttonSby);
        this.dom.appendChild(this.playbutton);
        this.dom.appendChild(thumbnail);
        this.dom.appendChild(title);
        this.dom.appendChild(dateadded);
        this.dom.appendChild(optionsbuttonContainer);
        parent.appendChild(this.dom);
    }
}

class Playlist {
    static mainTitle = document.querySelector("#main-title");
    static playlistLibrary = document.querySelector("#playlist-library-cardspace");
    static songSelection = document.querySelector("#playlist-song-selection");
    static buttonBack = document.querySelector("#button-back");
    static buttonAdd = document.querySelector("#button-add");
    //static buttonEdit = document.querySelector("#button-edit");
    static buttonRename = document.querySelector("#button-rename");
    static buttonDelete = document.querySelector("#button-delete");
    static metaImage = document.querySelector("#playlist-meta-image");

    static renameOverlay = new Overlay("Rename Playlist", null, "POST");
    static renameName = document.createElement("input");
    static renamePlaylist = document.createElement("input");

    static deletePlaylist = document.querySelector("#input-delete-id");
    static imagePlaylist = document.querySelector("#input-image-id");

    static thumbnailpath = JSON.parse(document.getElementById('playlist-thumbnailpath').dataset.json) + "playlists/";

    constructor(dom) {
        this.dom = dom;
        this.songItems = [];
        this.songs = [];
        this.name = "";

        this.player = new MusicPlayer(document.querySelector("#music-player"));
        //this.titleDom = document.querySelector("#playlist-title-display");
    }

    update(data) {
        dom_show(Playlist.buttonBack, true);
        dom_show(Playlist.buttonAdd, false);
        //dom_show(Playlist.buttonEdit, true);
        dom_show(Playlist.songSelection, true);
        dom_show(Playlist.playlistLibrary, false);

        this.clear();
        console.log(data);
        this.name = data.name ?? "UNKNOWN";

        let thumbnailURI = Playlist.thumbnailURI(data.icon);
        console.log(thumbnailURI);
        //this.titleDom.innerText = this.name;
        Playlist.renamePlaylist.value = data.id ?? -1;
        Playlist.imagePlaylist.value = data.id ?? -1;
        Playlist.deletePlaylist.value = data.id ?? -1;
        Playlist.mainTitle.innerText = this.name;
        Playlist.metaImage.classList.remove(CSS_IMAGE_UNKNOWN);
        Playlist.metaImage.src = thumbnailURI;


        this.songs = data.songs ?? [];
        for (let i = 0; i < (data.songs ?? []).length; i++) {
            let song = data.songs[i];
            let item = new PlaylistSong(this.dom, song, thumbnailURI);
            if (!song.thumbnail) {
                song.thumbnail = thumbnailURI;
            }
            item.playbutton.addEventListener("click", () => {
                console.log(item.song);
                //this.player.playRaw(item.song.song, item.song.filename, item.song.thumbnail ?? "");
                this.player.setPlaylist(this.name, this.songs, i, false);
                this.player.nextSong();
                this.player.updatePlaylistOrder();
            });

            item.deleter.addEventListener("click", () => {
                console.log(`Remove Song ${item.song.id} from Playlist: ${item.song.playlist}`);
                Playlist.modify(item.song.playlist, item.song.id, false, () => {
                    api_get((apidataall) => {
                        try {
                            let apidata = apidataall.data;
                            this.update(apidata[0]);
                        } catch (error) {
                            console.error(error);
                            console.error("Unable to set playlist!");
                        }
                    }, "playlists", item.song.playlist);
                }, "playlists", item.song.playlist);
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

    static modify(playlist, song, add = true, callback = null) {
        let fd = new FormData();
        fd.append("resource", "playlists");
        fd.append("mode", "modify");
        fd.append("playlist", playlist);
        fd.append("songid", song);
        api_modify(callback, "playlist_songs", fd);
    }

    static removeSong(playlist, song) {
        return Playlist.modify(playlist, song, false);
    }

    static addSong(playlist, song) {
        return Playlist.modify(playlist, song, true);
    }

    static thumbnailURI(filename){
        let tnuri = Playlist.thumbnailpath + filename;
        if((filename ?? "").startsWith("http") || (filename ?? "").startsWith("/")){
            tnuri = filename;
        }
        return tnuri;
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

Playlist.buttonBack.addEventListener("click", () => {
    Playlist.mainTitle.innerText = "Library";
    dom_show(Playlist.buttonBack, false);
    dom_show(Playlist.buttonAdd, true);
    //dom_show(Playlist.buttonEdit, false);
    dom_show(Playlist.songSelection, false);
    dom_show(Playlist.playlistLibrary, true);
});

Playlist.metaImage.addEventListener("error", image_fallback_favicon);


let renameSubmit = document.createElement("input");
renameSubmit.type = "submit";
renameSubmit.className = "btn d-block";
Playlist.renameOverlay.modalFooter.appendChild(renameSubmit);

Playlist.renameName.type = "text";
Playlist.renameName.name = "name";
Playlist.renameOverlay.content.appendChild(Playlist.renameName);

Playlist.renamePlaylist.type = "hidden";
Playlist.renamePlaylist.name = "rename";
Playlist.renameOverlay.content.appendChild(Playlist.renamePlaylist);

Playlist.buttonRename.addEventListener("click", () => {
    Playlist.renameOverlay.show();
});

let deleteToast = new Toast();
deleteToast.onFinish = (option) => {
    if(option != Toast.BUTTON_YES){
        deleteToast.hide();
        return;
    }
    
    let deleteform = document.querySelector("#form-delete");
    deleteform.submit();
}

Playlist.buttonDelete.addEventListener("click", () => {
    deleteToast.show(
        "Failed to remove Song!",
        "Would you realy like to delete the playlist?",
        12,
        Toast.BUTTONS_YESNO_PREF_NO,
        APACHE_ALIAS + "/assets/dialog-warning.png"
    );
});