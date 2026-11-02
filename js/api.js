function api_get(callback, resource, id = null, http_code_terminate = false){
    let url = new URL(window.location);
    url.pathname = API_ENDPOINT;
    url.searchParams.append("resource", resource);

    if(id){
        url.searchParams.append("id", id);
    }

    var req = new XMLHttpRequest();
    req.addEventListener("load", () => {
        if (req.status < 200 || req.status >= 300) {
            let toast = new Toast();
            toast.show(`${req.status}: ${req.statusText}`, `API ERROR ${req.status}: ${req.statusText}`, TOAST_DEFAULT_TIMER, Toast.BUTTONS_NONE, ICON_DIALOG_ERROR);
            console.error(`API ERROR ${req.status}: ${req.statusText}`);
            if(http_code_terminate){
                return;
            }
        }
        try {
            console.log(req.responseText);
            let jobs = JSON.parse(req.responseText);
            callback(jobs);
        } catch (err) {
            console.error(err);
        }
    });
    req.open("GET", url);
    req.send();
}


function api_modify(callback, resource = null, formData = null, http_code_terminate = false){
    let url = new URL(window.location);
    url.pathname = API_ENDPOINT;
    if(resource){
        url.searchParams.append("resource", resource);
    }

    var req = new XMLHttpRequest();
    req.addEventListener("load", () => {
        if (req.status < 200 || req.status >= 300) {
            let toast = new Toast();
            toast.show(`${req.status}: ${req.statusText}`, `API ERROR ${req.status}: ${req.statusText}`, TOAST_DEFAULT_TIMER, Toast.BUTTONS_NONE, ICON_DIALOG_ERROR);
            console.error(`API ERROR ${req.status}: ${req.statusText}`);
            if(http_code_terminate){
                return;
            }
        }
        try {
            let jobs = JSON.parse(req.responseText);
            callback(jobs);
        } catch (err) {
            console.error(err);
        }
    });

    req.open("POST", url);
    req.send(formData);
}