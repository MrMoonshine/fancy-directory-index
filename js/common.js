const CLASS_HIDDEN = "d-none";
const CLASS_UNKNOWN = "unknown";

const APACHE_ALIAS = "/fancy-directory-index/";

const ICON_NEW_TAB = APACHE_ALIAS + "assets/newtab.svg";
const ICON_COPY_LINK = APACHE_ALIAS + "assets/edit-copy.svg";
const ICON_DOWNLOAD = APACHE_ALIAS + "assets/download.svg";

function dom_show(dom, shown) {
    if (shown) {
        dom.classList.remove(CLASS_HIDDEN);
    } else {
        dom.classList.add(CLASS_HIDDEN);
    }
}

function cookie_get(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function cookie_set(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Lax";
}

class DirectoryView {
    #mode = 0;
    static cookiename = "viewmode"
    constructor() {
        this.radioGallery = document.getElementById("radio-gallery");
        this.radioDetails = document.getElementById("radio-details");
        this.radios = [this.radioGallery, this.radioDetails];

        this.radios.forEach((radio) => {
            radio.addEventListener("change", () => {
                cookie_set(DirectoryView.cookiename, radio.value, 1);
                this.setMode(Number(radio.value));
            });
        });

        this.widgetGallery = document.getElementById("widget-gallery");
        this.widgetDetails = document.getElementById("widget-details");
        this.widgets = [this.widgetGallery, this.widgetDetails];
        this.modeFromCookie();
    }

    modeFromCookie() {
        let mode = cookie_get(DirectoryView.cookiename);
        if(mode.length < 1){
            this.setMode(0);
            return;
        }

        this.radios.forEach((radio) => {
            radio.checked = radio.value == mode;
        });
        this.setMode(mode);
    }

    setMode(mode) {
        this.#mode = mode;
        for(let i = 0; i < this.widgets.length; i++){
            dom_show(this.widgets[i], mode == i);
        }
    }
}