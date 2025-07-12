const THUMBNAIL_API = APACHE_ALIAS + "settings/thumbnail.php";
class Thumbnail{
    constructor(){
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
        req.open("POST", url, false);
        //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.send(fd);
    }
}