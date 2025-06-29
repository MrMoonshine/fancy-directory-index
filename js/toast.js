class Toast {
    static BUTTON_OK = 1;
    static BUTTON_CANCEL = 2;
    static BUTTON_YES = 3;
    static BUTTON_NO = 4;

    static BUTTONS_NONE = 0;
    static BUTTONS_ALERT = 1;
    static BUTTONS_CONFIRM = 2;
    static BUTTONS_YESNO_PREF_NO = 3;
    static BUTTONS_YESNO_PREF_YES = 4;

    static BUTTON_SETS = [
        [{
            "label": "Ok",
            "highlighted": true,
            "value": Toast.BUTTON_OK
        }],
        [{
            "label": "Abbrechen",
            "highlighted": false,
            "value": Toast.BUTTON_CANCEL
        }, {
            "label": "Ok",
            "highlighted": true,
            "value": Toast.BUTTON_OK
        }],
        [{
            "label": "Ja",
            "highlighted": false,
            "value": Toast.BUTTON_YES
        }, {
            "label": "Nein",
            "highlighted": true,
            "value": Toast.BUTTON_NO
        }],
        [{
            "label": "Nein",
            "highlighted": false,
            "value": Toast.BUTTON_NO
        }, {
            "label": "Ja",
            "highlighted": true,
            "value": Toast.BUTTON_YES
        }]
    ];

    constructor() {
        /*
            Create space for Toasts
        */
        this.toastarea = document.getElementById("toastarea");
        if (!this.toastarea) {
            this.toastarea = document.createElement("div");
            this.toastarea.setAttribute("id", "toastarea");
            document.body.appendChild(this.toastarea);
        }
        // create main div and hide it
        this.toast = document.createElement("div");
        this.toast.setAttribute("class", "toast");
        this.hide();

        this.closer = document.createElement("button");
        this.closer.classList.add("toast-close");
        this.closer.innerHTML = "&#x2716;";
        this.closer.addEventListener("click", () => {
            this.hide();
        });

        this.title = document.createElement("strong");

        var divtop = document.createElement("div");
        divtop.setAttribute("class", "toast-top");
        divtop.appendChild(this.title);
        divtop.appendChild(this.closer);

        this.img = document.createElement("img");
        this.img.setAttribute("alt", "Kein Bild");
        
        this.text = document.createElement("p");
        var article = document.createElement("article");
        article.appendChild(this.img);
        article.appendChild(this.text);

        this.divbot = document.createElement("div");
        this.divbot.setAttribute("class", "toast-bot");
        

        this.toast.appendChild(divtop);
        this.toast.appendChild(article);
        this.toast.appendChild(this.divbot);
        // Append to area
        toastarea.appendChild(this.toast);
    }

    setButtons(buttons){
        // clear buttons
        this.divbot.innerHTML = "";
        for (let bs of Toast.BUTTON_SETS[buttons]) {
            var button = document.createElement("button");
            button.innerHTML = bs.label;
            button.value = bs.value;
            button.classList.add("btn");
            if (bs.highlighted) {
                button.classList.add("btn-highlight");
            } else {
                button.classList.add("btn-other");
            }

            button.addEventListener("click", (evt) => {
                this.onFinish(evt.target.value);
            });
            this.divbot.appendChild(button);
        }
    }

    show(title, text, timeout = 0, buttonset = Toast.BUTTONS_ALERT, image = "") {
        this.setButtons(buttonset);
        if (timeout > 0) {
            window.setTimeout(() => {
                // hide after timer ran out
                this.hide();
            }, timeout * 1000);
        } else if (timeout < 0) {
            console.warn("Negative timeout doesn't exist!");
        }
        this.title.innerHTML = title;
        this.text.innerHTML = text;
        // if image is specified
        if(image.length > 0){
            this.img.src = image;
            this.img.style.display = "block";
        }else{
            this.img.style.display = "none";
        }
        this.toast.style.display = "inherit";
    }

    hide(){
        this.toast.style.display = "none";
    }
    /* 
        @brief can be set by user
        @param button is the value of the button which was clicked    
    */
    onFinish(button) {
        this.hide();
    }
}

/*let test = new Toast("Ching Chong", "Your religion is wrong!", BUTTONS_CONFIRM, "/assets/backgrounds/beidou.jpg");
test.show(3);
let testa = new Toast("STFU", "SHUT THE FUCK UP!", BUTTONS_YESNO_PREF_YES, "/assets/backgrounds/thicc.png");
testa.show(7);
testa.onfinish = function () {
    console.log("Kurwa");
    console.log(this);
}
window.setTimeout(function () {
    console.log(test);
}, 5000);*/ 