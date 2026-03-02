function api_get(callback, resource, id = null){
    let url = new URL(window.location);
    url.pathname = API_ENDPOINT;
    url.searchParams.append("resource", resource);

    if(id){
        url.searchParams.append("id", id);
    }

    var req = new XMLHttpRequest();
    req.addEventListener("load", () => {
        if (req.status != 200) {
            console.error(`API ERROR ${req.status}: ${req.statusText}`);
        }
        try {
            let jobs = JSON.parse(req.responseText);
            callback(jobs);
        } catch (err) {
            console.error(err);
        }
    });
    req.open("GET", url);
    req.send();
}


function api_modify(callback, resource, formData = null){
    let url = new URL(window.location);
    url.pathname = API_ENDPOINT;
    url.searchParams.append("resource", resource);

    var req = new XMLHttpRequest();
    req.addEventListener("load", () => {
        if (req.status != 200) {
            console.error(`API ERROR ${req.status}: ${req.statusText}`);
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