"use strict";

const textArea = document.getElementById("notes-region");

window.onbeforeunload = () => {
  localStorage.setItem("notes", encodeURIComponent(textArea.value));
};
textArea.value = decodeURIComponent(localStorage.getItem("notes"));