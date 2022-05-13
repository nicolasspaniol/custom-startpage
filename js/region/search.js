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

function appendTag(tagName) {
  const elem = document.createElement("a");
  elem.innerHTML = tagName;
  elem.href = "";
  elem.classList.add("suggestion");
  elem.addEventListener("click", e => {
    clearSuggestions();
    for (let id of tags[tagName]) {
      appendSuggestion(id);
    }
    e.preventDefault();
    searchSuggestions.children[0].focus();
  });

  searchSuggestions.append(elem);
}
function appendSuggestion(id) {
  const suggestion = bookmarks[id];

  const elem = document.createElement("a");
  [elem.innerHTML, elem.href] = suggestion;
  elem.classList.add("suggestion");
  
  searchSuggestions.append(elem);
}

async function handleSearchInput() {
  const search = searchInput.value.trimStart().toLowerCase();
  clearSuggestions();
  if (search.length == 0) return;

  if (search[0] == "#") {
    for (let tag in tags) {
      if (tag.startsWith(search)) {
        appendTag(tag);
      }
    }
  }
  else {
    const suggestions = names.filter(([name, id]) => name.startsWith(search));
    const suggestionSet = new Set(suggestions);
    for (let sg of suggestionSet) {
      appendSuggestion(sg[1]);
    }
  }
}
searchInput.addEventListener("input", handleSearchInput);