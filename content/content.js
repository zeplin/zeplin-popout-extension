chrome.runtime.sendMessage({
    from: "content",
    subject: "showPageAction",
});

function draggable(el) {
    el.addEventListener('mousedown', function (e) {
        console.log(e.target);
        if (e.target.tagName === "INPUT") {
            return;
        }
        const offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
        const offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);

        function mouseMoveHandler(e) {
            e.preventDefault();
            el.style.cursor = "grabbing";
            el.style.top = (e.clientY - offsetY) + 'px';
            el.style.left = (e.clientX - offsetX) + 'px';
        }

        function reset() {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', reset);
            el.style.cursor = "grab";
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', reset);
    });
}

function createOverlay(screenImageData) {
    const overlay = document.createElement("div");
    overlay.classList.add("zeplin-extension-overlay");

    const { src, width, height } = screenImageData;

    const wrapper = document.createElement("div");
    wrapper.classList.add("zeplin-extension-wrapper");

    const header = document.createElement("div");
    header.classList.add("zeplin-extension-header");

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 10
    slider.max = 100
    slider.value = 70
    slider.classList.add("zeplin-extension-slider");
    slider.oninput = event => {
        image.style.opacity = event.target.value / 100
    }
    header.append(slider);

    const closeButton = document.createElement("button");
    closeButton.textContent = "x";
    closeButton.classList.add("zeplin-extension-close-button");
    closeButton.addEventListener("click", () => {
        overlay.remove();
    });
    header.append(closeButton);
    wrapper.append(header);

    const image = document.createElement("img");
    image.classList.add("zeplin-extension-image");
    image.src = src;
    image.width = width;
    image.height = height;
    image.style.opacity = 0.7;
    wrapper.append(image);

    overlay.append(wrapper);
    draggable(wrapper);

    return overlay;
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.from === "popup") {
        if (msg.subject === "DOMInfo") {
            const screenImage = document.querySelector(".snapshotImage");
            console.log("si", screenImage)
            if (screenImage) {
                response({
                    src: screenImage.src,
                    width: screenImage.getAttribute("width"),
                    height: screenImage.getAttribute("height")
                })
            }
        } else if (msg.subject === "compare") {
            chrome.storage.sync.get("screenImageData", function (data) {
                if (data && data.screenImageData && !document.querySelector(".zeplin-extension-overlay")) {
                    const overlay = createOverlay(data.screenImageData);
                    document.body.append(overlay);
                }
            });
        }
    }

    return true
});
