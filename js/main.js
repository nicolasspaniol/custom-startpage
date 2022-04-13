"use strict";

import {
  addUrlParameters,
  getElementsWithId
} from "./util.js";
import calculateSpline from "./spline.js";

const ids = getElementsWithId();

// Global constants

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/onecall";
const WEATHER_KEY = "611a749b281ce7dfa7c085a47bd1eda8";

// Search bar

ids.searchIcon.onclick = () => ids.searchForm.submit();

// DateTime

let currentDateTime;

function formatTime(hours, mins) {
  return hours.toString().padStart(2, "0") + ":" + mins.toString().padStart(2, "0");
}

async function updateDateTime() {
  currentDateTime = new Date();
  
  const hour = currentDateTime.getHours();
  const minute = currentDateTime.getMinutes();
  
  ids.time.innerHTML = formatTime(hour, minute);

  ids.date.innerHTML = currentDateTime.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
}
setInterval(updateDateTime, 10000);
updateDateTime();

// Weather

async function getWeatherData() {
  if (!navigator.geolocation) return null;

  if (localStorage.getItem("weatherLastUpdate") == currentDateTime.getHours()) {
    return JSON.parse(localStorage.getItem("weatherData"));
  }

  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      success => resolve(success),
      error => reject(error)
    );
  }).catch(
    () => console.error("Unable to retrieve current position")
  );
  const lat  = pos.coords.latitude;
  const lon = pos.coords.longitude;

  const url = addUrlParameters(WEATHER_URL, {
    lat,
    lon,
    appid: WEATHER_KEY,
    exclude: "minutely,daily,alerts,current",
    units: "metric"
  });

  const jsonData = await fetch(url).catch(
    () => console.error("Unable to get weather data")
  );
  const data = (await jsonData.json()).hourly.slice(0, 25);
  
  localStorage.setItem("weatherLastUpdate", currentDateTime.getHours());
  localStorage.setItem("weatherData", JSON.stringify(data));
  return data;
}

let weatherCtx = ids.weatherCnv.getContext("2d");

function adjustWeatherSize() {
  
  // Get actual canvas dimensions in pixels
  const {width, height} = ids.weatherCnv.getBoundingClientRect();

  ids.weatherCnv.width = width;
  ids.weatherCnv.height = height;
}

window.onresize = () => {
  adjustWeatherSize();
  drawWeatherGraphs();
}
adjustWeatherSize();

async function drawWeatherGraphs() {

  // Clear canvas content
  weatherCtx.clearRect(0, 0, ids.weatherCnv.width, ids.weatherCnv.height);

  const weatherData = await getWeatherData();

  // Draws the curves for the weather data
  function drawGraph(lineColor, data) {
    
    // Transform raw data into spline
    const spline = calculateSpline(data, 20, undefined, data[data.length - 1]);

    // Create padding inside the canvas
    const width = ids.weatherCnv.width - 10;
    const height = ids.weatherCnv.height - 10;

    // Translate spline data into 2d canvas coordinates
    let points = spline.map((val, i) => ({
      x: i / spline.length * width + 5,
      y: height - (val * height) + 5
    }));

    // Drawing commands
    weatherCtx.strokeStyle = lineColor;
    weatherCtx.beginPath();
    weatherCtx.moveTo(points[0].x, points[0].y);
    for (let t = 1; t < points.length; t++) {
      weatherCtx.lineTo(points[t].x, points[t].y);
    }
    weatherCtx.stroke();
    weatherCtx.closePath();
  }

  drawGraph("#fff", weatherData.map(el => el.clouds / 100));
  drawGraph("#0df", weatherData.map(el => el.pop));
}
setInterval(drawWeatherGraphs, 60000);
drawWeatherGraphs();

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