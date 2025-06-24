class DirectoryIndex{
        constructor(){
                // File array
                this.files = [];
                // Polaroid array
                this.polaroids = [];
                // Scan Directory
                let table = document.getElementsByTagName("table")[0];
                if(!table){
                        console.error("No table found in document!");
                        return;
                }
                // Get widget | fallback to body
                this.filelist = document.getElementById("filelist") ?? document.body;

                this.files = File.fetchFromHTML(table, null);

                // found files: hide table
                if(this.files.length > 0){
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
                                        if(file.match(element.value)){
                                                file.show();
                                        }else{
                                                file.hide();
                                        }
                                });
                        });
                });
        }

        createGalery(){
                var galery = document.getElementById("galery");
                if(galery == null){
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
                if(this.polaroids.length < 1){
                        // 0 Images means no gallery
                        console.info("No Images, no galery");
                        return;
                }

                // Add polaroids to list
                this.polaroids.forEach(
                        elem => {
                                fbox.appendChild(elem.dom());
                                //elem.show();
                        }
                );
                galery.append(fbox);

                // show galery
                galery.style.display = "block";
                // Create a pagination
                let pagination = new Pagination(galery, this.polaroids);

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

/*document.getElementById("preview-closer").addEventListener("click", File.filedisplayClear);
File.viewer_overlay.addEventListener("click", File.filedisplayClearFiltered);
File.viewer_filedisplay.removeEventListener("click", File.filedisplayClear);*/