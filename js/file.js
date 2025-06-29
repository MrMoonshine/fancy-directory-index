class Preview{
    constructor(dom){
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

        this.actionnewtab = Preview.action_create("Open in new tab", "/assets/icons/pencil.webp");
        this.actionnewtab.setAttribute("target", "_blank");
        this.actions.appendChild(this.actionnewtab);
        this.actiondownload = Preview.action_create("Download", "/assets/icons/pencil.webp");
        this.actions.appendChild(this.actiondownload);

        let mimefigure = document.createElement("figure");
        this.mimefigcaption = document.createElement("figcaption");
        mimefigure.appendChild(this.mimeicon);
        mimefigure.appendChild(this.mimefigcaption);
        this.domInfo.appendChild(mimefigure);
        this.domInfo.appendChild(this.actions);
    }
    
    show(file){
        this.previews.forEach((preview) => {
            dom_show(preview, false);
        });

        this.figcaption.innerText = file.getFileName();
        this.mimefigcaption.innerText = file.getFileName();
        this.mimeicon.src = file.getMimeIcon();

        this.actionnewtab.href = file.getFileName();
        this.actiondownload.href = file.getFileName();
        this.actiondownload.setAttribute("download", file.getFileName());

        switch(file.filetype){
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
            default:
                dom_show(this.previewText, true);
                this.previewText.innerText = "WIP";
                break;
        }
    }

    stop_video(){
        this.previewVideo.remove();
        /*let sources = Array.from(this.previewVideo.getElementsByTagName("source"));
        sources.forEach(source => {
            source.remove();
        });*/
    }

    static action_create(text, icon = "", tagname = "a", callback = null){
        let action = document.createElement(tagname);
        action.classList.add("action");
        if(icon.length > 0){
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
        }else{
            action.innerText = text;
        }

        if(callback){
            action.addEventListener("click", callback);
        }
        return action;
    }
}

class File{
    static Types = {
        OTHER: "other",
        IMAGE: "image",
        VIDEO: "video",
        FOLDER: "folder",
        AUDIO: "audio",
        TEXT: "text",
        PDF: "pdf"
    };
    static THUMBNAIL_DEFAULT = File.getFallbackThumbnail()
    //static EXTENSIONS_VIDEO = [".mp4", ""];

    static overlay = document.getElementById("overlay");
    static overlayCloser = overlay.querySelector("button.close");
    //static preview = 
    static display = document.createElement("div");
    static btnOpen = document.createElement("a");
    static preview = new Preview(File.overlay);
    static btnDownload = document.createElement("a");

    constructor(table_row) {
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
            }else if (originalicon[0].alt == "[AUD]" || originalicon[0].alt == "[AUDIO]") {
                this.filetype = File.Types.AUDIO;
            }else if (originalicon[0].alt == "[TXT]" || originalicon[0].alt == "[TEXT]") {
                this.filetype = File.Types.TEXT;
            }else if (originalicon[0].alt == "[IMG]" || filelink.href.toUpperCase().endsWith(".WEBP")) {
                this.filetype = File.Types.IMAGE;
            }
            else if (originalicon[0].alt == "[PDF]"){
                this.filetype = File.Types.PDF;
            }
        } else {
            this.img.src = "";
        }

        // Set href for dir
        if(this.filetype == File.Types.FOLDER){
            this.item.href = filelink.href;
        }else{
            // Open Previe
            this.item.addEventListener("click", () => {this.showPreview()});
        }

        // Bottom Link
        this.filename = document.createElement("div");
        this.filename.classList.add("filename");
        this.filename.innerHTML = filelink.innerText;

        // Building item
        switch (this.filetype) {
            case File.Types.FOLDER:
                let a = document.createElement("a");
                a.href = this.item.href;
                a.appendChild(this.img);
                this.item.appendChild(a);
                a.classList.add("folder-link");

                // Get folder icon
                if(originalicon[0].alt == "[DIR]"){
                    this.setFolderIcon(a);
                }
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

    setFolderIcon(link){
        let url = new URL(window.location);
        if(url.pathname.startsWith("/gia")){
            url.pathname = "/gia/directory/testicon.php";
        }else{
            url.pathname = "/directory/testicon.php";
        }
        
        let file = window.location.pathname + this.filename.innerHTML;
        url.searchParams.append("dir", file);
        //console.log(window.location.pathname + this.filename.innerHTML);
          
        const req = new XMLHttpRequest();
        req.addEventListener("loadend", (data) => {
            let jdata = JSON.parse(req.responseText);
            if(jdata.exists == "y"){
                let img = document.createElement("img");
                img.alt = "";
                img.src = file + ".directory";
                img.classList.add("folder-icon");

                link.appendChild(img);
                //console.log(link);
            }
        });
        req.open("GET", url);
        req.send();
          
    }

    showPreview() {
        File.preview.show(this);
        dom_show(File.overlay, true);
        /*File.overlay.title.innerHTML = this.filename.innerHTML;
        File.display.innerHTML = "";    // Clear overlay contents
        switch (this.filetype) {
            case File.Types.IMAGE:
                let img = vid = document.createElement("img");
                img.src = this.item.href;
                img.alt = this.filename.innerHTML;

                File.display.appendChild(img);
                break;
            case File.Types.VIDEO:
                var vid = document.createElement("video");
                vid.controls = true;
                var src = document.createElement("source");
                src.setAttribute("src", this.item.href);
                vid.appendChild(src);
                File.display.appendChild(vid);
                vid.innerHTML += "Your browser does not support HTML5 video.";
                break;
            default:
                File.display.innerHTML = "No preview for filetype " + this.filetype;
        }

        File.btnOpen.href = this.item.href;
        File.btnDownload.href = this.item.href;
        File.btnDownload.download = this.item.href;

        File.overlay.show();*/
    }

    folderIcon(url) {
        if (this.img.alt != "[DIR]") {
            return;
        }
        let icon = document.createElement("img");
        icon.alt = "";
        icon.addEventListener("error", (event) => {}); // surpress warnings. at least firefox...
        icon.src = url + ".directory";
        icon.addEventListener("load", (event) => {
            // All good. Append
            let parent = this.img.parentElement;
            parent.classList.add("folder-link");
            parent.appendChild(icon);
            icon.classList.add("folder-icon");
            console.log(parent);
        });
        //console.log(icon.width + " and " + icon.naturalWidth);      
    }

    match(search = "") {
        if (search == "") {
            return true;
        }

        return this.filename.innerHTML.toUpperCase().includes(search.toUpperCase()) || this.filename.innerHTML == "Parent Directory";
    }

    show(){
        this.item.style.display = "grid";
    }

    hide(){
        this.item.style.display = "none";
    }

    has_preview() {
        return this.img.alt == "[IMG]" || this.img.alt == "[VIDEO]";
    }

    getFileName(){
        return this.filename.innerText;
    }

    getFileLink(){
        return this.href;
    }

    getMimeIcon(){
        return this.img.src;
    }

    static fetchFromHTML(table, viewer) {
        let files = [];
        // Error handle
        if (!table) {
            console.error("Invalid table loaded: " + table);
            return files;
        }

        let tfiles = table.getElementsByTagName("tr");
        for (let i = 1; i < tfiles.length; i++) {
            // Exclude the horizontal lines
            if (tfiles[i].getElementsByTagName("hr").length == 0) {
                //this.files.push(new File(tfiles[i], this.viewer));
                files.push(new File(tfiles[i], viewer))
            }
        }

        // Detach sorting links
        let links = tfiles[0].getElementsByTagName("a");
        let button_group = document.getElementById("sortingButtons");
        if(!button_group){
            console.warn("No button group for sorting found! (id: sortingButtons)");
            return files;
        }

        for (let i = 0; i < links.length; i++){
            //console.log(links[i].href);
            let a = document.createElement("a");
            a.classList.add("input-group-append");
            //a.classList.add("btn");
            //a.classList.add("ascending");
            a.href = links[i].href;
            a.innerHTML = links[i].innerHTML;

            let sorturl = new URL(a.href);
            if(sorturl.searchParams.get("C").includes("O=A")){
                a.classList.add("ascending");
            }else if(sorturl.searchParams.get("C").includes("O=D")){
                a.classList.add("descending");
            }

            button_group.appendChild(a);
        }

        return files;
    }

    static getFallbackThumbnail(){
        let dom = document.getElementById("thumbnail-fallback")
        if(!dom){
            return "";
        }

        return dom.src;
    }
}
File.overlayCloser.addEventListener("click", () => {
    dom_show(File.overlay, false);
    File.preview.stop_video();
});
// Build overlay HTML
File.display.classList.add("modal-filedisplay")
File.overlay.appendChild(File.display);

File.btnOpen.innerHTML = "Open in new tab";
File.btnOpen.target = "_blank";
File.btnOpen.classList.add("btn");

File.btnDownload.innerHTML = "Download";
File.btnDownload.classList.add("btn");

/*let btnflexbox = document.createElement("div");
btnflexbox.appendChild(File.btnOpen);
btnflexbox.appendChild(File.btnDownload);
btnflexbox.classList.add("btn-group");

File.overlay.appendToFooter(btnflexbox);*/