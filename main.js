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

// Clock

let clockCtx;
function initClock() {
  const clockSize = ids.clock.getBoundingClientRect().width;
  ids.clock.width = clockSize;
  ids.clock.height = clockSize;
  clockCtx = ids.clock.getContext("2d");
}
function drawClock(weatherData = null) {

  // Clear transformations and content
  clockCtx.setTransform(1, 0, 0, 1, 0, 0);
  clockCtx.clearRect(0, 0, ids.clock.width, ids.clock.height);

  // Move point (0, 0) to the center
  const halfSize = ids.clock.width >> 1;
  clockCtx.translate(halfSize, halfSize);
  
  // Rotate canvas according to time of the day
  const rotation = ((currentDateTime.getHours() + 6) * 60 + currentDateTime.getMinutes()) / 360 * Math.PI;
  clockCtx.rotate(rotation);

  const maxRadius = halfSize - 3;
  clockCtx.strokeStyle = "#fff";
  
  const outerCircleRadius = maxRadius * .6;

  // Draw outer circle
  clockCtx.beginPath();
  clockCtx.arc(0, 0, outerCircleRadius, 0, Math.PI * 2, true);
  clockCtx.stroke();

  // Draw pointer
  clockCtx.beginPath();
  clockCtx.moveTo(0, outerCircleRadius);
  clockCtx.lineTo(0, maxRadius);
  clockCtx.stroke();

  if (weatherData != null) {

    // Draws those fancy lines around the clock
    function drawCircularGraph(lineColor, data) {

      // Transform raw data into spline
      const spline = calculateSpline(data, 20, undefined, data[data.length - 1]);

      // Translates the values and their current point in time to 2d coordinates on the canvas
      function getPointPos(val, t) {
        const distanceFromCenter = val * maxRadius * .4 + outerCircleRadius;
        const angle = -t / 120 * Math.PI;
        return {
          x: Math.sin(angle) * distanceFromCenter,
          y: Math.cos(angle) * distanceFromCenter  
        }
      }

      // Translate spline data into 2d coordinates around the clock
      const points = spline.map((val, i) => getPointPos(val, i));

      clockCtx.strokeStyle = lineColor;
      clockCtx.beginPath();
      clockCtx.moveTo(points[0].x, points[0].y);
      for (let t = 1; t < points.length; t++) {
        clockCtx.lineTo(points[t].x, points[t].y);
      }
      clockCtx.stroke();
      clockCtx.closePath();
    }

    drawCircularGraph("#fff", weatherData.map(el => el.clouds / 100));
    drawCircularGraph("#0df", weatherData.map(el => el.pop));
  }
}
initClock();

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

  drawClock(await getWeatherData());
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
  const data = (await jsonData.json()).hourly.slice(0, 13);
  
  localStorage.setItem("weatherLastUpdate", currentDateTime.getHours());
  localStorage.setItem("weatherData", JSON.stringify(data));
  return data;
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