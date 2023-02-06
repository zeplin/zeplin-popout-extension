const screenDetail = document.querySelector(".screen-detail");
const info = document.querySelector(".info");
const popupImage = document.querySelector("#image");
const popupButton = document.querySelector("#button");
const screenName = document.querySelector(".header h1");

function showScreenDetail() {
  screenDetail.classList.remove("hidden");
  info.classList.add("hidden");
}

function showInfo() {
  screenDetail.classList.add("hidden");
  info.classList.remove("hidden");
}

function populatePopupHTML(data) {
  popupImage.src = data.src;
  screenName.textContent = "🖼 " + data.screenName
}

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
            populatePopupHTML(data);

            chrome.storage.sync.set({ screenImageData: data });
          } else {
            chrome.storage.sync.get("screenImageData", function (data) {
              if (data && data.screenImageData) {
                showScreenDetail();
                populatePopupHTML(data.screenImageData)
              } else {
                showInfo();
              }
            });
          }
        }
      );
    }
  );
});
// END - DOM Events
