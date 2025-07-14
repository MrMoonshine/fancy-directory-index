const THUMBNAIL_API = APACHE_ALIAS + "settings/thumbnail.php";
class Thumbnail{
    constructor(filename, callback){
        this.video = document.createElement("video");
        this.source = document.createElement("source");
        this.source.src = filename;

        this.video.classList.add(CLASS_HIDDEN);
        this.video.appendChild(this.source);
        document.body.appendChild(this.video);

        let myurl = new URL(window.location);

        let fd = new FormData();
        fd.set("video", filename);
        fd.set("path", myurl.pathname);

        this.video.addEventListener("loadeddata", () => {
            let base64 = this.toBase64();
            //console.log(base64);
            fd.set("thumbnail", base64);
            // Submit finished thumbnail to server
            let url = new URL(window.location);
            url.pathname = THUMBNAIL_API;
            let req = new XMLHttpRequest();
            req.addEventListener("load", (event) => {
                if(req.status != 200){
                    console.error(`${req.status} - ${req.statusText}`);
                    return;
                }

                //console.log(JSON.parse(req.response));
                //console.log(req.response);
                try{
                    let jobj = JSON.parse(req.response);
                    callback(jobj);
                }catch(e){
                    console.error(e);
                }
            });
            req.open("POST", url, true);
            //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            req.send(fd);
        });
    }

    toBase64(){
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

    static solicitate(queryb64, callback){
        let url = new URL(window.location);
        url.pathname = THUMBNAIL_API;

        let fd = new FormData();
        fd.set("solicitation", queryb64);


        let req = new XMLHttpRequest();
        req.addEventListener("load", (event) => {
            if(req.status != 200){
                console.error(`${req.status} - ${req.statusText}`);
                return;
            }

            //console.log(JSON.parse(req.response));
            //console.log(req.response);
            try{
                let jobj = JSON.parse(req.response);
                callback(jobj);
            }catch(e){
                console.error(e);
            }
        });
        req.open("POST", url, true);
        //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.send(fd);
    }
}