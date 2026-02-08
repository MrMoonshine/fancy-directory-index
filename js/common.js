const APACHE_ALIAS = "/fancy-directory-index/";
const API_ENDPOINT = APACHE_ALIAS + "settings/api.php";

const THUMBNAIL_ENABLE = true;
var THUMBNAIL_DIR = APACHE_ALIAS + "settings/data/";

const CLASS_HIDDEN = "d-none";
const CLASS_UNKNOWN = "unknown";

const ICON_NEW_TAB = APACHE_ALIAS + "assets/newtab.svg";
const ICON_COPY_LINK = APACHE_ALIAS + "assets/edit-copy.svg";
const ICON_DOWNLOAD = APACHE_ALIAS + "assets/download.svg";
const ICON_SHARE = APACHE_ALIAS + "assets/share.svg";
const ICON_COPY = APACHE_ALIAS + "assets/edit-copy.svg";

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
/**
 * Converts hex color to HSV array [hue, saturation%, value%]
 * @param {string} hex - #rrggbb or #rgb
 * @returns {[number, number, number]} [hue 0–360, saturation 0–100, value 0–100]
 */
function color_hex_to_hsv(hex) {
  // Remove # and normalize short hex
  hex = hex.replace(/^#/, '').toLowerCase();
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }

  if (hex.length !== 6 || !/^[0-9a-f]{6}$/.test(hex)) {
    throw new Error("Invalid hex color");
  }

  // Hex → RGB (0–255)
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Normalize to 0–1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // Value (brightness)
  const v = Math.round(max * 100);

  // Saturation
  let s = 0;
  if (max !== 0) {
    s = Math.round((delta / max) * 100);
  }

  // Hue
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = (gNorm - bNorm) / delta;
    } else if (max === gNorm) {
      h = 2 + (bNorm - rNorm) / delta;
    } else {
      h = 4 + (rNorm - gNorm) / delta;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return [Math.round(h), s, v];
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