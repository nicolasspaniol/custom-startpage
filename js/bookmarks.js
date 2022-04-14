"use strict";

const bookmarksRegion = document.getElementById("bookmarks-region");

function displayBookmarkGroup(groupElem) {
  bookmarksRegion.querySelector(".bookmark-group.active")?.classList.remove("active");
  groupElem.classList.add("active");
}
function appendBookmarks(base, bookmarks) {
  const groupElem = document.createElement("div");
  groupElem.classList.add("bookmark-group");

  for (let bmName in bookmarks) {
    const bmValue = bookmarks[bmName];

    const bmElem = document.createElement("a");
    bmElem.innerHTML = bmName;
    bmElem.classList.add("bookmark");

    if (typeof bmValue === "object") {
      const group = appendBookmarks(base, bmValue);
      bmElem.onclick = () => displayBookmarkGroup();
    }
    else {
      bmElem.href = bmValue;
    }

    groupElem.appendChild(bmElem);
  }

  base.appendChild(groupElem);

  return groupElem;
}
async function initBookmarks(path) {
  fetch(path).then(
    // Success
    async val => {
      const bookmarks = await val.json();
      const baseBookmarkGroup = appendBookmarks(bookmarksRegion, bookmarks);
      displayBookmarkGroup(baseBookmarkGroup);
    },
    
    // Failure
    () => {
      console.error("Unable to get bookmarks");
    }
  );
}
initBookmarks("/json/bookmarks.json");