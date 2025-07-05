const POLAROID_COPY_IMAGE = "https://alpakagott/assets/icons/copy.webp";
const POLAROID_NEW_TAB_IMAGE = "https://alpakagott/assets/icons/newtab.svg";
try {
  var POLAROID_TOAST = new Toast();
} catch (error) {
  console.log(error);
}

class Polaroid extends PaginationItem {
  // file is of type class File
  constructor(file) {
    let isDirectory = file.filetype == File.Types.FOLDER;
    // Call PaginationItem constructer with base div
    super(document.createElement(isDirectory ? "a" : "div"));
    this.item.classList.add("polaroid");
    this.loaded = false;
    // init
    this.file = file;
    this.filename = this.file.filename.innerHTML ?? "UNKNOWN";
    // initially, hide element
    this.hide();

    let showbuttons = this.file.filetype != File.Types.FOLDER;//this.file.filetype == File.Types.IMAGE || this.file.filetype == File.Types.VIDEO;
    let fbtop = document.createElement("div");
    fbtop.classList.add("d-flex");
    fbtop.classList.add("buttons");

    let newtabbutton = document.createElement("a");
    let copybutton = document.createElement("button");
    copybutton.classList.add("copy");

    if (showbuttons) {
      let cpyimg = new Image();
      cpyimg.src = POLAROID_COPY_IMAGE;
      cpyimg.alt = "copy";
      copybutton.appendChild(cpyimg);

      copybutton.addEventListener("click", (event) => {
        // prevent overlay event
        if (event && event.stopPropagation) event.stopPropagation();
        let copycontent = Polaroid.hrefSanitize(this.file.getFileLink());
        // copy to clipboard
        let promise = navigator.clipboard.writeText(copycontent);
        promise.then(() => {
          try {
            POLAROID_TOAST.show(
              "Copied!",
              copycontent,
              4,
              Toast.BUTTONS_NONE,
              POLAROID_COPY_IMAGE
            );
          } catch (error) {
            console.log(error);
          }
        }, () => {
          console.log("Unable to copy to clipboard");
        })
      });

      newtabbutton.href = this.file.href;
      newtabbutton.setAttribute("target", "_blank");
      newtabbutton.classList.add("new-tab");

      let ntbimg = new Image();
      ntbimg.src = POLAROID_NEW_TAB_IMAGE;
      ntbimg.alt = "new-tab";
      newtabbutton.appendChild(ntbimg);

      newtabbutton.addEventListener("click", (event) => {
        if (event && event.stopPropagation) event.stopPropagation();
      });
    }

    let filenamep = document.createElement("p");
    filenamep.classList.add("filename");
    filenamep.innerHTML = this.filename;

    if (showbuttons) {
      fbtop.appendChild(newtabbutton);
      fbtop.appendChild(copybutton);
      //fbtop.appendChild(maximizebutton);
      this.item.appendChild(fbtop);
    }
    this.item.appendChild(filenamep);

    //maximizebutton.addEventListener("click", this.file.showPreview.bind(this.file));
    if (isDirectory) {
      if(!this.file.img.alt.includes("PARENT")){
        this.setFolderIcon();
      }

      return;
    }
    // Show file preview on click
    this.item.addEventListener("click", this.file.showPreview.bind(this.file));
  }

  show() {
    // show from parent class
    super.show();

    if (this.loaded) {
      return;
    }

    var image = "";
    switch (this.file.filetype) {
      case File.Types.IMAGE:
        //image = this.file.item.href;
        //image = image.replaceAll("'", "%27"); // Fixes issue with CSS URL when an apostrophe is in use
        //this.item.style.backgroundImage = "url(" + image + ")";
        this.item.style.backgroundImage = `url("${Polaroid.hrefSanitize(this.file.getFileLink())}")`;
        this.loaded = true;
        break;
      case File.Types.VIDEO:
        image = ".thumbnail." + this.filename + ".jpg";
        this.item.style.backgroundImage = `url("${image}")`;
        //this.item.classList.add("video");

        let errtestimg = document.createElement("img");
        errtestimg.addEventListener("error", (evt) => {
          if (errtestimg.classList.contains(CLASS_UNKNOWN)) {
            return;
          }
          errtestimg.classList.add(CLASS_UNKNOWN);
          errtestimg.src = this.file.img.src;
          image = this.file.img.src;
          this.item.style.backgroundImage = `url("${image}")`;
          console.log("image is jetzt " + image);
        });
        this.item.appendChild(errtestimg);
        errtestimg.src = image;
        errtestimg.classList.add(CLASS_HIDDEN);
        this.loaded = true;
        break;
      case File.Types.FOLDER:
        this.item.href = this.file.item.href
        let iconDir = new Image();
        iconDir.alt = this.file.img.alt ?? "[DIR]";
        iconDir.src = this.file.img.src;
        iconDir.classList.add("icon");
        this.item.appendChild(iconDir);
        this.loaded = true;
        break;
      default:
        let icon = new Image();
        icon.alt = this.file.img.alt ?? "";
        icon.src = this.file.img.src;
        icon.classList.add("icon");
        this.item.appendChild(icon);

        this.loaded = true;
        break;
    }
  }

  match(term) {
    if (term.length == 0) {
      return true;
    }
    //console.log("Check if " + this.filename + " includes " + term + " | result: " + this.filename.includes(term));
    return this.filename.toUpperCase().includes(term.toUpperCase());
  }

  dom() {
    return this.item;
  }

  setFolderIcon() {
    try{
      let file = window.location.pathname + this.file.filename.innerHTML;
      let img = document.createElement("img");
      img.addEventListener("error", () => {
        img.remove();
      });
      //img.style.backgroundImage = `url("${file + ".directory"}")`;
      img.alt = "";
      img.src = file + ".directory";
      img.classList.add("folder-icon");
      this.item.appendChild(img);
    }catch(err){
      return;
    }
    
  }

  static hrefSanitize(href) {
    let ret = "";
    ret = href.replaceAll("'", "%27"); // Fixes issue with CSS URL when an apostrophe is in use
    return ret;
  }
}