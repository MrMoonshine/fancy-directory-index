class Preview extends Overlay {
    static musicplayer = new MusicPlayer(document.getElementById("music-player"));

    constructor() {
        super();
        this.file = null;

        /*this.domPreview = dom.querySelector(".preview") ?? dom;
        this.domInfo = dom.querySelector(".info") ?? dom;*/
        this.domPreview = document.createElement("div");
        this.domPreview.classList.add("preview");
        this.domInfo = document.createElement("div");
        this.domInfo.classList.add("info");

        this.figure = document.createElement("figure");
        this.figcaption = document.createElement("figcaption");

        this.previews = [];
        this.previewText = document.createElement("pre");
        this.previews.push(this.previewText);
        this.previewImage = new Image();
        this.previews.push(this.previewImage);
        this.previewVideo = document.createElement("video");
        this.previews.push(this.previewVideo);
        this.previewVideo.innerText = "Your browser does not support the video tag";

        this.previewAudio = document.createElement("audio");
        this.previewAudio.classList.add("filedisplay");
        this.previewAudioThumbnail = new Image();
        this.previews.push(this.previewAudioThumbnail);
        //this.previewAudioThumbnail.classList.add("d-desktop");

        this.previewPDF = document.createElement("embed");
        this.previewPDF.classList.add("pdf");
        this.previews.push(this.previewPDF);
        this.previewNone = new Image();
        this.previews.push(this.previewNone);

        this.previews.forEach((preview) => {
            this.figure.appendChild(preview);
            preview.classList.add("filedisplay");
        });

        this.domPreview.appendChild(this.previewAudio);
        this.previews.push(this.previewAudio);

        this.figure.appendChild(this.figcaption);
        this.domPreview.appendChild(this.figure);

        this.mimeicon = new Image();
        this.mimeicon.classList.add("mimeicon");
        this.mimeicon.alt = "[IMG]";

        this.actions = document.createElement("div");
        this.actions.classList.add("actions");

        let actiontitle = Preview.action_create("Actions:", "", "button");
        actiontitle.setAttribute("disabled", true);
        this.actions.appendChild(actiontitle);

        this.actionnewtab = Preview.action_create("Open in new tab", ICON_NEW_TAB);
        this.actionnewtab.setAttribute("target", "_blank");

        this.actionShare = Preview.action_create("Share", ICON_SHARE, "button", () => {
            try {
                let url = new URL(window.location);
                url.pathname += this.file.getFileName();
                let sharePromise = navigator.share({
                    url: url
                });
                sharePromise.then(() => {
                    console.log("Shared...");
                });
            } catch (err) {
                console.error(`Error: ${err}`);
            }
        });
        this.actions.appendChild(this.actionShare);

        this.actions.appendChild(this.actionnewtab);
        this.actiondownload = Preview.action_create("Download", ICON_DOWNLOAD);
        this.actions.appendChild(this.actiondownload);

        let closeactions = document.createElement("div");
        closeactions.classList.add("actions");
        //closeactions.classList.add("d-mobile");
        closeactions.appendChild(Preview.action_create("Close", "", "button", () => {
            this.close();
        }));

        let mimefigure = document.createElement("figure");
        this.mimefigcaption = document.createElement("figcaption");
        mimefigure.appendChild(this.mimeicon);
        mimefigure.appendChild(this.mimefigcaption);
        this.domInfo.appendChild(mimefigure);
        this.domInfo.appendChild(this.actions);
        let hr = document.createElement("hr");
        hr.classList.add("d-mobile");
        this.domInfo.appendChild(hr);
        this.domInfo.appendChild(closeactions);

        // Captions
        let captions = [];
        for (let i = 0; i < 3; i++) {
            let caption = document.createElement("div");
            caption.classList.add("caption");
            this.mimefigcaption.appendChild(caption);
            captions.push(caption);
        }
        this.captionFilename = captions[0];
        this.captionDimensions = captions[1];
        this.captionSize = captions[2];

        // Write Image DImensions
        this.previewImage.addEventListener("load", () => {
            this.captionDimensions.innerText = `${this.previewImage.naturalWidth}x${this.previewImage.naturalHeight}`;
            this.captionDimensions.classList.remove(CLASS_HIDDEN);
        });

        // Buttons for next & prev item
        this.prevbutton = document.createElement("button");
        this.prevbutton.setAttribute("type", "button");
        this.prevbutton.classList.add("prev");
        this.prevbutton.classList.add("d-desktop");
        this.prevbutton.innerHTML = "&#8249;";
        this.prevbutton.addEventListener("click", () => {
            this.show_prev();
        });
        this.domPreview.appendChild(this.prevbutton);

        this.nextbutton = document.createElement("button");
        this.nextbutton.setAttribute("type", "button");
        this.nextbutton.classList.add("next");
        this.nextbutton.classList.add("d-desktop");
        this.nextbutton.innerHTML = "&#8250;";
        this.nextbutton.addEventListener("click", () => {
            this.show_next();
        });
        this.domPreview.appendChild(this.nextbutton);

        // Image zoom
        this.previewImage.addEventListener("click", () => {
            this.image_toggle_height_limit();
        });

        this.content.appendChild(this.domPreview);
        this.content.appendChild(this.domInfo);
    }

    show(file) {
        if (!file) {
            console.warn("Unable to show null as file!");
            return;
        }
        //console.log(file);
        this.file = file;
        this.previews.forEach((preview) => {
            dom_show(preview, false);
        });
        this.stop_video();
        // hide prev & next button in case no prev or next exists
        dom_show(this.prevbutton, Boolean(this.file.prev));
        dom_show(this.nextbutton, Boolean(this.file.next));

        this.figcaption.innerText = file.getFileName();
        //this.mimefigcaption.innerText = file.getFileName();
        this.captionFilename.innerText = file.getFileName();
        this.mimeicon.src = file.getMimeIcon();

        this.actionnewtab.href = file.getFileName();
        this.actiondownload.href = file.getFileName();
        this.actiondownload.setAttribute("download", file.getFileName());

        /*if(navigator.canShare){
            console.log("Can share")
            dom_show(this.actionShare, navigator.canShare);
        }else{
            console.log("Can't share")
            dom_show(this.actionShare, false);
        }*/
       dom_show(this.actionShare, navigator.canShare);

        let isAudio = file.filetype == File.Types.AUDIO;
        dom_show(Preview.musicplayer.dom, isAudio);
        if (Preview.musicplayer.audio) {
            if (!isAudio) {
                Preview.musicplayer.audio.remove();
            }
        }

        switch (file.filetype) {
            case File.Types.IMAGE:
                dom_show(this.previewImage, true);
                this.previewImage.src = file.getFileLink();
                break;
            case File.Types.VIDEO:
                this.previewVideo.remove();
                this.previewVideo = document.createElement("video");
                let src1 = document.createElement("source");
                src1.src = file.getFileLink();
                //src.type = "video/mp4";
                this.previewVideo.controls = true;
                this.previewVideo.classList.add("filedisplay");
                this.previewVideo.appendChild(src1);
                this.figure.prepend(this.previewVideo);
                break;
            case File.Types.AUDIO:
                Preview.musicplayer.play(file);
                return;
                break;
            case File.Types.PDF:
                this.previewPDF.src = file.getFileLink();
                dom_show(this.previewPDF, true);
                break;
            default:
                dom_show(this.previewText, true);
                this.previewText.innerText = "";
                // Limit for filedisplay is 100K
                if (file.getSize() <= 100 * Math.pow(10, 3)) {
                    this.text_preview_load(file.getFileLink());
                }
                break;
        }
        this.title.innerText = file.getFileName();
        this.overlay.showModal();
    }

    show_prev() {
        this.show(this.file.prev);
    }

    show_next() {
        this.show(this.file.next);
    }

    stop_video() {
        this.previewVideo.remove();
        this.previewAudio.remove();
        /*let sources = Array.from(this.previewVideo.getElementsByTagName("source"));
        sources.forEach(source => {
            source.remove();
        });*/
    }

    text_preview_load(url) {
        let req = new XMLHttpRequest();
        req.addEventListener("load", (event) => {
            if (req.status != 200) {
                console.error(`${req.status} - ${req.statusText}`);
                return;
            }

            this.previewText.innerText = req.response;
        });
        req.open("GET", url, true);
        req.send();
    }

    image_toggle_height_limit() {
        const CLASS_UNSET = "unset-max-height";
        if (this.previewImage.classList.contains(CLASS_UNSET)) {
            this.previewImage.classList.remove(CLASS_UNSET);
        } else {
            this.previewImage.classList.add(CLASS_UNSET);
        }
    }

    static action_create(text, icon = "", tagname = "a", callback = null) {
        let action = document.createElement(tagname);
        action.classList.add("action");
        if (icon.length > 0) {
            action.classList.add("d-flex");
            action.classList.add("justify-content-left");
            action.classList.add("gap");
            let imgcontainer = document.createElement("div");
            imgcontainer.classList.add("sillouhette-img");
            let img = document.createElement("div");
            img.classList.add("masked-icon");
            // mask-image: url('/fancy-directory-index/assets/speaker.svg')
            img.style.maskImage = `url('${icon}')`;
            /*img.src = icon;
            img.alt = "[IMG]";*/

            imgcontainer.appendChild(img);
            action.appendChild(imgcontainer);
            let textdiv = document.createElement("div");
            textdiv.innerText = text;
            action.appendChild(textdiv);
        } else {
            action.innerText = text;
        }

        if (callback) {
            action.addEventListener("click", callback);
        }
        return action;
    }
}