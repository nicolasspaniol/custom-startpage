"use strict";

const textArea = ids.notesRegion;

// All notes are stored in the browser's local storage
// Loads the notes
textArea.value = decodeURIComponent(localStorage.getItem("notes"));

// Saves the notes before the page unloads
window.addEventListener("beforeunload", () => {
  localStorage.setItem("notes", encodeURIComponent(textArea.value));
});