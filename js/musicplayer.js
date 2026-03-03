class MusicPlayer {
    static toast = new Toast();
    /*
        @brief constructor
        @param dom parent
        @param nextUpSpace dom to be used for next-up
    */
    constructor(dom, nextUpSpace = null) {
        this.dom = dom;
        // Playlist Variables
        this.directoryPlaylist = null;      // playlist for directories
        this.playlist = new SongQueue(document.querySelector("#next-up-space"));               // actual playlists
        this.currentIndex = 0;

        this.title = document.getElementById("songtitle");
        //this.artist = document.getElementById("songartist");
        this.cover = document.getElementById("albumcover");

        this.loader = document.getElementById("music-load-indicator");
        this.slider = document.getElementById("music-progress");
        this.playButton = document.getElementById("play");
        this.skipFwd = document.getElementById("skip-fwd");
        this.skipBck = document.getElementById("skip-bck");

        this.volume = document.getElementById("volume");
        this.mutebutton = document.getElementById("mute");

        this.downloader = document.getElementById("song-download");
        this.sharer = document.getElementById("song-share");
        this.playlistAdder = document.getElementById("song-playlist-add");

        this.repeat = document.getElementById("repeat");
        this.shuffle = document.getElementById("shuffle");

        this.current = document.getElementById("display-current");
        this.duration = document.getElementById("display-duration");

        this.slider.addEventListener("input", () => {
            this.audio.currentTime = this.slider.value;
        });
        /*
            Playlist Control
        */
        this.looping = false;
        this.skipFwd.addEventListener("click", () => {
            this.nextSong();
        });
        this.skipBck.addEventListener("click", () => {
            this.prevSong();
        });

        this.repeat.addEventListener("change", () => {
            this.setLooping(this.repeat.checked);
        });

        this.nextSongTimeout = null;

        /*
            Volume Control
        */
        this.volumeCache = this.volume.value;

        this.volume.addEventListener("input", () => {
            this.volumeCache = this.volume.value;
            this.mutebutton_icon(this.volume.value == 0);
            if (!this.audio) {
                return;
            }
            this.audio.volume = this.volume.value;
        });

        this.mutebutton.addEventListener("click", () => {
            console.log("Mutebutton!");
            if (this.volume.value == 0) {
                this.volume.value = this.volumeCache;
            } else {
                this.volume.value = 0;
            }
            this.mutebutton_icon(this.volume.value == 0);
            fancy_range_slider_set(this.volume);
            if (!this.audio) {
                return;
            }
            this.audio.volume = this.volume.value;
        });
        /*
            Sharing Song
        */
        if (navigator.canShare) {
            this.sharer.addEventListener("click", () => {
                try {
                    let sharePromise = navigator.share({
                        url: new URL(this.downloader.href)
                    });
                    sharePromise.then(() => {
                        console.log("Shared...");
                    });
                } catch (err) {
                    console.error(`Error: ${err}`);
                }
            });
        } else {
            this.sharer.classList.add(CLASS_HIDDEN);
        }
        /*
            Playlist
        */
        this.currentSong = "";          // name of current song
        this.currentSongItem = null;    // represents the song item of a playlist
        this.playlistMenu = new MusicPlaylistManager();
        this.playlistAdder.addEventListener("click", () => { this.playlistMenuShow() });
    }

    play(file, index = -1, startTime = 0, startImmediately = true) {
        dom_show(this.loader, true);
        dom_show(this.slider, false);

        if (!file && index >= 0) {
            file = this.loadFromIndex(index);
            this.title.innerText = file.getFileName();
        } else if (file) {
            this.title.innerText = file.getFileName();
            this.currentIndex = this.getPlaylistIndex();
        }
        //console.log("Index in playlist is " + this.currentIndex);

        // Cleanup
        if (this.audio) {
            this.audio.remove();
        }

        if (this.source) {
            this.source.remove();
        }
        // Create new audio element
        this.audio = document.createElement("audio");
        this.source = document.createElement("source");
        this.dom.appendChild(this.audio);
        this.audio.appendChild(this.source);

        if (startImmediately) {
            this.audio.autoplay = true;
            this.playButton.checked = false;
        }

        this.audio.loop = this.looping;
        this.audio.volume = this.volumeCache;
        this.audio.currentTime = startTime;

        this.playButton.addEventListener("input", () => {
            if (!this.playButton.checked) {
                this.audio.play();
                console.log("Playing...");
            } else {
                this.audio.pause();
                console.log("Paused!");
            }
            //this.playbutton_icon(this.audio.paused);
            console.log(this.audio);
        });

        this.audio.addEventListener('timeupdate', () => {
            //console.log("Timeupdate! " + Math.floor(this.audio.currentTime));
            this.updateSlider();

        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.slider.setAttribute("step", "1");
            this.slider.setAttribute("min", "0");
            this.slider.setAttribute("max", this.audio.duration);
            this.duration.innerText = MusicPlayer.secondsHumanReadable(this.audio.duration);
        });

        this.audio.addEventListener("canplay", () => {
            dom_show(this.loader, false);
            dom_show(this.slider, true);
        });

        // Song must be loaded first. thumbnails can wiat
        this.audio.addEventListener("canplaythrough", () => {
            // Set album cover if any
            console.log(file.thumbnail);
            this.cover.src = file.getMusicThumbnail();
            // Provide Info for System
            this.setSystemInfo(file.getFileName());
        });

        // Go to next song if it finishes
        this.audio.addEventListener("ended", () => {
            this.nextSong();
        });

        this.source.src = file.getFileName();
        this.downloader.href = file.getFileName();
        this.downloader.download = file.getFileName();

        this.currentSong = file.getFileName();
    }

    playRaw(songtitle, filename, thumbnail = "", startImmediately = true) {
        // in case a timeout was set, abort autoplay due to song load error
        if(this.nextSongTimeout){
            clearTimeout(this.nextSongTimeout);
        }
        // show loaders
        dom_show(this.loader, true);
        dom_show(this.slider, false);

        // Set Title
        MusicPlayer.songTitleUIPrepare(songtitle, this.title);

        // Cleanup
        if (this.audio) {
            this.audio.remove();
        }

        // Create new audio element
        this.audio = new Audio();
        this.dom.appendChild(this.audio);

        if (startImmediately) {
            this.audio.autoplay = true;
            this.playButton.checked = false;
        }

        this.audio.loop = this.looping;
        this.audio.volume = this.volumeCache;
        this.audio.currentTime = 0;

        this.playButton.addEventListener("input", () => {
            if (!this.playButton.checked) {
                this.audio.play();
                console.log("Playing...");
            } else {
                this.audio.pause();
                console.log("Paused!");
            }
            //this.playbutton_icon(this.audio.paused);
            console.log(this.audio);
        });

        this.audio.addEventListener('timeupdate', () => {
            //console.log("Timeupdate! " + Math.floor(this.audio.currentTime));
            this.updateSlider();

        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.slider.setAttribute("step", "1");
            this.slider.setAttribute("min", "0");
            this.slider.setAttribute("max", this.audio.duration);
            this.duration.innerText = MusicPlayer.secondsHumanReadable(this.audio.duration);
        });

        this.audio.addEventListener("canplay", () => {
            dom_show(this.loader, false);
            dom_show(this.slider, true);
        });

        // Song must be loaded first. thumbnails can wiat
        this.audio.addEventListener("canplaythrough", () => {
            // Set album cover if any
            console.log(thumbnail);
            //this.cover.src = `/nas/web/thumbnails/${thumbnail}`;
            if (thumbnail.startsWith("/")) {
                this.cover.src = thumbnail;
            } else {
                this.cover.src = thumbnail_full_path(thumbnail);
            }
            // Provide Info for System
            this.setSystemInfo(songtitle);
        });

        // Go to next song if it finishes
        this.audio.addEventListener("ended", () => {
            this.nextSong();
        });

        this.audio.addEventListener("error", () => {
            console.error("Failed to load audio " + filename);

            this.nextSongTimeout = setTimeout(() => {
                this.nextSong();
            }, 7000);
            // Delete item from playlist in case of error
            if (this.currentSongItem) {
                if (this.currentSongItem.playlist > 0) {
                    MusicPlayer.toast.onFinish = (value) => {
                        console.log(value);
                        MusicPlayer.toast.hide();
                        if(value != Toast.BUTTON_YES){
                            return;
                        }
                        let fd = new FormData();
                        fd.append("resource", "playlists");
                        fd.append("mode", "modify");
                        fd.append("playlist", this.currentSongItem.playlist);
                        fd.append("song", this.currentSongItem.filename);

                        api_modify((data) => {
                            console.log(data);
                            //MusicPlayer.toast.onFinish = (value) => {MusicPlayer.toast.hide()};
                            if ((data.errors ?? []).length > 0 || data.status != 0) {
                                MusicPlayer.toast.show(
                                    "Failed to remove Song!",
                                    (data.errors ?? []).length > 0 ? data.errors.join("<br>") : JSON.stringify(data),
                                    5,
                                    Toast.BUTTONS_NONE,
                                    APACHE_ALIAS + "/assets/dialog-warning.png"
                                );
                            } else {
                                MusicPlayer.toast.show(
                                    "Success!",
                                    `${decodeURI(this.currentSong)} was removed successfully from playlist!`,
                                    5,
                                    Toast.BUTTONS_NONE,
                                    APACHE_ALIAS + "/assets/dialog-ok.png"
                                );
                            }
                        }, "playlist_songs", fd);
                    }
                    //MusicPlayer.toast.show(title, text, timeout = 0, buttonset = Toast.BUTTONS_ALERT, image = "")
                    MusicPlayer.toast.show(
                        "Unable to load song!",
                        `Song may have been deleted or moved to another directory. Should song ${decodeURI(this.currentSongItem.song)} be removed from this playlist?`,
                        12,
                        Toast.BUTTONS_YESNO_PREF_YES,
                        APACHE_ALIAS + "/assets/dialog-warning.png"
                    );
                }
            }
        });

        this.audio.src = filename;
        this.downloader.href = filename;
        this.downloader.download = decodeURI(songtitle);
        this.currentSong = decodeURI(filename);
    }

    setSystemInfo(title) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: "UNKNOWN",
                album: "UNKNOWN",
                artwork: [{ src: new URL(this.cover.src), sizes: `${this.cover.width}x${this.cover.height}`, type: 'image/jpeg' }]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                // Your custom play logic
                this.audio.play();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                // Your custom pause logic
                this.audio.pause();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                // Custom logic to go to previous track
                this.prevSong();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                // Custom logic to go to next track
                this.nextSong();
            });
        }
    }

    setPlaylist(name, playlist, offset = 0) {
        //console.log(playlist);
        this.playlist.clear();
        this.playlist.addSongs(playlist, offset, name);
    }

    setDirectoryPlaylist(playlist) {
        this.directoryPlaylist = playlist;
    }

    getPlaylistIndex() {
        if (!this.directoryPlaylist) {
            return -1;
        }

        for (let i = 0; i < this.directoryPlaylist.length; i++) {
            if (this.directoryPlaylist[i].getFileName() == this.title.innerText) {
                return i;
            }
        }
        return -1;
    }

    loadFromIndex(index) {
        this.currentIndex = index % this.directoryPlaylist.length;
        return this.directoryPlaylist[this.currentIndex];
    }

    playbutton_icon(icon) {
        dom_show(document.getElementById("img-play"), icon);
        dom_show(document.getElementById("img-pause"), !icon);
    }

    mutebutton_icon(icon) {
        dom_show(document.getElementById("img-mute"), icon);
        dom_show(document.getElementById("img-unmute"), !icon);
    }

    updateSlider() {
        this.slider.value = Math.floor(this.audio.currentTime);
        this.current.innerText = MusicPlayer.secondsHumanReadable(this.audio.currentTime);
        fancy_range_slider_set(this.slider);
    }

    shuffling() {
        return this.shuffle.checked;
    }

    setLooping(looping) {
        if (!this.audio) {
            return;
        }
        this.audio.loop = looping;
        /*if(this.audio.loop){
            this.audio.loop = false;
            this.repeat.classList.remove("enabled");
        }else{
            this.audio.loop = true;
            this.repeat.classList.add("enabled");
        }
        this.looping = this.audio.loop;*/
    }

    nextSong() {
        this.currentSongItem = null;
        if (this.playlist.songs.length > 0) {
            this.currentSongItem = this.playlist.getNext();
            if (!this.currentSongItem) {
                this.audio.pause();
                return;
            }
            this.playRaw(this.currentSongItem.song, this.currentSongItem.filename, this.currentSongItem.thumbnail, true);
            return;
        }

        if (!this.directoryPlaylist) {
            return;
        }
        if (!this.shuffling()) {
            this.play(null, this.currentIndex + 1);
            return;
        }

        let indexDiff = Math.ceil(Math.random() * (this.directoryPlaylist.length - 1))
        this.play(null, this.currentIndex + indexDiff);
    }

    prevSong() {
        if (this.playlist.songs.length > 0) {
            this.currentSongItem = null;
            this.currentSongItem = this.playlist.getPrev();
            if (!this.currentSongItem) {
                this.audio.pause();
                return;
            }
            this.playRaw(this.currentSongItem.song, this.currentSongItem.filename, this.currentSongItem.thumbnail, true);
            return;
        }
        this.play(null, this.directoryPlaylist.length + this.currentIndex - 1);
    }

    playlistMenuShow() {
        console.log(`Current song is: ${this.currentSong}`)
        this.playlistMenu.show(this.currentSong);
    }

    static secondsHumanReadable(timeS) {
        timeS = Math.floor(timeS);
        let minutes = Math.floor(timeS / 60);
        let seconds = timeS % 60;
        return `${MusicPlayer.leadingZeros(minutes, 2)}:${MusicPlayer.leadingZeros(seconds, 2)}`;
    }

    static leadingZeros(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    static songTitleNamePrepare(songtitle) {
        let decodedtitle = decodeURI(songtitle);
        const extensions = ["mp3", "webm"];
        extensions.forEach(exten => {
            let re = new RegExp(`\.${exten}$`, "gi");
            decodedtitle = decodedtitle.replace(re, "");
        });
        return decodedtitle;
    }

    static songTitleUIPrepare(songtitle, parent) {
        const separator = " - ";
        parent.innerHTML = "";
        let decodedtitle = MusicPlayer.songTitleNamePrepare(songtitle);
        try {
            const arr = decodedtitle.split(separator);
            // fallback
            if (arr.length < 2) {
                parent.innerText = decodedtitle;
                return
            }
            let tt = document.createElement("div");
            tt.innerText = arr.shift();

            let ta = document.createElement("div");
            ta.className = "text-petite";
            ta.innerText = arr.join(separator);

            parent.appendChild(tt);
            parent.appendChild(ta);
        } catch (err) {
            console.warn(err);
        }
    }
}

class MusicPlaylistManager extends Overlay {
    //constructor(title = "", content = null, defaulttype = "dialog") {
    constructor() {
        super("Add to Playlist");
        this.build();
        this.currentSong = null;

        this.toast = new Toast();
    }

    show(currentSong) {
        this.currentSong = currentSong;
        super.show();
    }

    build() {
        this.content.classList.add("playlist-add-selection");
        let counter = 0;
        api_get((dataall) => {
            let data = dataall.data ?? [];
            //console.log(data);
            data.forEach(playlist => {
                let formid = "plaf" + counter;

                let dom = document.createElement("div");
                dom.className = "playlist-listitem gradient-dull-hover";

                let img = new Image();
                img.alt = "[IMG]";
                img.src = playlist.icon;

                let textdiv = document.createElement("div");
                textdiv.className = "text";
                textdiv.innerText = playlist.name;

                let form = document.createElement("form");
                form.id = formid;
                let hiplaylist = document.createElement("input");
                hiplaylist.setAttribute("type", "hidden");
                hiplaylist.name = "playlist";
                hiplaylist.value = playlist.id;

                form.appendChild(hiplaylist);

                dom.appendChild(img);
                dom.appendChild(textdiv);
                dom.appendChild(form);
                this.content.appendChild(dom);
                counter++;

                dom.addEventListener("click", () => {
                    this.hide();
                    let url = new URL(window.location);

                    let fd = new FormData(form);
                    fd.append("resource", "playlists");
                    fd.append("mode", "modify");
                    fd.append("add", "on");
                    fd.append("path", url.pathname);
                    fd.append("song", encodeURI(this.currentSong));
                    console.log(fd);

                    api_modify((data) => {
                        console.log(data);
                        // show(title, text, timeout = 0, buttonset = Toast.BUTTONS_ALERT, image = "")
                        this.close();
                        if ((data.errors ?? []).length > 0 || data.status != 0) {
                            this.toast.show(
                                "Failed to add Song!",
                                (data.errors ?? []).length > 0 ? data.errors.join("<br>") : JSON.stringify(data),
                                5,
                                Toast.BUTTONS_NONE,
                                APACHE_ALIAS + "/assets/dialog-warning.png"
                            );
                        } else {
                            this.toast.show(
                                "Success!",
                                `${decodeURI(this.currentSong)} was added successfully to playlist!`,
                                5,
                                Toast.BUTTONS_NONE,
                                APACHE_ALIAS + "/assets/dialog-ok.png"
                            );
                        }
                    }, "playlist_songs", fd);
                });
            });
        }, "playlists");
    }
}

const SongQueueColumn = {
    TITLE: "song",
    TIMESTAMP: "timestamp"
}

class SongQueue {
    static MAX_DISPLAY = 10;
    constructor(display = null) {
        this.display = display;
        this.songs = [];
        this.name = "UNKNOWN";
    }

    getNext() {
        if (this.songs.length < 1) {
            return null;
        }
        let elem = this.songs.shift();
        this.songs.push(elem);
        this.updateDisplay();
        return elem;
    }

    getPrev() {
        if (this.songs.length < 1) {
            return null;
        }
        let elem = this.songs.pop();
        this.songs.unshift(elem);
        this.updateDisplay();
        return elem;
    }

    addSong(song) {
        this.songs.push(song);
    }

    addSongs(songs, offset = 0, name = "UNKNOWN") {
        this.name = name;
        //songs.forEach(song => )
        for (let i = 0; i < (songs ?? []).length; i++) {
            const song = songs[(i + offset) % songs.length];
            this.addSong(song);
        }
    }

    shuffle() {
        console.log("shuffle not supported yet")
    }

    sortBy(column = SongQueueColumn.TIMESTAMP) {
        this.songs.sort((a, b) => {
            a[column].localeCompare(b[column]);
        });
        this.updateDisplay();
    }

    updateDisplay() {
        if (!this.display) {
            return;
        }

        this.display.innerHTML = "";
        // <h3>Next from: <i class="playlist-title-display">xxx</i></h3>
        let h3 = document.createElement("h3");
        h3.innerText = `Next from: ${this.name}`;
        this.display.appendChild(h3);

        let songlist = document.createElement("div");
        this.display.appendChild(songlist);

        for (let i = 0; i < Math.min((this.songs ?? []).length, SongQueue.MAX_DISPLAY); i++) {
            const song = this.songs[i];
            let songitem = document.createElement("div");
            songitem.className = "d-flex gap";

            let icon = new Image();
            icon.className = "thumbnail";
            icon.alt = "[IMG]";
            icon.src = thumbnail_full_path(song.thumbnail);
            songitem.appendChild(icon);

            let textcont = document.createElement("div");
            textcont.className = "d-block my-auto playlist-song-padding";
            MusicPlayer.songTitleUIPrepare(song.song, textcont);

            songitem.appendChild(textcont);
            songlist.appendChild(songitem);
        }
    }

    clear() {
        this.index = 0;
        this.songs = [];
    }
}