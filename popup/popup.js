const screenDetail = document.querySelector(".screen-detail");
const info = document.querySelector(".info");
const popupImage = document.querySelector("#image");
const popupButton = document.querySelector("#button");

function showScreenDetail() {
  screenDetail.classList.remove("hidden");
  info.classList.add("hidden");
}

function showInfo() {
  screenDetail.classList.add("hidden");
  info.classList.remove("hidden");
}

// Chrome Events
chrome.storage.sync.get("screenImageData", function (data) {
  if (data && data.screenImageData) {
    showScreenDetail();

    popupImage.src = data.screenImageData.src;
  } else {
    showInfo();
  }
});
// END - Chrome Events

// DOM Events
popupButton.addEventListener("click", () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        from: "popup",
        subject: "compare",
      });

      window.close();
    }
  );
});

window.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { from: "popup", subject: "DOMInfo" },
        (data) => {
          if (data) {
            showScreenDetail();

            popupImage.src = data.src;
            chrome.storage.sync.set({ screenImageData: data });
          }
        }
      );
    }
  );
});
// END - DOM Events
