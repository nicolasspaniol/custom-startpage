"use strict";

const searchIcon = ids.searchIcon;
const searchForm = ids.searchForm;
const searchInput = ids.search;
const searchSuggestions = ids.searchSuggestions;

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
      let spaceIndex = -1;
      do {
        names.push([el.slice(spaceIndex + 1).toLowerCase(), id]);
      } while ((spaceIndex = el.indexOf(" ", spaceIndex + 1)) != -1);
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
    e.preventDefault();
    
    clearSuggestions();
    for (let id of tags[tagName]) {
      appendSuggestion(id);
    }
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
    const tagSuggestions = Object.keys(tags)
      .map((tag) => [tag, matchSearch(search, tag)])
      .filter(([, diff]) => diff >= 0)
      .sort(([, diffA], [, diffB]) => diffA - diffB);

    for (let tag of tagSuggestions) {
      appendTag(tag[0]);
    }
  }
  else {
    const suggestions = names
      .map(([name, id]) => [id, matchSearch(search, name)])
      .filter(([, diff]) => diff >= 0)
      .sort(([, diffA], [, diffB]) => diffA - diffB)
      .map(([id]) => id);

    const suggestionSet = new Set(suggestions);
    for (let sg of suggestionSet) {
      appendSuggestion(sg);
    }
  }
}
searchInput.addEventListener("input", handleSearchInput);

function matchSearch(searchTerm, match) {
  if (searchTerm[0] != match[0]) {
    return -1;
  }

  let i = 0;
  let diff = 0;
  for (let c of searchTerm) {
    while (i < match.length && match[i] != c) {
      i++;
      diff++;
    }
    i++;
  }
  return i <= match.length ? diff : -1;
}