var SETTINGS_TOAST = new Toast();

class Form {
    constructor(dom, submitter = null) {
        this.dom = dom;
        this.submitter = submitter;

        if (!this.submitter) {
            this.submitter = document.querySelector('input[form="' + dom.id + '"]');
            if (!this.submitter) {
                this.submitter = document.createElement("input");
                this.submitter.setAttribute("type", "submit");
            }
        }
    }

    input_set_value(name, value) {
        let inputs = this.dom.querySelectorAll(`input[name="${name}"]`);
        if (inputs.length == 1) {
            inputs[0].value = value;
            return;
        }

        console.warn("Checkboxes etc... WIP");
    }

    input_get_value(name) {
        let inputs = this.dom.querySelectorAll(`input[name="${name}"]`);
        if (inputs.length == 1) {
            return inputs[0].value;
        }

        console.warn("Checkboxes etc... WIP");
        return "";
    }
}

class ThemeForm extends Form {
    static DEFAULT_COLOR = "#da1313";
    static DEFAULT_BACKGROUND = "";
    static DEFAULT_HORIZONTAL = 5;
    static DEFAULT_VERTICAL = 4;
    constructor(dom) {
        super(dom);
        this.setValuesFromCookies();
        this.submitter.addEventListener("click", (event) => {
            event.preventDefault();
            this.setCookies();
        });

        try{
            let fvd = document.getElementById("files-vertical-display");
            let fv = this.dom.querySelector(`input[name="vertical"]`);
            fvd.innerText = fv.value;
            fv.addEventListener("change", () => {
                fvd.innerText = fv.value;
            });

            let fhd = document.getElementById("files-horizontal-display");
            let fh = this.dom.querySelector(`input[name="horizontal"]`);
            fhd.innerText = fh.value;
            fh.addEventListener("change", () => {
                fhd.innerText = fh.value;
            });
        }catch(e){
            console.error(e);
        }
    }

    setValuesFromCookies() {
        this.input_set_value("color", localStorage.getItem(COOKIE_COLOR) ?? ThemeForm.DEFAULT_COLOR);
        this.input_set_value("background", localStorage.getItem(COOKIE_BACKGROUND) ?? ThemeForm.DEFAULT_BACKGROUND);
        this.input_set_value("horizontal", localStorage.getItem(COOKIE_HORIZONTAL) ?? ThemeForm.DEFAULT_HORIZONTAL);
        this.input_set_value("vertical", localStorage.getItem(COOKIE_VERTICAL) ?? ThemeForm.DEFAULT_VERTICAL);
    }

    setCookies() {
        let error = false;
        try {
            localStorage.setItem(COOKIE_COLOR, this.input_get_value("color"));
            localStorage.setItem(COOKIE_BACKGROUND, this.input_get_value("background"));
            localStorage.setItem(COOKIE_HORIZONTAL, this.input_get_value("horizontal"));
            localStorage.setItem(COOKIE_VERTICAL, this.input_get_value("vertical"));
        } catch (e) {
            console.warn(e);
            error = true;
        }
        SETTINGS_TOAST.show(
            error ? "Failed to set Cookies" : "Success",
            error ? "Cookies were blocked" : "Theme settings saved!",
            4,
            Toast.BUTTONS_NONE
        );
    }
}

let themeform = new ThemeForm(document.querySelector("#themeform"));