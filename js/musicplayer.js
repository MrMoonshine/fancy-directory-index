class MusicPlayer{
    constructor(dom){
        this.dom = dom;
        // Playlist Variables
        this.playlist = null;
        this.currentIndex = 0;

        this.title = document.getElementById("songtitle");
        //this.artist = document.getElementById("songartist");
        this.cover = document.getElementById("albumcover");

        this.slider = document.getElementById("music-progress");
        this.playButton = document.getElementById("play");
        this.skipFwd = document.getElementById("skip-fwd");
        this.skipBck = document.getElementById("skip-bck");

        this.volume = document.getElementById("volume");
        this.mutebutton = document.getElementById("mute");

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

        /*
            Volume Control
        */
        this.volumeCache = this.volume.value;

        this.volume.addEventListener("input", () => {
            this.volumeCache = this.volume.value;
            this.mutebutton_icon(this.volume.value == 0);
            if(!this.audio){
                return;
            }
            this.audio.volume = this.volume.value;
        });

        this.mutebutton.addEventListener("click", () => {
            console.log("Mutebutton!");
            if(this.volume.value == 0){
                this.volume.value = this.volumeCache;
            }else{
                this.volume.value = 0;
            }
            this.mutebutton_icon(this.volume.value == 0);
            fancy_range_slider_set(this.volume);
            if(!this.audio){
                return;
            }
            this.audio.volume = this.volume.value;
        });
    }

    play(file, index=-1, startTime=0, startImmediately = true){
        if(!file && index >= 0){
            file = this.loadFromIndex(index);
            this.title.innerText = file.getFileName();
        }else if(file){
            this.title.innerText = file.getFileName();
            this.currentIndex = this.getPlaylistIndex();
        }
        //console.log("Index in playlist is " + this.currentIndex);
        
        // Cleanup
        if(this.audio){
            this.audio.remove();
        }

        if(this.source){
            this.source.remove();
        }
        // Create new audio element
        this.audio = document.createElement("audio");
        this.source = document.createElement("source");
        this.dom.appendChild(this.audio);
        this.audio.appendChild(this.source);

        if(startImmediately){
            this.audio.autoplay = true;
            this.playButton.checked = false;
        }

        this.audio.loop = this.looping;
        this.audio.volume = this.volumeCache;
        this.audio.currentTime = startTime;

        this.playButton.addEventListener("input", () => {
            if(!this.playButton.checked){
                this.audio.play();
                console.log("Playing...");
            }else{
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
        // Go to next song if it finishes
        this.audio.addEventListener("ended", () => {
            this.nextSong();
        });

        this.source.src = file.getFileName();
        // Set album cover if any
        console.log(file.thumbnail);
        if(file.thumbnail.length > 0){
            if(file.thumbnail == "NONE"){
                this.cover.src = file.getMimeIcon();
            }else{
                this.cover.src = file.thumbnail;
            }
        }else{
            this.cover.src = file.getMimeIcon();
        }
    }

    setPlaylist(playlist){
        this.playlist = playlist;
    }

    getPlaylistIndex(){
        if(!this.playlist){
            return -1;
        }

        for(let i = 0; i < this.playlist.length; i++){
            if(this.playlist[i].getFileName() == this.title.innerText){
                return i;
            }
        }
        return -1;
    }

    loadFromIndex(index){
        this.currentIndex = index % this.playlist.length;
        return this.playlist[this.currentIndex];
    }

    playbutton_icon(icon){
        dom_show(document.getElementById("img-play"), icon);
        dom_show(document.getElementById("img-pause"), !icon);
    }

    mutebutton_icon(icon){
        dom_show(document.getElementById("img-mute"), icon);
        dom_show(document.getElementById("img-unmute"), !icon);
    }

    updateSlider(){
        this.slider.value = Math.floor(this.audio.currentTime);
        this.current.innerText = MusicPlayer.secondsHumanReadable(this.audio.currentTime);
        fancy_range_slider_set(this.slider);
    }

    shuffling(){
        return this.shuffle.checked;
    }

    setLooping(looping){
        if(!this.audio){
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

    nextSong(){
        if(!this.playlist){
            return;
        }
        if(!this.shuffling()){
            this.play(null, this.currentIndex + 1);
            return;
        }
        
        let indexDiff = Math.ceil(Math.random()*(this.playlist.length - 1))
        this.play(null, this.currentIndex + indexDiff);
    }

    prevSong(){
        this.play(null, this.playlist.length + this.currentIndex - 1);
    }

    static secondsHumanReadable(timeS){
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
}