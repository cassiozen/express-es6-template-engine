"use strict";
const fs = require('fs'); // this engine requires the fs module
const toAbsolute = require("path").resolve;

// Escaping
const escapeMap = {
  "&": "&amp;",
  '"': "&quot;",
  "'": "&#39;",
  "<": "&lt;",
  ">": "&gt;"
};
const escapeRegex = /[&"'<>]/g;
const lookupEscape = ch => escapeMap[ch];

// Caching
const templateCache = new Map();

module.exports = {
  escape(val) {
    if (typeof val !== "string") return val;
    return val.replace(escapeRegex, lookupEscape);
  },

  readTemplate(path, options, cb, readFile = fs.readFile) {
    // Cache unless options.cache is explicitelly set to false;
    const cache = !(options && options.cache === false);
  
    const absPath = toAbsolute(path);
    if (cache && templateCache.has(absPath)) {
      cb(null, templateCache.get(absPath));
      return;
    }
    readFile(absPath, "utf-8" ,(error, data) => {
      if (error) cb(error)
      else {
        cache && templateCache.set(absPath, data);
        cb(null, data);
      }
    });
    
  }
};
