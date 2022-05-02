"use strict";

const searchIcon = document.getElementById("search-icon");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
const searchSuggestions = document.getElementById("search-suggestions");

searchIcon.onclick = () => searchForm.submit();

// Bookmarks suggestions

const BOOKMARKS_SRC = "/data/bookmarks.txt";

let tags, names, bookmarks;

function parseBookmark(bm) {
  let name = null;
  let link = null;

  const id = bookmarks.length;

  const elements = bm.split(",").map(el => el.trim());
  for (let el of elements) {
    if (el[0] == "#") {
      tags[el] ??= [];
      tags[el].push(id);
    }
    else if (el[0] == "@") {
      link = el.slice(1);
    }
    else {
      name ??= el;
      names.push([el.toLowerCase(), id]);
    }
  }

  bookmarks.push([name, link]);
}
async function loadBookmarks() {
  tags = {};
  names = [];
  bookmarks = [];

  const bmsText = await (await fetch(BOOKMARKS_SRC)).text();
  for (let bm of bmsText.split("\n")) {
    parseBookmark(bm);
  }

  names.sort((a, b) => a[0].length - b[0].length);
}
loadBookmarks();

function clearSuggestions() {
  searchSuggestions.innerHTML = "";
}
function appendSuggestion(id) {
  const suggestion = bookmarks[id];

  const elem = document.createElement("a");
  [elem.innerHTML, elem.href] = suggestion;
  elem.classList.add("suggestion");
  
  searchSuggestions.append(elem);
}

async function handleSearchInput() {
  const search = searchInput.value.trim().toLowerCase();
  clearSuggestions();
  if (search.length == 0) return;

  const suggestionSet = new Set();

  for (let [name, id] of names) {
    if (name.startsWith(search)) {
      suggestionSet.add(id);
    }
  }

  for (let id of suggestionSet) {
    appendSuggestion(id);
  }
}
searchInput.addEventListener("input", handleSearchInput);