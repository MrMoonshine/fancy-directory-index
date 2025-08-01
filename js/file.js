class Preview {
    constructor(dom) {
        this.file = null;

        this.domPreview = dom.querySelector(".preview") ?? dom;
        this.domInfo = dom.querySelector(".info") ?? dom;

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
        this.previews.push(this.previewAudio);
        this.previewPDF = document.createElement("embed");
        this.previewPDF.classList.add("pdf");
        this.previews.push(this.previewPDF);
        this.previewNone = new Image();
        this.previews.push(this.previewNone);

        this.previews.forEach((preview) => {
            this.figure.appendChild(preview);
            preview.classList.add("filedisplay");
        });

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
        this.actions.appendChild(this.actionnewtab);
        this.actiondownload = Preview.action_create("Download", ICON_DOWNLOAD);
        this.actions.appendChild(this.actiondownload);

        let closeactions = document.createElement("div");
        closeactions.classList.add("actions");
        closeactions.classList.add("d-mobile");
        closeactions.appendChild(Preview.action_create("Close", "", "button", overview_close));

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

        // Buttons for next & prev item
        this.prevbutton = document.createElement("button");
        this.prevbutton.classList.add("prev");
        this.prevbutton.classList.add("d-desktop");
        this.prevbutton.innerHTML = "&#8249;";
        this.prevbutton.addEventListener("click", () => {
            this.show_prev();
        });
        this.domPreview.appendChild(this.prevbutton);

        this.nextbutton = document.createElement("button");
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
        this.mimefigcaption.innerText = file.getFileName();
        this.mimeicon.src = file.getMimeIcon();

        this.actionnewtab.href = file.getFileName();
        this.actiondownload.href = file.getFileName();
        this.actiondownload.setAttribute("download", file.getFileName());

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
                this.previewAudio.remove();
                this.previewAudio = document.createElement("audio");
                let src2 = document.createElement("source");
                src2.src = file.getFileLink();
                //src.type = "audio/mp4";
                this.previewAudio.controls = true;
                this.previewAudio.classList.add("filedisplay");
                this.previewAudio.appendChild(src2);
                this.figure.prepend(this.previewAudio);
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
            let img = new Image();
            img.src = icon;
            img.alt = "[IMG]";
            action.appendChild(img);
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

class File {
    static Types = {
        OTHER: "other",
        IMAGE: "image",
        VIDEO: "video",
        FOLDER: "folder",
        AUDIO: "audio",
        TEXT: "text",
        PDF: "pdf"
    };

    static overlay = document.getElementById("overlay");
    static overlayCloser = overlay.querySelector("button.close");
    static display = document.createElement("div");
    static preview = new Preview(File.overlay);

    constructor(table_row) {
        this.prev = null;
        this.next = null;
        // Get original icon
        this.img = document.createElement("img");
        let originalicon = table_row.getElementsByTagName("img");
        this.filetype = File.Types.OTHER;
        // Is it a directory?
        if (originalicon.length > 0) {
            if (originalicon[0].alt == "[DIR]" || originalicon[0].alt == "[PARENTDIR]") {
                this.filetype = File.Types.FOLDER;
            }
        }
        // Mian DOM creation
        this.item = document.createElement(this.filetype == File.Types.FOLDER ? "a" : "button");
        this.item.classList.add("file");

        // Start here
        let tds = Array.from(table_row.getElementsByTagName("td"));
        this.size = document.createElement("div");
        this.date = document.createElement("div");
        try {
            let td_size = tds.pop();
            let td_date = tds.pop();
            let td_filename = tds.pop();
            let td_image = tds.pop();

            this.size.innerText = td_size.innerText;
            this.date.innerText = td_date.innerText;
        } catch (error) {

        }
        /*let lasttd = tds[tds.length - 1];
        this.size = document.createElement("div");
        if(lasttd){
            this.size.innerHTML = lasttd.innerHTML;
        }*/
        //this.img = table_row.getElementsByTagName("img")[0];

        let links = table_row.getElementsByTagName("a");
        let filelink = links[links.length - 1];
        this.href = filelink.href;
        /*---------------------------------------------------
            Detecting "Mime"-Type
        ----------------------------------------------------*/
        if (originalicon.length > 0) {
            this.img.src = originalicon[0].src;
            this.img.alt = originalicon[0].alt;
            //console.log(originalicon[0].alt);
            if (originalicon[0].alt == "[VID]" || originalicon[0].alt == "[VIDEO]") {
                this.filetype = File.Types.VIDEO;
            } else if (originalicon[0].alt == "[AUD]" || originalicon[0].alt == "[AUDIO]") {
                this.filetype = File.Types.AUDIO;
            } else if (originalicon[0].alt == "[TXT]" || originalicon[0].alt == "[TEXT]") {
                this.filetype = File.Types.TEXT;
            } else if (originalicon[0].alt == "[IMG]" || filelink.href.toUpperCase().endsWith(".WEBP")) {
                this.filetype = File.Types.IMAGE;
            }
            else if (originalicon[0].alt == "[PDF]") {
                this.filetype = File.Types.PDF;
            }
        } else {
            this.img.src = "";
        }

        // Set href for dir
        if (this.filetype == File.Types.FOLDER) {
            this.item.href = filelink.href;
        } else {
            // Open Previe
            this.item.addEventListener("click", () => { this.showPreview() });
        }

        // Bottom Link
        this.filename = document.createElement("div");
        this.filename.classList.add("filename");
        this.filename.innerText = filelink.innerText;

        // Building item
        switch (this.filetype) {
            case File.Types.FOLDER:
                let a = document.createElement("a");
                a.href = this.item.href;
                a.appendChild(this.img);
                this.item.appendChild(a);
                a.classList.add("folder-link");
                break;
            default:
                this.item.appendChild(this.img);
        }

        this.item.appendChild(this.filename);
        this.item.appendChild(this.date);
        this.item.appendChild(this.size);

        // Assigning listeners
        this.img.addEventListener("click", () => {
            this.showPreview();
        });
    }

    showPreview() {
        File.preview.show(this);
        dom_show(File.overlay, true);
    }

    match(search = "") {
        if (search == "") {
            return true;
        }

        return this.filename.innerHTML.toUpperCase().includes(search.toUpperCase()) || this.filename.innerHTML == "Parent Directory";
    }

    show() {
        this.item.style.display = "grid";
    }

    hide() {
        this.item.style.display = "none";
    }

    /*has_preview() {
        return this.img.alt == "[IMG]" || this.img.alt == "[VIDEO]";
    }*/

    getFileName() {
        return this.filename.innerText;
    }

    getFileLink() {
        return this.href;
    }

    getMimeIcon() {
        return this.img.src;
    }

    getSizeH() {
        return this.size.innerText;
    }

    getSize() {
        let str = this.getSizeH();
        const re = /\d+(((\.|\,)\d+)|)/g;
        let num = str.match(re);
        if (!num || num.length < 1) {
            return -1;
        }

        let base = Number(num[0]);
        let exponent = 1;
        if (str.toUpperCase().includes("K")) {
            exponent = 3;
        } else if (str.toUpperCase().includes("M")) {
            exponent = 6;
        } else if (str.toUpperCase().includes("G")) {
            exponent = 9;
        }
        return base * Math.pow(10, exponent);
    }

    static fetchFromHTML(table, viewer) {
        let files = [];
        // Error handle
        if (!table) {
            console.error("Invalid table loaded: " + table);
            return files;
        }

        let tfiles = table.getElementsByTagName("tr");
        let prevFileIndex = -1;
        for (let i = 1; i < tfiles.length; i++) {
            // Exclude the horizontal lines
            if (tfiles[i].getElementsByTagName("hr").length == 0) {
                let currentfile = new File(tfiles[i], viewer)
                files.push(currentfile);
                let currentIndex = files.length - 1;
                // Skip in case of DIR
                if (currentfile.filetype == File.Types.FOLDER) {
                    continue;
                }
                // Add prev and next links
                if (prevFileIndex >= 0) {
                    files[currentIndex].prev = files[prevFileIndex];
                    files[prevFileIndex].next = files[currentIndex];
                }
                prevFileIndex = currentIndex;
            }
        }

        // Detach sorting links
        let links = tfiles[0].getElementsByTagName("a");
        let button_group = document.getElementById("sortingButtons");
        if (!button_group) {
            console.warn("No button group for sorting found! (id: sortingButtons)");
            return files;
        }

        for (let i = 0; i < links.length; i++) {
            //console.log(links[i].href);
            let a = document.createElement("a");
            a.classList.add("input-group-append");
            //a.classList.add("btn");
            //a.classList.add("ascending");
            a.href = links[i].href;
            a.innerHTML = links[i].innerHTML;

            let sorturl = new URL(a.href);
            if (sorturl.searchParams.get("C").includes("O=A")) {
                a.classList.add("ascending");
            } else if (sorturl.searchParams.get("C").includes("O=D")) {
                a.classList.add("descending");
            }

            button_group.appendChild(a);
        }

        return files;
    }
}

function overview_close() {
    dom_show(File.overlay, false);
    File.preview.stop_video();
}

File.overlayCloser.addEventListener("click", overview_close);
document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        overview_close();
    }
});

