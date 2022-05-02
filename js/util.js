'use strict';

export function addUrlParameters(url, params) {
  const paramArr = [];

  for (let key in params) {
    paramArr.push(key + "=" + encodeURIComponent(params[key]));
  }

  return url + "?" + paramArr.join("&");
}

export function getAllElementsWithId(parent = document) {
  const ids = {};
  for (let elem of parent.querySelectorAll("*[id]")) {
    ids[toCamelCase(elem.id)] = elem;
  }
  return ids;
}

// Private

function toCamelCase(varName) {
  return varName.toLowerCase().replace(/[ -_](\w)/g, (_, g) => g[0].toUpperCase());
}