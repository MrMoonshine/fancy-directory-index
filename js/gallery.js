const POLAROID_COPY_IMAGE = ICON_COPY_LINK;
const POLAROID_NEW_TAB_IMAGE = ICON_NEW_TAB;
try {
    var POLAROID_TOAST = new Toast();
} catch (error) {
    console.log(error);
}

class Polaroid extends PaginationItem {
    // file is of type class File
    constructor(file) {
        let isDirectory = file.filetype == File.Types.FOLDER;
        // Call PaginationItem constructer with base div
        super(document.createElement(isDirectory ? "a" : "div"));
        this.item.classList.add("polaroid");
        this.loaded = false;
        //this.generateThumbnail = false;
        this.thumbnail = "";
        this.videoicon = new Image();
        this.videoicon.classList.add(CLASS_HIDDEN);
        // init
        this.file = file;
        this.filename = this.file.filename.innerHTML ?? "UNKNOWN";
        // initially, hide element
        this.hide();

        let showbuttons = this.file.filetype != File.Types.FOLDER;//this.file.filetype == File.Types.IMAGE || this.file.filetype == File.Types.VIDEO;
        let fbtop = document.createElement("div");
        fbtop.classList.add("d-flex");
        fbtop.classList.add("buttons");

        let newtabbutton = document.createElement("a");
        let copybutton = document.createElement("button");
        copybutton.classList.add("copy");

        if (showbuttons) {
            let cpyimg = new Image();
            cpyimg.src = POLAROID_COPY_IMAGE;
            cpyimg.alt = "copy";
            copybutton.appendChild(cpyimg);

            copybutton.addEventListener("click", (event) => {
                // prevent overlay event
                if (event && event.stopPropagation) event.stopPropagation();
                let copycontent = Polaroid.hrefSanitize(this.file.getFileLink());
                // copy to clipboard
                let promise = navigator.clipboard.writeText(copycontent);
                promise.then(() => {
                    try {
                        POLAROID_TOAST.show(
                            "Copied!",
                            copycontent,
                            4,
                            Toast.BUTTONS_NONE,
                            POLAROID_COPY_IMAGE
                        );
                    } catch (error) {
                        console.log(error);
                    }
                }, () => {
                    console.log("Unable to copy to clipboard");
                })
            });

            newtabbutton.href = this.file.href;
            newtabbutton.setAttribute("target", "_blank");
            newtabbutton.classList.add("new-tab");

            let ntbimg = new Image();
            ntbimg.src = POLAROID_NEW_TAB_IMAGE;
            ntbimg.alt = "new-tab";
            newtabbutton.appendChild(ntbimg);

            newtabbutton.addEventListener("click", (event) => {
                if (event && event.stopPropagation) event.stopPropagation();
            });
        }

        let filenamep = document.createElement("p");
        filenamep.classList.add("filename");
        filenamep.innerHTML = this.filename;

        if (showbuttons) {
            fbtop.appendChild(newtabbutton);
            fbtop.appendChild(copybutton);
            //fbtop.appendChild(maximizebutton);
            this.item.appendChild(fbtop);
        }
        this.item.appendChild(filenamep);

        //maximizebutton.addEventListener("click", this.file.showPreview.bind(this.file));
        if (isDirectory) {
            if (!this.file.img.alt.includes("PARENT")) {
                this.setFolderIcon();
            }

            return;
        }
        // Show file preview on click
        this.item.addEventListener("click", this.file.showPreview.bind(this.file));
    }

    show() {
        // show from parent class
        super.show();

        // Ignore for videos
        if (this.loaded && this.filetype == File.Types.VIDEO) {
            this.setThumbnail(this.thumbnail);
        }

        if (this.loaded) {
            return;
        }

        //var image = "";
        switch (this.file.filetype) {
            case File.Types.IMAGE:
                this.item.style.backgroundImage = `url("${Polaroid.hrefSanitize(this.file.getFileLink())}")`;
                break;
            case File.Types.VIDEO:
                //image = ".thumbnail." + this.filename + ".jpg";
                this.setThumbnail(this.thumbnail);
                this.videoicon.classList.add("videoicon");
                this.videoicon.alt = "Video";
                this.videoicon.src = this.file.img.src;
                this.item.appendChild(this.videoicon);
                break;
            case File.Types.FOLDER:
                this.item.href = this.file.item.href
                let iconDir = new Image();
                iconDir.alt = this.file.img.alt ?? "[DIR]";
                iconDir.src = this.file.img.src;
                iconDir.classList.add("icon");
                this.item.appendChild(iconDir);
                break;
            default:
                let icon = new Image();
                icon.alt = this.file.img.alt ?? "";
                icon.src = this.file.img.src;
                icon.classList.add("icon");
                this.item.appendChild(icon);
                break;
        }
        this.loaded = true;
    }

    match(term) {
        if (term.length == 0) {
            return true;
        }
        //console.log("Check if " + this.filename + " includes " + term + " | result: " + this.filename.includes(term));
        return this.filename.toUpperCase().includes(term.toUpperCase());
    }

    dom() {
        return this.item;
    }

    setFolderIcon() {
        try {
            let file = window.location.pathname + this.file.filename.innerHTML;
            let img = document.createElement("img");
            img.addEventListener("error", () => {
                img.remove();
            });
            //img.style.backgroundImage = `url("${file + ".directory"}")`;
            img.alt = "";
            img.src = file + ".directory";
            img.classList.add("folder-icon");
            this.item.appendChild(img);
        } catch (err) {
            return;
        }

    }

    setThumbnail(image) {
        //console.log("Try to set Thumbnail: " + image);
        if (image.length < 1) {
            this.item.style.backgroundImage = `url("${this.file.img.src}")`;
            return;
        }
        this.item.style.backgroundImage = `url("${image}")`;
        let errtestimg = document.createElement("img");
        errtestimg.addEventListener("error", (evt) => {
            if (errtestimg.classList.contains(CLASS_UNKNOWN)) {
                return;
            }
            errtestimg.classList.add(CLASS_UNKNOWN);
            errtestimg.src = this.file.img.src;
            image = this.file.img.src;
            this.setThumbnail(image);
            console.log("image is now " + image);
        });
        errtestimg.addEventListener("load", () => {
            errtestimg.remove();
        });
        this.item.appendChild(errtestimg);
        errtestimg.src = image;
        errtestimg.classList.add(CLASS_HIDDEN);
    }

    createThumbnail() {
        console.log("Requesting a new Thumbnail for " + this.file.getFileName());
        let thumbnail = new Thumbnail(this.file.getFileName(), (data) => {
            this.setThumbnail(THUMBNAIL_DIR + data["thumbnail"]);
        });
    }

    isVisible() {
        return this.item.classList.contains(CLASS_HIDDEN)
    }

    static hrefSanitize(href) {
        let ret = "";
        ret = href.replaceAll("'", "%27"); // Fixes issue with CSS URL when an apostrophe is in use
        return ret;
    }
}