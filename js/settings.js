class Form{
    constructor(dom, submitter = null){
        this.dom = dom;
        this.submitter = submitter;

        if(!this.submitter){
            this.submitter = document.querySelector('input[form="'+dom.id+'"]');
            if(!this.submitter){
                this.submitter = document.createElement("input");
                this.submitter.setAttribute("type", "submit");
            }
        }
    }
}

class ThemeForm extends Form{
    constructor(dom){
        super(dom);
    }
}

let themeform = new ThemeForm(document.querySelector("#themeform"));