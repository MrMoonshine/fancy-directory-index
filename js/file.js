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

    /*static overlay = document.getElementById("overlay");
    static overlayCloser = overlay.querySelector("button.close");
    static display = document.createElement("div");*/
    static preview = new Preview();

    constructor(table_row) {
        this.prev = null;
        this.next = null;
        this.thumbnail = "";
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
        //dom_show(File.overlay, true);
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

    getMusicThumbnail(){
        if(this.thumbnail.length > 0){
            if(!this.thumbnail.endsWith("NONE")){
                return this.thumbnail;
            }
        }
        let pageicon = document.querySelector("#pageicon");
        console.log(pageicon);
        if(pageicon){
            if(pageicon.src.endsWith(".directory")){
                return pageicon.src;
            }
        }
        return this.getMimeIcon();
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

/*function overview_close() {
    dom_show(File.overlay, false);
    File.preview.stop_video();
}

File.overlayCloser.addEventListener("click", overview_close);
document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        overview_close();
    }
});*/

