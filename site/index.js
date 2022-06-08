const emptyImage = "data:image/gif;base64,R0lGODlhAQABAPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAP8ALAAAAAABAAEAAAgEAP8FBAA7";

let link = getUrl();
let str = get(link);
let cells = null;
let annonces = [];

let shouldAnimate = false;

document.body.style.transform = 'scale(1)';

setColorMode();
addDarkModeEventListener();
hideIButton();

loadTableView();

// EVENTS

window.addEventListener('popstate', () => {
    document.getElementsByClassName("topsub")[0].innerHTML = "Application CMR";
    parseCells()
})

function addClickEvent(i) {
    if (cells[i].babillard) { return }
    var element = document.getElementById(i); //grab the element
    if (cells[i].link) {
        element.onclick = function () { //asign a function
            let link = cells[i].link;
            if (!cells[i].openURL && !iOS()) {
                window.open(`/site/fileview/?t=${cells[i].title}&s=${cells[i].link}`);
            } else {
                window.open(cells[i].link);
            }

        }
    }
}

function addNewPageEvent(i) {
    var element = document.getElementById(i)
    element.onclick = function () {
        document.getElementsByClassName("topsub")[0].innerHTML = document.getElementsByClassName("title")[0].innerText;
        history.pushState(cells[i].link, cells[i].title, "/?src=" + cells[i].link);
        slideLeft()
        shouldAnimate = true;
        setTimeout(function () {
            parseCells()
        }, 300)
    }
}

function addHoverEvent(i) {
    if (cells[i].babillard) { return }
    var element = document.getElementById(i); //grab the element
    if (cells[i].link) {
        element.style.cursor = "pointer";
        element.onmouseover = function () { //asign a function
            element.classList.remove("mouseOut", "mouseOver")
            element.classList.add("mouseOver")
        }
        element.onmouseout = function () { //asign a function
            element.classList.remove("mouseOut", "mouseOver")
            element.classList.add("mouseOut")
        }
    }
}

document.getElementsByClassName("i")[0].onclick = function () {
    window.popupwindow("/?src=files/infos.json", 'Application CMR - Informations', 400, 600)
};

// CELLS

function parseCells() {
    link = getUrl();
    str = get(link);
    cells = JSON.parse(str).cells;
    loadTableView();
}

function loadTableView() {

    try { cells = JSON.parse(str).cells; } catch (err) {
        sendErrorMessage(err.message);
        return;
    }

    document.getElementsByClassName("cells")[0].innerHTML = "";

    setTitles();
    setHeaderColor();

    for (let i = 0; i < cells.length; i++) {
        let classe = "mouseOut"
        if (cells[i].notification) { classe = classe + " notification" }
        if (cells[i].article) { classe = classe + " article" }
        if (cells[i].webView) { classe = classe + " webView" }
        if (cells[i].babillard) { classe = classe + " babillard" }
        cells[i].subtitle = markDown(cells[i].subtitle)

        document.getElementsByClassName("cells")[0].insertAdjacentHTML("beforeend", GenerateHTMLCell(cells[i], i, classe));

        addHoverEvent(i);

        if (cells[i].babillard) { populateAnnonces(i); }

        if (cells[i].newPage) {
            addNewPageEvent(i);
        } else {
            addClickEvent(i);
        }
    }
    fadeIn();
}

function slideLeft() {
    var elements = [...document.getElementsByTagName("cell"), ...document.getElementsByClassName("categorie")];
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("transitionLeft", "mouseOver", "mouseOut");
        elements[i].classList.add("transitionLeft", "mouseOut");
    }
}

function fadeIn() {
    window.scrollTo(0, 0);
    if (shouldAnimate) {
        shouldAnimate = false;
        var elements = [...document.getElementsByTagName("cell"), ...document.getElementsByClassName("categorie")];
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("fadeIn");
            elements[i].classList.add("fadeIn");
        }
    }
}

function GenerateHTMLCell(cell, i, cellClass) {

    let image = cell.image || ""
    let imageTint = cell.tint || "";

    let title = cell.title || ""
    let subtitle = cell.subtitle || ""

    let imageCode = ""

    if (image.indexOf(".") > 0) {
        // IMAGE IS LINK
        if (imageTint != "") {
            imageCode = `<img-container><img class="maskedimage" src="${emptyImage}" style="-webkit-mask-image: url(${image}); mask-image: url(${image}); background-color: ${imageTint};" id=${image}/></img-container>`
        } else {
            imageCode = `<img-container><img src="${image}" id=${image}/></img-container>`
        }
    } else if (image) {
        // IMAGE IS EMOJI
        imageCode = `<emoji>${image}</emoji>`
    } else {
        // IMAGE IS EMPTY
        imageCode = ""
    }

    if (cellClass.indexOf("babillard") > 0) {
        var src = cells[i].link
        var content = get(src);
        annonces[i] = JSON.parse(content);
        annonces[i] = sortAnnonces(annonces[i], i);

        if (annonces[i].length > 0) {
            imageCode = imageCode = `<img-container><img src="files/images/babillard_fill.png" class="pin-image" id=${image}/></img-container>`
            subtitle = annonces[i].length + " annonces"
        } else {
            cellClass = cellClass.replaceAll('babillard', '');
            image = "files/images/babillard.png"
            return `<cell id = ${i} class="${cellClass}"><img-container><img src="${image}" id=${image}/></img-container><description><cell-title>${title}</cell-title><cell-subtitle>${subtitle}</cell-subtitle></description></cell>`
        }
        return `<cell id = ${i} class="${cellClass}"><div class=babillard-top>${imageCode}<description><cell-title>${title}</cell-title><cell-subtitle>${subtitle}</cell-subtitle></description></div><div class="annonces" id="annonces${i}"></div></cell>`

    } else if (cellClass.indexOf("webView") > 0) {
        return `<cell id = ${i} class="${cellClass}">${imageCode}<description><cell-title>${title}</cell-title><cell-subtitle>${subtitle}</cell-subtitle></description><iframe src=${cells[i].link}></iframe><button onclick="window.open(${cells[i].link})">Ouvrir en plein écran ➜</button></cell>`
    } else if (isCategorie(image)) {
        return `<p class="categorie">${title}</p>`
    } else {
        return `<cell id = ${i} class="${cellClass}">${imageCode}<description><cell-title>${title}</cell-title><cell-subtitle>${subtitle}</cell-subtitle></description></cell>`
    }
}

// UI

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
        root.setProperty('--subtext', '#a4a4a4');
        root.setProperty('--hover', '#161616');
        root.setProperty('--accent', '#161616');
        root.setProperty('--hilight', '#282828');
    } else {
        // LIGHT
        root.setProperty('--background', '#ffffff');
        root.setProperty('--text', '#000000');
        root.setProperty('--subtext', '#666666');
        root.setProperty('--hover', '#f0f0f0');
        root.setProperty('--accent', '#f0f0f0');
        root.setProperty('--hilight', '#e5e5e5');
    }
}

function setTitles() {
    let title = JSON.parse(str).title || "Application CMR";
    document.getElementsByClassName("title")[0].innerHTML = title;

    let topsubtitle = JSON.parse(str).topsubtitle;
    if (topsubtitle) {
        document.getElementsByClassName("topsub")[0].innerHTML = topsubtitle;
    }

    if (title != "" && title != "Application CMR") {
        document.title = "Application CMR - " + title
    } else {
        document.title = "Application CMR | Collège Mont-Royal"
    }
}

function setHeaderColor() {
    let header = document.querySelector("div.top");
    let color = JSON.parse(str).header_color;
    if (color) {
        document.querySelector("meta[name=theme-color]").setAttribute("content", color);
        header.style.backgroundColor = color;
    }
}

function hideIButton() {
    if (link == "files/infos.json") {
        document.getElementsByClassName("i")[0].id = "hidden";
    } else {
        document.getElementsByClassName("i")[0].id = "";
    }
}

// UTILITIES

function sortAnnonces(annoncesATrier) {
    return annoncesATrier.filter(function (annonce) {
        let expiration = Date.parse(annonce.expiration || "2170-02-10")
        let now = new Date().getTime();
        return expiration > now;
    });
}

function populateAnnonces(i) {
    let annoncesDiv = document.getElementById("annonces" + i)
    annonces[i].forEach(annonce => {

        let popUpCode = ""
        let contentCode = ""

        if (isImage(annonce.contenu)) {
            popUpCode += `i=${encodeURIComponent(annonce.contenu).replaceAll("'", "\\'")}`
            contentCode = `<img src="${annonce.contenu}"/>`
        } else {
            popUpCode += `s=${encodeURIComponent(annonce.contenu).replaceAll("'", "\\'")}`
            contentCode = `<div class="annonce-text"><textarea rows="1" readonly></textarea></div>`
        }

        if (annonce.link) {
            popUpCode += `&l=${encodeURIComponent(annonce.link).replaceAll("'", "\\'")}`
            contentCode += `<img class="openlink" src="site/ressources/openLink.png"/>`
        }

        annoncesDiv.insertAdjacentHTML("beforeend", `<div class="annonce-wrapper"><annonce id=annonce${i} onclick="popupwindow('/site/popup/?${popUpCode}', 'Babillard', 500, 500);">${contentCode}</annonce></div>`)

        const annonceElement = annoncesDiv.lastElementChild.firstElementChild;
        const annonceTextElement = annonceElement.querySelector("textarea");

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        annonceElement.style.width = clamp(window.innerWidth / window.innerHeight * 215, 115, 350) + "px";

        if (annonceTextElement) {
            annonceTextElement.value = annonce.contenu;
            annonceTextElement.rows = 1;
            while (annonceTextElement.scrollHeight > annonceTextElement.clientHeight) {
                if (annonceTextElement.rows < 5) {
                    annonceTextElement.rows++;
                } else {
                    const words = annonceTextElement.value.split(" ");
                    words.pop();
                    annonceTextElement.value = words.join(" ") + "...";
                }
            }
        }
    });
}

function iOS() {
    if (/iPad|iPhone|iPod/.test(navigator.platform)) {
        return true;
    } else if (isIpadOS()) {
        return true;
    } else {
        return navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
    }
}

function isIpadOS() {
    return navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
}

function isCategorie(image) {
    if (!image || image === "") {
        return true
    }
    return false
}

function sendErrorMessage(errorDescription) {
    fetch(
        "https://webhook-cmr.herokuapp.com/jf?pathname=" + encodeURIComponent(window.location.pathname) + "&src=" + encodeURIComponent(getSrc()),
        {
            method: "POST",
            headers: { "Content-Type": "text/plain; charset=utf-8" },
            body: errorDescription,
        }
    );
}

function getUrl() {
    const src = new URLSearchParams(window.location.search).get('src');
    if (history.state != null) {
        return history.state;
    } else if (src != null) {
        return src;
    } else {
        return 'files/cells.json';
    }
}

function getSrc() {
    return new URLSearchParams(window.location.search).get('src') || "";
}

function get(yourUrl) {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", yourUrl, false);
    Httpreq.send(null);
    return Httpreq.responseText;
}

// eslint-disable-next-line no-unused-vars
function isEmoji(str) {
    var ranges = ['(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])'];
    if (str.match(ranges.join('|'))) {
        return true;
    } else {
        return false;
    }
}

function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

function markDown(str) {
    if (str) {
        var boldParameters = /\*\*(.*?)\*\*/gm;
        var bold = str.replace(boldParameters, '<b>$1</b>');
        var italicParameters = /\*(.*?)\*/gm;
        var italic = bold.replace(italicParameters, '<i>$1</i>');
        var enters = italic.replace(/\n/g, "<br>");
        return enters;
    }
}

window.popupwindow = function (url, title, w, h) {
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
} 
