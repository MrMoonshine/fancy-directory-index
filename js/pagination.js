const PAGINATION_ITEMS_PER_PAGE_DEFAULT = 6;
const PAGINATION_MAX_BUTTONS_DEFAULT = 9;
const PAGINATION_NUMBER_PROMPT_DEFAULT = "Welche seite willst du öffnen?";
// Item used in pagination
class PaginationItem{
    /*
        @param {DOM} item
    */
    constructor(item){
        this.item = item;
    }

    show(){
        this.item.classList.remove(CLASS_HIDDEN);
    }

    hide(){
        this.item.classList.add(CLASS_HIDDEN);
    }

    match(term){
        return true;
    }

    static show(pitem){
        pitem.item.classList.remove(CLASS_HIDDEN);
    }

    static hide(pitem){
        pitem.item.classList.add(CLASS_HIDDEN);
    }
}
// Pagination itself
class Pagination{
    /*
        @param {DOM} parent element for the pagination
        @param {PaginationItem[]} array of pagination items 
    */
    constructor(parent, items, options = {
        items_per_page: PAGINATION_ITEMS_PER_PAGE_DEFAULT,
        max_buttons: PAGINATION_MAX_BUTTONS_DEFAULT,
        page_prompt_text: PAGINATION_NUMBER_PROMPT_DEFAULT,
        appendToParent: true
    }){
        this.parent = parent;
        this.itemsAvailable = items;
        this.items = [];
        //set options and verify them
        this.options = options;
        this.verifyOptions();
        // Set page count
        this.pageCount = Math.ceil(this.itemsAvailable.length / this.options.items_per_page);
        this.currentPage = 0;

        this.pageButtonSpace = document.createElement("div");
        this.pageButtonSpace.setAttribute("class","btn-group");
        this.pageButtonSpace.innerHTML = "";
        this.pageButtons = [];

        // Create previous and next page button
        this.pageButtonPrev = this.createButton("&larr;","prev");
        this.pageButtonPrev.setAttribute("type", "button");
        this.pageButtonPrev.addEventListener("click", this.pageSelectCallback.bind(this, this.pageButtonPrev));

        this.pageButtonNext = this.createButton("&rarr;","next");
        this.pageButtonNext.setAttribute("type", "button");
        this.pageButtonNext.addEventListener("click", this.pageSelectCallback.bind(this, this.pageButtonNext));
        // The buttons with the 3 dots
        this.pageButtonsSelect = [this.createButton("...","select"), this.createButton("...","select")];
        this.pageButtonsSelect.forEach(element => element.addEventListener("click", this.pageManualSelectCallback.bind(this)));

        this.pageButtonSpace.appendChild(this.pageButtonPrev);
        
        let dotbuttCounter = 0;
        //Create Page Buttons
        for(let a = 0; a < this.pageCount; a++){
            let butt = this.createButton(a + 1, a);
            butt.addEventListener("click", this.pageSelectCallback.bind(this, butt));
            // variable is just used to have it in collapse
            this.pageButtons.push(butt);
            this.pageButtonSpace.appendChild(butt);
            // Add the dots before last and after first
            if(a == 0 || a == this.pageCount - 2){
                this.pageButtonSpace.appendChild(this.pageButtonsSelect[dotbuttCounter++]);
            }
        }
        this.pageButtonSpace.appendChild(this.pageButtonNext);

        if(options.appendToParent){
            this.parent.appendChild(this.pageButtonSpace);
        }

        // clear seach > show all
        this.search("");
    }
    // returns the div for the pagination buttons
    pageButtons(){
        return this.pageButtonSpace;
    }
    // Error handling
    verifyOptions(){
        if(!this.options.items_per_page){
            console.warn("No Items/Page specified, defaulting to " + PAGINATION_ITEMS_PER_PAGE_DEFAULT);
            this.options.items_per_page = PAGINATION_ITEMS_PER_PAGE_DEFAULT;
        }

        if(!this.options.max_buttons){
            console.warn("No Max. Buttons specified, defaulting to " + PAGINATION_MAX_BUTTONS_DEFAULT);
            this.options.max_buttons = PAGINATION_MAX_BUTTONS_DEFAULT;
        }

        if(!this.options.page_prompt_text){
            console.warn("No Prompt text specified, defaulting to " + PAGINATION_NUMBER_PROMPT_DEFAULT);
            this.options.page_prompt_text = PAGINATION_NUMBER_PROMPT_DEFAULT;
        }
    }

    // creates button and appends it to page button space
    createButton(label, value){
        let butt = document.createElement("button");
        butt.innerHTML = label;
        butt.value = value;
        butt.setAttribute("class", "btn");
        butt.setAttribute("type", "button");
        return butt;
    }

    search(term){
        this.hideAllItems();
        this.items = [];
        this.itemsAvailable.forEach(element => {
            if(element.match(term)){
                this.items.push(element);
            }
        });

        this.countPages();
        // hide unnecesary buttons
        let buttons = this.pageButtonSpace.getElementsByTagName("label");
        for(let a = 0; a < buttons.length; a++){
            dom_show(buttons[a], a < this.pageCount);
        }
        // initially show first page
        this.showPage(0);
    }

    countPages(){
        this.pageCount = Math.ceil(this.items.length / this.options.items_per_page);
    }

    // necessary. by checking .value it gets loaded correctly
    pageSelectCallback(elem){
        if(elem.value == "next"){
            this.showPage(this.currentPage + 1);
        }else if(elem.value == "prev"){
            this.showPage(this.currentPage - 1);
        }else{
            this.showPage(elem.value);
        }
        
    }
    // Opens a prompt to enter a number, number will be opened.
    pageManualSelectCallback(){
        let value = prompt(this.options.page_prompt_text);
        // starts at 0
        value--;
        this.showPage(value);
    }

    hideAllItems(){
        this.items.forEach(element => element.hide());
    }

    showPage(cpage){
        cpage = Number(cpage);
        // for number input, if user enters sh*t
        if(cpage < 0 || cpage >= this.pageCount){
            return;
        }
        // set current page to be current
        this.currentPage = cpage;
        /*console.table({
            "currentPage": cpage,
            "itemsppage": this.options.items_per_page,
            "itemcount": this.items.length
        });*/
        //show correct divs
        for(var a = 0; a < this.items.length; a++){
            if(
                a < (cpage - (-1)) * this.options.items_per_page &&
                a >= cpage * this.options.items_per_page
            ){
                this.items[a].show();
            }else{
                this.items[a].hide();
            }
        }
        // handle collapsed buttons
        this.buttonCollapse();
        // bold text on highlighted button
        let buttons = this.pageButtonSpace.querySelectorAll(".btn-group button.btn");
        // reset all
        for(let a = 0; a < buttons.length; a++){
            buttons[a].classList.remove("active");
        }
        // set matching button
        let butt = this.pageButtonSpace.querySelector("button[value='" + cpage + "']");
        if(butt){
            butt.classList.add("active");
        }
    }

    // Cosmetic function. Hides buttons to avoid overflow
    buttonCollapse(debug = false){
        if(this.pageCount > this.options.max_buttons){
            // dot buttons should be hidden
            let stubVis = [true, true];
            let half = Math.floor(this.options.max_buttons / 2);
            // page count smaller than half
            stubVis[1] = (this.currentPage < half);
            // page count to current diff is smaller than half of max
            stubVis[0] = (this.pageCount - this.currentPage <= half);
            // Both false is not possible
            if(!(stubVis[0]||stubVis[1])){
                stubVis = [true, true];
            }

            let visibleButtonCount = this.options.max_buttons - 4;
            // for each hidden dot button add one page button
            stubVis.forEach(element => {
                if(element){
                    visibleButtonCount--;
                }
            });

            let counter = 0;
            let startPoint = this.currentPage;
            // if last element is hidden ,start from back
            if(this.currentPage < half){
                startPoint = 0;
            }else if(this.currentPage > this.pageCount - half){
                startPoint = this.pageCount - half;
            }else{
                // set highlighted page in the center
                let y = Math.ceil((1/2)*this.options.max_buttons - 4);
                if(y < 0){
                    y = 0;
                }
                startPoint -= y;
            }

            if(debug){
                console.log(stubVis);
                console.log("Current Page " + this.currentPage);
                console.log("Page Count " + this.pageCount);
                console.log("Visible Buttons Count " + visibleButtonCount);
                console.log("Start from " + startPoint);
            }
            for(let a = 0; a < this.pageButtons.length; a++){
                // Ignore first and last
                if(
                    this.pageButtons[a].value == 0 ||
                    this.pageButtons[a].value == this.pageCount - 1
                ){
                    continue;
                }
                dom_show(this.pageButtons[a], false);
                if((
                    a >= startPoint
                ) && counter < visibleButtonCount){
                    dom_show(this.pageButtons[a], true);
                    counter++;
                }
            }

            // hide ... buttons acording to array
            for(let a = 0; a < this.pageButtonsSelect.length; a++){
                dom_show(this.pageButtonsSelect[a], stubVis[a]);
            }
        }else{
            this.pageButtonsSelect.forEach(element => dom_show(element, false)); 
        }
    }

    info(){
        console.table([
            ["PageCount",this.pageCount],
            ["ItemCount",this.items.length],
        ]);
    }
}