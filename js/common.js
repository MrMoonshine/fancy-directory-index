/*var toast = new Toast()*/

const APACHE_ALIAS = "/fancy-directory-index/";
const APACHE_ICON_ALIAS = "/fdi-icon-theme/";
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
const ICON_ARROW_UP = APACHE_ALIAS + "assets/go-up.png";
const ICON_ARROW_DOWN = APACHE_ALIAS + "assets/go-down.png";
const ICON_ADD_TO_PLAYLIST = APACHE_ICON_ALIAS + "actions/22/bookmarks.svg";

const ICON_DIR_HUE_OFFSET = 160; // For blue folders from breeze theme

const COOKIE_COLOR = "fdi_color";
const COOKIE_PAGEICON = "fdi_page_icon";
const COOKIE_BACKGROUND = "fdi_background_img";
const COOKIE_HORIZONTAL = "fdi_tile_horizontal";
const COOKIE_VERTICAL = "fdi_tile_vertical";
const COOKIE_GALLERY_MODE = "fdi_viewmode";

const CSS_IMAGE_UNKNOWN = "UNKNOWN";

const THEME_TILES_X = localStorage.getItem(COOKIE_HORIZONTAL) ?? 5;
const THEME_TILES_Y = localStorage.getItem(COOKIE_VERTICAL) ?? 4;

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
    //slider.style.background = `linear-gradient(to right, var(--color-main) 0%, var(--color-main) ${progress - 3}%, white ${progress}%, var(--color-background-1) ${progress}%)`;
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
    try {
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

    } catch (error) {
        console.warn(`Failed to convert "${hex}" into HSV`);
        return [180, 100, 25]; // Teal
    }
}

function thumbnail_full_path(thumbnail) {
    return `/nas/web/thumbnails/${thumbnail}`;
}

function image_fallback_favicon(evt) {
    let img = evt.target;
    if (img.classList.contains(CSS_IMAGE_UNKNOWN)) {
        return;
    }
    img.classList.add(CSS_IMAGE_UNKNOWN);

    img.src = "/favicon.ico";
}

function image_fallback_hide(evt) {
    let img = evt.target;
    if (img.classList.contains(CSS_IMAGE_UNKNOWN)) {
        return;
    }
    img.classList.add(CSS_IMAGE_UNKNOWN);
    img.classList.add(CLASS_HIDDEN);
}

function directory_index_size_to_B(value) {
    try{
        const match = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*([KMGT]?)$/i);

        if (!match) {
            throw new Error(`Invalid byte value: ${value}`);
        }

        const number = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        const multipliers = {
            "": 1,
            K: 1024,
            M: 1024 ** 2,
            G: 1024 ** 3,
            T: 1024 ** 4,
        };

        return number * multipliers[unit];
    } catch (error) {
        return 0;
    }
}

function bytes_human_radable(bytes){
    var s = ['bytes', 'kiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    if(bytes == 0){
        return `0 ${s[0]}`;
    }
    var e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
}

function rgb_to_hsl(color) {
  if (!((color ?? "").match(/(#|)[0-9a-fA-F]{6}/g))) {
    return [0, 0, 0];
  }

  var r = parseInt(color.substr(1, 2), 16); // Grab the hex representation of red (chars 1-2) and convert to decimal (base 10).
  var g = parseInt(color.substr(3, 2), 16);
  var b = parseInt(color.substr(5, 2), 16);

  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  ];
}

function set_theme_from_cookies() {
    let root = document.documentElement;
    root.style.setProperty("--gallery-tiles-x", THEME_TILES_X);
    root.style.setProperty("--gallery-tiles-y", THEME_TILES_Y);

    let theme_modes_all = ["default", "light", "dark"];
    let basic_cookies = ["color_main_default", "color_main_dark", "color_main_light"];

    let wallpaper_position = localStorage.getItem("wallpaper_position");
    if (wallpaper_position != null) {
        document.getElementById("dashboard").style.backgroundPosition = `${wallpaper_position}`;
    }

    basic_cookies.forEach(basic_cookie => {
        let css_var = `--${basic_cookie.replaceAll("_", "-")}`;
        switch (basic_cookie) {
            case "color_main":
                css_var += "-default";
                break;
            default:
                break;
        }
        let ci = localStorage.getItem(basic_cookie);
        console.log(`${basic_cookie} -> ${css_var} = ${ci}`);
        if (ci == null) {
            return;
        }
        root.style.setProperty(css_var, ci);
        console.log(css_var, ci);
        if (!css_var.includes("color")) {
            return;
        }
        theme_modes_all.forEach(theme_mode => {
            if (!css_var.includes(theme_mode)) {
                return;
            }
            hsv = color_hex_to_hsv(ci);
            root.style.setProperty(`--hue-rotate-directory-${theme_mode}`, `${hsv[0] + ICON_DIR_HUE_OFFSET}deg`);
            console.log(`--hue-rotate-directory-${theme_mode}`, `${hsv[0] + ICON_DIR_HUE_OFFSET}deg`);
        });
    });

    let theme_modes = ["light", "dark"];
    let orientation_modes = ["", "landscape", "portrait"];
    let js_css_vars = [""];

    theme_modes.forEach(tmode => {
        orientation_modes.forEach(omode => {
            if (omode.length > 0) {
                js_css_vars.push([tmode, omode].join("_"));
                return;
            }
            js_css_vars.push(tmode);
        });
    });

    js_css_vars.forEach(js_css_var => {
        let cookie_var_name_arr = ["wallpaper"];
        let css_var_name_arr = ["wallpaper"];
        if (js_css_var.length > 0) {
            css_var_name_arr.push(js_css_var.replaceAll("_", "-"));
            cookie_var_name_arr.push(js_css_var);
        }
        let css_var = "--" + css_var_name_arr.join("-");
        let cookie = cookie_var_name_arr.join("_");

        let bg = localStorage.getItem(cookie);
        if (bg != null) {
            console.log(`${cookie} -> ${css_var}`);
            console.log(bg);
            root.style.setProperty(css_var, `url("${bg}")`);
        }
    });

    root.style.setProperty("--color-autoshadow", `var(--color-autoshadow-themed)`);

    ["default", "light", "dark"].forEach(tmode => {
    let hexcolor = root.style.getPropertyValue("--color-main-" + tmode);
    console.log("--color-main-" + tmode, hexcolor);
    if (hexcolor.length > 0) {
      let hsl = rgb_to_hsl(hexcolor);

      console.log("--color-main-hue-" + tmode, hsl[0]);
      root.style.setProperty("--color-main-hue-" + tmode, hsl[0]);
      root.style.setProperty(`--color-main-sat-${tmode}`, `${hsl[1]}%`);
    }
  });

    let favicon = document.getElementById("pageicon");
    if (!favicon) {
        return;
    }

    favicon.addEventListener("error", () => {
        if (favicon.classList.contains(CLASS_UNKNOWN)) {
            return;
        }
        favicon.classList.add(CLASS_UNKNOWN);

        let src = localStorage.getItem(COOKIE_PAGEICON) ?? "";
        console.log(src);
        if (src.length < 1) {
            src = "/favicon.ico";
        }
        favicon.src = src;
    });
    favicon.src = ".directory";
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