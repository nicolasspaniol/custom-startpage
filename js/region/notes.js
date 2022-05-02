"use strict";

const textArea = document.getElementById("notes-region");

// All notes are stored in the browser's local storage
// Loads the notes
textArea.value = decodeURIComponent(localStorage.getItem("notes"));

// Saves the notes before the page unloads
window.addEventListener("beforeunload", () => {
  localStorage.setItem("notes", encodeURIComponent(textArea.value));
});