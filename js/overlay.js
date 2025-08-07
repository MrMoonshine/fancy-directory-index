class Overlay {
  constructor(title = "", content = null, defaulttype = "dialog") {
    // Create an overlay div and hide it
    this.overlay = document.createElement("dialog");
    this.overlay.classList.add("modal");
    // This element prevents the dialog from being closed
    let modalDialog = document.createElement("form");
    modalDialog.setAttribute("method", defaulttype);

    modalDialog.classList.add("modal-dialog");
    modalDialog.role = "document";

    // Title
    this.title = document.createElement("h2");
    this.title.innerText = title;
    // create fallback div
    this.content = content ?? document.createElement("article");
    this.content.classList.add("modal-body");

    // Close button
    let closer = document.createElement("button");
    closer.classList.add("close");
    closer.innerHTML = '<span aria-hidden="true">&times;</span>';
    closer.addEventListener("click", () => {
      this.overlay.close();
    });
    // Close if clicked next to it
    this.overlay.addEventListener("click", Overlay.hideBySideclick);

    // Header
    let modalHeader = document.createElement("header");
    modalHeader.appendChild(this.title);
    modalHeader.appendChild(closer);
    // Footer
    this.modalFooter = document.createElement("div");
    this.modalFooter.classList.add("modal-footer")

    document.body.appendChild(this.overlay);
    modalDialog.appendChild(modalHeader);
    modalDialog.appendChild(this.content)
    modalDialog.appendChild(this.modalFooter);
    this.overlay.appendChild(modalDialog);
  }

  appendChild(child) {
    this.content.appendChild(child);
  }

  appendToBody(child) {
    this.content.appendChild(child);
  }

  appendToFooter(child) {
    this.modalFooter.appendChild(child);
  }

  show() {
    this.overlay.showModal();
  }

  close(){
    this.overlay.close();
  }

  static hideBySideclick(enent) {
    if (event.target === this) {
      this.close();
    }
  }
}

/*
    DIALOG ELEMENTS
*/
const DIALOG_AUTO_CLASS = "modal";
let dialogs = document.querySelectorAll("dialog." + DIALOG_AUTO_CLASS);
// Assign closer events to all of the ones with class modal
for (let i = 0; i < dialogs.length; i++) {
  /*
        Assign Close Routine to Close Button
    */
  let closer = dialogs[i].querySelector("button.closer, button.close");
  if (closer) {
    closer.addEventListener("click", () => {
      dialogs[i].close();
    });
  }
  /*
        Close Modal if clicked next to it
    */
  let modalDialog = dialogs[i].querySelector(".modal-dialog");
  console.log(modalDialog);
  // skip if none found
  if (!modalDialog) {
    continue;
  }
  if (!dialogs[i].contains(modalDialog)) {
    continue;
  }

  /*
        Close if not clicked on modal-dialog class
    */
  dialogs[i].addEventListener("click", Overlay.hideBySideclick);
}
