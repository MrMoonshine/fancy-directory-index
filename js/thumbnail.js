const THUMBNAIL_API = APACHE_ALIAS + "settings/api.php";
const THUMBNAIL_CREATE_RATE_LIMIT = 2500; //ms => wait 5 seconds after each generation

class Thumbnail {
    static IMAGE_DIMENSION = 256;
    static TODO = [];
    static DIRECTORY = THUMBNAIL_DIR;
    static PROGRESS_BAR = document.createElement("progress");
    static TOAST = new Toast();

    constructor(file, callback) {
        let filename = encodeURIComponent(file.getFileName());
        console.log("[Thumbnail] Requesting new for " + filename);

        if (file.filetype == File.Types.IMAGE) {
            this.createImageThumbnail(filename, callback);
        } else if (file.filetype == File.Types.VIDEO) {
            this.createVideoThumbnail(filename, callback);
        } else if (filename.toLowerCase().endsWith(".mp3")) {
            this.createAudioThumbnail(filename, callback);
        }
    }

    createVideoThumbnail(filename, callback) {
        this.video = document.createElement("video");
        this.source = document.createElement("source");

        this.video.classList.add(CLASS_HIDDEN);
        this.video.appendChild(this.source);
        document.body.appendChild(this.video);

        let myurl = new URL(window.location);

        let fd = new FormData();
        fd.set("asset", filename);
        fd.set("path", myurl.pathname);

        this.video.addEventListener("loadeddata", () => {
            this.video.addEventListener("seeked", () => {
                let base64 = this.toBase64();
                //console.log(base64);
                fd.set("thumbnail", base64);
                // Submit finished thumbnail to server
                let url = new URL(window.location);
                url.pathname = THUMBNAIL_API;
                let req = new XMLHttpRequest();
                req.addEventListener("load", (event) => {
                    Thumbnail.requestHandler(req, callback);
                });
                req.open("POST", url, true);
                //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                req.send(fd);
            });
            // To get the thumbnail from 10% of the video
            this.video.currentTime = 0.1 * this.video.duration;
        });

        this.source.addEventListener("error", (err) => {
            console.warn("Got video error!");
            //console.warn(err);
            try {
                callback(null);
            } catch (e) {
                console.error(e);
            }
        });

        this.source.src = filename;
    }

    createAudioThumbnail(filename, callback) {
        if (!jsmediatags) {
            console.warn(`Unable to create Thumbnail for ${filename}: jsmediatags failed to load!`)
        }

        console.log("Checking " + filename);

        var req = new XMLHttpRequest();
        req.open('GET', filename);
        req.responseType = 'blob';
        req.addEventListener("load", () => {
            console.log(req.response);
            jsmediatags.read(req.response, {
                onSuccess: (tag) => {
                    console.log("Tags from audio:", tag);
                    const picture = tag.tags.picture;
                    // Setup API URL
                    let thumburl = new URL(window.location);
                    thumburl.pathname = THUMBNAIL_API;
                    let myurl = new URL(window.location);
                    let fd = new FormData();
                    fd.set("asset", filename);
                    fd.set("path", myurl.pathname);
                    let thumbreq = new XMLHttpRequest();
                    if (picture) {
                        const base64String = picture.data
                            .map(byte => String.fromCharCode(byte))
                            .join('');
                        const imageUrl = `data:${picture.format};base64,${btoa(base64String)}`;

                        fd.set("thumbnail", imageUrl);
                        thumbreq.addEventListener("load", (event) => {
                            Thumbnail.requestHandler(thumbreq, callback);
                        });
                        //thumbreq.setthumbrequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        console.log("Requesting thumbnail for " + filename);

                    } else {
                        fd.set("thumbnail", "NONE");
                        console.log(filename + " has no thumbnail!");
                        callback(null);
                        // Fire and forget
                    }

                    thumbreq.open("POST", thumburl, true);
                    thumbreq.send(fd);
                },
                onError: function (error) {
                    console.error("Metadata read error:", error);
                }
            });
        });
        req.send();
    }

    createImageThumbnail(filename, callback) {
        //console.log("here createImageThumbnail")
        let img = new Image();
        //document.body.appendChild(this.image);
        img.addEventListener("load", () => {
            const canvas = document.createElement("canvas");
            canvas.width = Thumbnail.IMAGE_DIMENSION;
            canvas.height = Thumbnail.IMAGE_DIMENSION;

            const ctx = canvas.getContext("2d");

            const scale = Math.max(
                Thumbnail.IMAGE_DIMENSION / img.naturalWidth,
                Thumbnail.IMAGE_DIMENSION / img.naturalHeight
            );

            const width = img.naturalWidth * scale;
            const height = img.naturalHeight * scale;

            ctx.drawImage(
                img,
                (Thumbnail.IMAGE_DIMENSION - width) / 2,
                (Thumbnail.IMAGE_DIMENSION - height) / 2,
                width,
                height
            );

            let imageData = canvas.toDataURL("image/webp", 0.85);
            let base64 = imageData.replace(/^data:image\/(png|jpeg);base64,/, '');
            //console.log(base64);

            let myurl = new URL(window.location);
            let fd = new FormData();
            fd.set("asset", filename);
            fd.set("path", myurl.pathname);

            fd.set("thumbnail", base64);
            // Submit finished thumbnail to server
            let url = new URL(window.location);
            url.pathname = THUMBNAIL_API;
            let req = new XMLHttpRequest();
            req.addEventListener("load", (event) => {
                Thumbnail.requestHandler(req, callback);
            });
            req.open("POST", url, true);
            //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.send(fd);
        });
        img.addEventListener("Error", () => {
            console.warn("Unable to load " + filename);
        })
        img.src = filename;
    }

    toBase64() {
        let canvas = document.createElement("canvas");
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        canvas.getContext('2d').drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
        const imageData = canvas.toDataURL("image/webp"); // or "image/jpeg"

        // Remove the data URL prefix to get just the Base64 string
        const base64Image = imageData.replace(/^data:image\/(png|jpeg);base64,/, '');
        return base64Image;

        //console.log(base64Image);
        //document.getElementById("outimg").src = base64Image;
    }

    static requestHandler(req, callback) {
        if (req.status != 200) {
            console.error(`${req.status} - ${req.statusText}`);
            return;
        }
        //console.log(JSON.parse(req.response));
        //console.log(req.response);
        try {
            let jobj = JSON.parse(req.response);
            callback(jobj);
        } catch (e) {
            console.error(e);
        }
    }

    static setToastProgress() {

    }

    static solicitate(queryb64, callback) {
        let url = new URL(window.location);
        url.pathname = THUMBNAIL_API;

        let fd = new FormData();
        fd.set("solicitation", queryb64);


        let req = new XMLHttpRequest();
        req.addEventListener("load", (event) => {
            if (req.status != 200) {
                console.error(`${req.status} - ${req.statusText}`);
                return;
            }

            //console.log(JSON.parse(req.response));
            //console.log(req.response);
            try {
                let jobj = JSON.parse(req.response);
                try {
                    Thumbnail.IMAGE_DIMENSION = Number(jobj["settings"]["preview"]["iconSize"]);
                } catch (error) {
                    console.warn(error);
                }
                callback(jobj);
            } catch (e) {
                console.error(e);
            }
        });
        req.open("POST", url, true);
        //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.send(fd);
    }
}
// Configure Progress Bar
Thumbnail.PROGRESS_BAR = document.createElement("progress");
Thumbnail.PROGRESS_BAR.setAttribute("max", 1);
Thumbnail.PROGRESS_BAR.setAttribute("value", 0);
Thumbnail.TOAST.additionalContent.appendChild(Thumbnail.PROGRESS_BAR);
//Thumbnail.TOAST.show("Oida", "Bam Oida", 0, Toast.BUTTONS_NONE);