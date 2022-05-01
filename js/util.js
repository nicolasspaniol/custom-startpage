'use strict';

export function addUrlParameters(url, params) {
  const paramArr = [];

  for (let key in params) {
    paramArr.push(key + "=" + encodeURIComponent(params[key]));
  }

  return url + "?" + paramArr.join("&");
}