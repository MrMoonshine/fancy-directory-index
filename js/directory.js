const THEME_TILES_X = localStorage.getItem (COOKIE_HORIZONTAL) ?? 5;
const THEME_TILES_Y = localStorage.getItem (COOKIE_VERTICAL) ?? 4;

function set_theme_from_cookies(){
        let root = document.documentElement;
        root.style.setProperty("--color-main", localStorage.getItem(COOKIE_COLOR) ?? "teal");
        root.style.setProperty("--gallery-tiles-x", THEME_TILES_X);
        root.style.setProperty("--gallery-tiles-y", THEME_TILES_Y);
        let bg = localStorage.getItem(COOKIE_BACKGROUND) ?? "none";
        if(bg.length < 1){
                bg = "none";
        }
        let backgroundAvailable = bg != "none";
        root.style.setProperty("--background-image", backgroundAvailable ? `url("${bg}")` : bg);

        let favicon = document.getElementById("pageicon");
        if(!favicon){
                return;
        }

        favicon.addEventListener("error", () => {
                if(favicon.classList.contains(CLASS_UNKNOWN)){
                        return;
                }
                favicon.classList.add(CLASS_UNKNOWN);

                let src = localStorage.getItem(COOKIE_PAGEICON) ?? "";
                console.log(src);
                if(src.length < 1){
                        src = "/favicon.ico";
                }
                favicon.src = src;
        });
        favicon.src = ".directory";
}

class DirectoryLinks {
        constructor(dom) {
                this.dom = dom;
                this.url = new URL(window.location);

                let fullink = "/";
                this.addLink(fullink, "Home");

                let items = this.url.pathname.split("/");
                while(items.length > 0){
                        let item = items.shift();
                        if(item.length < 1){
                                continue;
                        }
                        
                        let slash = document.createElement("div");
                        slash.classList.add("slash");
                        slash.innerText = "/";
                        this.dom.appendChild(slash);

                        fullink += item + "/";
                        this.addLink(fullink, item);
                }
                //console.log(this.url.pathname);
                //console.log(items);
        }

        addLink(link, name){
                let a = document.createElement("a");
                a.href = link;
                let div = document.createElement("div");
                div.innerText = name;

                let img = new Image();
                img.addEventListener("error", () => {img.classList.add(CLASS_HIDDEN)});
                img.alt = "";
                img.src = link + ".directory";

                a.appendChild(img);
                a.appendChild(div);
                this.dom.appendChild(a);
        }
}

class DirectoryIndex {
        static paginationOptions = {
                items_per_page: THEME_TILES_X * THEME_TILES_Y,
                max_buttons: 7,
                page_prompt_text: PAGINATION_NUMBER_PROMPT_DEFAULT,
                appendToParent: true
        }

        constructor() {
                // File array
                this.files = [];
                // Polaroid array
                this.polaroids = [];
                // Scan Directory
                let table = document.getElementsByTagName("table")[0];
                if (!table) {
                        console.error("No table found in document!");
                        return;
                }
                // Get widget | fallback to body
                this.filelist = document.getElementById("filelist") ?? document.body;

                this.files = File.fetchFromHTML(table, null);

                // found files: hide table
                if (this.files.length > 0) {
                        table.style.display = "none";
                }

                // Apply elements to page
                let container = document.createElement("div");
                this.filelist.appendChild(container);
                container.classList.add("container");

                this.files.forEach(element => {
                        container.appendChild(element.item);
                });

                var searches = document.querySelectorAll("input[type='search']");
                searches.forEach(element => {
                        // Files in list
                        element.addEventListener("keyup", (data) => {
                                this.files.forEach(file => {
                                        if (file.match(element.value)) {
                                                file.show();
                                        } else {
                                                file.hide();
                                        }
                                });
                        });
                });
        }

        createGalery() {
                var gallery = document.getElementById("gallery");
                if (gallery == null) {
                        console.warn("Galery creation not possible: element not found");
                        return;
                }
                // ready to go
                // Flexbox Container
                var fbox = document.createElement("div");
                fbox.setAttribute("class", "polaroids");

                this.files.forEach(file => {
                        //if(file.filetype == File.Types.IMAGE || file.filetype == File.Types.VIDEO){
                        this.polaroids.push(new Polaroid(file));
                        //}
                });

                // Create a polaroid for each file
                if (this.polaroids.length < 1) {
                        // 0 Images means no gallery
                        console.info("No Images, no gallery");
                        return;
                }

                // Add polaroids to list
                this.polaroids.forEach(
                        elem => {
                                fbox.appendChild(elem.dom());
                                //elem.show();
                        }
                );
                gallery.append(fbox);

                // Create a pagination
                let pagination = new Pagination(gallery, this.polaroids, DirectoryIndex.paginationOptions);

                //assign search listeners
                var searches = document.querySelectorAll("input[type='search']");
                searches.forEach(element => {
                        // Files in list
                        element.addEventListener("keyup", (data) => {
                                console.log("Search for " + element.value);
                                pagination.search(element.value);
                        });
                });
        }
}

set_theme_from_cookies();
let linklist = new DirectoryLinks(document.querySelector("#dirpath"));

/*document.getElementById("preview-closer").addEventListener("click", File.filedisplayClear);
File.viewer_overlay.addEventListener("click", File.filedisplayClearFiltered);
File.viewer_filedisplay.removeEventListener("click", File.filedisplayClear);*/