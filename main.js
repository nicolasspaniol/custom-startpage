"use strict";

import {
  addUrlParameters,
  getElementsWithId
} from "./util.js";

const ids = getElementsWithId();

// Global constants

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/onecall";
const WEATHER_KEY = "611a749b281ce7dfa7c085a47bd1eda8";
const WEATHER_HOURS_COUNT = 24;
const WEATHER_HOUR_STEP = 2;

// Search bar

ids.searchIcon.onclick = () => ids.searchForm.submit();

// Datetime

function formatTime(hours, mins) {
  return hours.toString().padStart(2, "0") + ":" + mins.toString().padStart(2, "0");
}

function updateDateTime() {
  const dateTime = new Date();
  
  const hour = dateTime.getHours();
  const minute = dateTime.getMinutes();
  
  ids.time.innerHTML = formatTime(hour, minute);

  ids.date.innerHTML = dateTime.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
}
setInterval(updateDateTime, 5000);
updateDateTime();

// Weather

function displayWeather(data) {
  if (data === null) {
    ids.weather.innerHTML = "No weather data available";
    return;
  }

  const weatherRect = ids.weather.getBoundingClientRect();
  const cloudPoints = [];
  const popPoints = [];

  const hoursLabel = document.createElement("div");
  hoursLabel.style.cssText = `
    width: ${weatherRect.width}px;
    display: flex;
    position: relative;
  `;
  const timezoneOffset = new Date().getTimezoneOffset() / 60;

  const hourWidth = weatherRect.width / (WEATHER_HOURS_COUNT - 1);
  const heightMultiplier = weatherRect.height / 105;

  for (let i = 0; i < WEATHER_HOURS_COUNT; i++) {
    const x = i * hourWidth;
    const hourData = data.hourly[i];

    cloudPoints.push(x + "," + (hourData.clouds * heightMultiplier + 1));
    popPoints.push(x + "," + (hourData.pop * 100 * heightMultiplier + 1));

    if (i % WEATHER_HOUR_STEP == 0) {
      const hourElem = document.createElement("h1");
      hourElem.innerHTML = ((hourData.dt / 3600 - timezoneOffset) % 24).toString().padStart(2, "0");
      hourElem.style.cssText = `
        writing-mode: vertical-rl;
        position: absolute;
        font-size: 12px;
        top: 0;
        left: ${x - 8}px;
        scale: -1 -1;
        margin: 10px 0;
      `;
      hoursLabel.append(hourElem);
    }
  }

  ids.weather.innerHTML = `
  <svg viewBox="0 0 ${weatherRect.width} ${weatherRect.height}" xmlns="http://www.w3.org/2000/svg">
    <polyline points="${cloudPoints.join(" ")}" fill="none" stroke="white"/>
    <polyline points="${popPoints.join(" ")}" fill="none" stroke="cyan"/>
  </svg>`;

  ids.weather.after(hoursLabel);
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat  = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const url = addUrlParameters(WEATHER_URL, {
      lat,
      lon,
      appid: WEATHER_KEY,
      exclude: "minutely,daily,alerts,current",
      units: "metric"
    });

    fetch(url).then(response => {
      response.json().then(data => {
        displayWeather(data);
      });
    },
    () => {
      console.error("Unable to get weather data");
      displayWeather(null);
    })
  },
  () => {
    console.error("Unable to retrieve current position");
    displayWeather(null);
  }, {
    maximumAge: Infinity
  });
}

// Notes

window.onbeforeunload = () => {
  localStorage.setItem("notes", encodeURIComponent(ids.notesQuad.value));
};
ids.notesQuad.value = decodeURIComponent(localStorage.getItem("notes"));

// Bookmarks

function displayBookmarkGroup(groupElem) {
  ids.bookmarksQuad.querySelector(".bookmark-group.active")?.classList.remove("active");
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
      const baseBookmarkGroup = appendBookmarks(ids.bookmarksQuad, bookmarks);
      displayBookmarkGroup(baseBookmarkGroup);
    },
    
    // Failure
    () => {
      console.error("Unable to get bookmarks");
    }
  );
}
initBookmarks("bookmarks.json");