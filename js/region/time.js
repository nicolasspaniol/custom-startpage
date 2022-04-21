"use strict";

import calculateSpline from "/js/spline.js";
import {addUrlParameters} from "/js/util.js";

// Date & time

const date = document.getElementById("date");
const time = document.getElementById("time");

let currentDateTime;

function formatTime(hours, mins) {
  return hours.toString().padStart(2, "0") + ":" + mins.toString().padStart(2, "0");
}

async function updateDateTime() {
  currentDateTime = new Date();
  
  const hour = currentDateTime.getHours();
  const minute = currentDateTime.getMinutes();
  
  time.innerHTML = formatTime(hour, minute);

  date.innerHTML = currentDateTime.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
}
setInterval(updateDateTime, 10000);
updateDateTime();

// Weather

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/onecall";
const WEATHER_KEY = "611a749b281ce7dfa7c085a47bd1eda8";

const weatherCnv = document.getElementById("weather-cnv");

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
  const {latitude, longitude} = pos.coords;

  const url = addUrlParameters(WEATHER_URL, {
    lat: latitude,
    lon: longitude,
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

let weatherCtx = weatherCnv.getContext("2d");

function adjustWeatherSize() {
  // Get actual canvas dimensions in pixels
  const {width, height} = weatherCnv.getBoundingClientRect();

  weatherCnv.width = width;
  weatherCnv.height = height;
}

window.onresize = () => {
  adjustWeatherSize();
  drawWeatherGraphs();
}
adjustWeatherSize();

async function drawWeatherGraphs() {
  // Clear canvas content
  weatherCtx.clearRect(0, 0, weatherCnv.width, weatherCnv.height);

  const weatherData = await getWeatherData();

  // Draws the curves for the weather data
  function drawGraph(lineColor, data) {
    // Transform raw data into spline
    const spline = calculateSpline(data, 20, undefined, data[data.length - 1]);

    // Create padding inside the canvas
    const width = weatherCnv.width - 10;
    const height = weatherCnv.height - 10;

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