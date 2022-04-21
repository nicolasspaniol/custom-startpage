'use strict';

export function addUrlParameters(url, params) {
  const paramArr = [];

  for (let key in params) {
    paramArr.push(key + "=" + encodeURIComponent(params[key]));
  }

  return url + "?" + paramArr.join("&");
}

// private

function toCamelCase(id) {
  let result = "";
  let wasLastSpace = false;
  for (let letter of id) {
    if (letter == "-") {
      wasLastSpace = true;
      continue;
    }
    result += wasLastSpace? letter.toUpperCase() : letter;
    wasLastSpace = false;
  }
  return result;
}