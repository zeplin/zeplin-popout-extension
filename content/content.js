chrome.runtime.sendMessage({
  from: "content",
  subject: "showPageAction",
});

function makeZeplinOverlayDraggable(el) {
  el.addEventListener("mousedown", function (e) {
    if (e.target.tagName === "INPUT") {
      return;
    }
    const offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
    const offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);

    function mouseMoveHandler(e) {
      e.preventDefault();
      el.style.cursor = "grabbing";
      el.style.top = e.clientY - offsetY + "px";
      el.style.left = e.clientX - offsetX + "px";
    }

    function reset() {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", reset);
      el.style.cursor = "grab";
    }

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", reset);
  });
}

function createZeplinOverlay(screenImageData) {
  const overlay = document.createElement("div");
  overlay.classList.add("zeplin-extension-overlay");

  const { src, width, height } = screenImageData;

  const wrapper = document.createElement("div");
  wrapper.classList.add("zeplin-extension-wrapper");

  const header = document.createElement("div");
  header.classList.add("zeplin-extension-header");

  // Zoom
  let zoomIndex = 2;
  const zoomLevels = [0.5, 0.75, 1, 1.5, 2];

  const zoomWrapper = document.createElement("div");
  zoomWrapper.classList.add("zeplin-extension-zoom-wrapper");

  const zoomOutButton = document.createElement("button");
  zoomOutButton.textContent = "-";
  zoomOutButton.classList.add("zeplin-extension-button");
  zoomOutButton.onclick = () => {
    const prevZoom = zoomLevels[Math.max(--zoomIndex, 0)];
    image.style.zoom = prevZoom;
    zoomLabel.textContent = prevZoom * 100 + "%";
  }
  zoomWrapper.append(zoomOutButton);

  const zoomLabel = document.createElement("span");
  zoomLabel.classList.add("zeplin-extension-zoom-label");
  zoomLabel.textContent = "100%";
  zoomWrapper.append(zoomLabel);

  const zoomInButton = document.createElement("button");
  zoomInButton.textContent = "+";
  zoomInButton.classList.add("zeplin-extension-button");
  zoomInButton.onclick = () => {
    const nextZoom = zoomLevels[Math.min(++zoomIndex, zoomLevels.length - 1)]
    image.style.zoom = nextZoom
    zoomLabel.textContent = nextZoom * 100 + "%";
  }
  zoomWrapper.append(zoomInButton);
  header.append(zoomWrapper);

  // Slider
  const sliderWrapper = document.createElement("div");
  sliderWrapper.classList.add("zeplin-extension-slider-wrapper");

  const transparentIcon = document.createElement("img");
  transparentIcon.width = 16;
  transparentIcon.height = 12;
  transparentIcon.src = chrome.runtime.getURL("img/icTransparent.png");
  sliderWrapper.append(transparentIcon);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 10;
  slider.max = 100;
  slider.value = 70;
  slider.classList.add("zeplin-extension-slider");
  slider.oninput = (event) => {
    image.style.opacity = event.target.value / 100;
  };
  sliderWrapper.append(slider);

  const solidIcon = document.createElement("img");
  solidIcon.width = 16;
  solidIcon.height = 12;
  solidIcon.src = chrome.runtime.getURL("img/icSolid.png");
  sliderWrapper.append(solidIcon);

  header.append(sliderWrapper);

  // Close Button
  const closeButton = document.createElement("button");
  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm2.219 4.305L8 6.523 5.781 4.305a1.049 1.049 0 0 0-1.473.003 1.04 1.04 0 0 0-.003 1.473L6.523 8l-2.218 2.219a1.049 1.049 0 0 0 .003 1.473c.41.41 1.067.41 1.473.003L8 9.477l2.219 2.218a1.049 1.049 0 0 0 1.473-.003c.41-.41.41-1.067.003-1.473L9.477 8l2.218-2.219a1.049 1.049 0 0 0-.003-1.473 1.04 1.04 0 0 0-1.473-.003z" fill="#FFF" fill-rule="evenodd"/>
    </svg>
  `;

  closeButton.classList.add("zeplin-extension-button", "zeplin-extension-close-button");
  closeButton.addEventListener("click", () => {
    overlay.remove();
  });
  header.append(closeButton);
  wrapper.append(header);

  // Screen
  const image = document.createElement("img");
  image.classList.add("zeplin-extension-image");
  image.src = src;
  image.width = width;
  image.height = height;
  image.style.opacity = 0.7;
  wrapper.append(image);

  overlay.append(wrapper);
  makeZeplinOverlayDraggable(wrapper);

  // Overlay Events
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();

      overlay.remove();

      document.removeEventListener("keydown", handleKeyDown)
    }
  }

  document.addEventListener("keydown", handleKeyDown)

  return overlay;
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.from === "popup") {
    if (msg.subject === "DOMInfo") {
      const screenImage = document.querySelector(".snapshotImage");
      const screenName = document.querySelector("header h2").textContent;
      if (screenImage) {
        response({
          src: screenImage.src,
          width: screenImage.getAttribute("width"),
          height: screenImage.getAttribute("height"),
          screenName
        });
      } else {
        response(null);
      }
    } else if (msg.subject === "compare") {
      chrome.storage.sync.get("screenImageData", function (data) {
        if (
          data &&
          data.screenImageData &&
          !document.querySelector(".zeplin-extension-overlay")
        ) {
          const overlay = createZeplinOverlay(data.screenImageData);
          document.body.append(overlay);
        }
      });
    }
  }

  return true;
});
