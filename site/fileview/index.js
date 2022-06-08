const emptyImage = "data:image/gif;base64,R0lGODlhAQABAPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAP8ALAAAAAABAAEAAAgEAP8FBAA7";

document.querySelector('button.retour').addEventListener("click", function () {
    window.close();
});

setColorMode();
setContent();
addDarkModeEventListener();
document.querySelector("button.retour").src = emptyImage;

function addDarkModeEventListener() {
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function () {
            setColorMode();
        });
}

function setColorMode() {
    let root = document.documentElement.style;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // DARK
        root.setProperty('--background', '#000000');
        root.setProperty('--text', '#ffffff');
        root.setProperty('--file-titlebar', '#1c1c1e')
    } else {
        // LIGHT
        root.setProperty('--background', '#ffffff');
        root.setProperty('--text', '#000000');
        root.setProperty('--file-titlebar', '#f2f1f6')
    }
}

function setContent() {
    const params = new URLSearchParams(window.location.search);
    let title = params.get("t");
    let source = params.get("s");
    console.log(source)
    document.title = title;
    document.querySelector("p.filetitle").innerText = title;
    document.querySelector("iframe.fileview").src = addSlashIfNeeded(source);
}

function addSlashIfNeeded(url) {
    if (!url.startsWith("/") && !url.startsWith("http")) {
        return "/" + url;
    }
    return url;
}