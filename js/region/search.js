"use strict";

const searchIcon = document.getElementById("search-icon");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search");
const searchSuggestions = document.getElementById("search-suggestions");

searchIcon.onclick = () => searchForm.submit();

// Bookmarks auto complete

let nameTable = {};
let links = [];

const BOOKMARKS_SRC = "/data/sites.txt";

const bookmarks = await (await fetch(BOOKMARKS_SRC)).text();
let i = 0;
for (let bm of bookmarks.split("\n")) {
  let [names, link] = bm.split("=");
  names = names.split(",");
  for (let name of names) {
    nameTable[name.toLowerCase()] = i;
  }
  links.push([names[0], link]);
  i++;
}

async function handleSearchInput() {
  searchSuggestions.innerHTML = "";
  if (searchInput.value == "") return;

  const search = searchInput.value.toLowerCase();
  const suggestionSet = new Set();

  for (let [k, v] of Object.entries(nameTable)) {
    if (k.startsWith(search)) {
      suggestionSet.add(links[v]);
    }
  }

  for (let suggestion of suggestionSet) {
    const elem = document.createElement("a");
    elem.href = suggestion[1];
    elem.innerHTML = suggestion[0];
    elem.classList.add("suggestion");
    searchSuggestions.append(elem);
  }
}

searchInput.addEventListener("input", handleSearchInput);