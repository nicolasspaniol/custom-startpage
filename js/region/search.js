"use strict";

const searchIcon = document.getElementById("search-icon");
const searchForm = document.getElementById("search-form");

searchIcon.onclick = () => searchForm.submit();