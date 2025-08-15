const APACHE_ALIAS = "/fancy-directory-index/";

const THUMBNAIL_ENABLE = true;
var THUMBNAIL_DIR = APACHE_ALIAS + "settings/data/";

const CLASS_HIDDEN = "d-none";
const CLASS_UNKNOWN = "unknown";

const ICON_NEW_TAB = APACHE_ALIAS + "assets/newtab.svg";
const ICON_COPY_LINK = APACHE_ALIAS + "assets/edit-copy.svg";
const ICON_DOWNLOAD = APACHE_ALIAS + "assets/download.svg";
const ICON_SHARE = APACHE_ALIAS + "assets/share.svg";

const COOKIE_COLOR = "fdi_color";
const COOKIE_PAGEICON = "fdi_page_icon";
const COOKIE_BACKGROUND = "fdi_background_img";
const COOKIE_HORIZONTAL = "fdi_tile_horizontal";
const COOKIE_VERTICAL = "fdi_tile_vertical";
const COOKIE_GALLERY_MODE = "fdi_viewmode";

function dom_show(dom, shown) {
    if (shown) {
        dom.classList.remove(CLASS_HIDDEN);
    } else {
        dom.classList.add(CLASS_HIDDEN);
    }
}

function fancy_range_slider_set(slider) {
    if (!slider.max) {
        return;
    }
    const tempSliderValue = slider.value;
    const progress = (tempSliderValue / slider.max) * 100;
    //console.log("Progress is " + progress + " - oida - " + slider.max);
    slider.style.background = `linear-gradient(to right, var(--color-main) ${progress}%, var(--color-background-1) ${progress}%)`;
}

function fancy_range_sliders() {
    let sliders = Array.from(document.querySelectorAll('input[type="range"]'));
    sliders.forEach(slider => {
        fancy_range_slider_set(slider);
        slider.addEventListener("input", (event) => {
            fancy_range_slider_set(slider);
        });
    });
}

class DirectoryView {
    #mode = 0;
    constructor() {
        this.radioGallery = document.getElementById("radio-gallery");
        this.radioDetails = document.getElementById("radio-details");
        this.radios = [this.radioGallery, this.radioDetails];

        this.radios.forEach((radio) => {
            radio.addEventListener("change", () => {
                //cookie_set(COOKIE_GALLERY_MODE, radio.value, 1);
                localStorage.setItem(COOKIE_GALLERY_MODE, radio.value);
                this.setMode(Number(radio.value));
            });
        });

        this.widgetGallery = document.getElementById("widget-gallery");
        this.widgetDetails = document.getElementById("widget-details");
        this.widgets = [this.widgetGallery, this.widgetDetails];
        this.modeFromCookie();
    }

    modeFromCookie() {
        let mode = localStorage.getItem(COOKIE_GALLERY_MODE);
        if (!mode || mode.length < 1) {
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
        let hitcount = 0;
        for (let i = 0; i < this.widgets.length; i++) {
            dom_show(this.widgets[i], mode == i);
            if (mode == i) {
                hitcount += 1;
            }
        }

        if (hitcount > 0) {
            return;
        }
        // If no match was made default to first view
        dom_show(this.widgets[0], true);
    }
}