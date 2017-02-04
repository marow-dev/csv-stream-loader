/*jslint node:true, maxerr:1000, white: false, indent: 2, continue: true, vars: true*/
var fs = require('fs');

module.exports = createCsvLoader;

function createCsvLoader(settings, callback) {
  'use strict';
  let isEnclosure = 0;
  let breakLine = '';
  let row = [];
  let v = '';
  let i = -1;

  function parseBreakLine(char, nextChar) {
    if ((char === "\r" || char === "\n") && breakLine === '') {
      if (char === "\r" && nextChar === "\n") {
        breakLine = "\n";
      } else if (char === "\r") {
        breakLine = "\r";
      } else {
        breakLine = "\n";
      }
    }
  }

  function analyze(str) {
    while (i < str.length) {
      i = i + 1;
      let char = str.charAt(i);
      let nextChar = str.charAt(i + 1);
      if (breakLine === '') {
        parseBreakLine(char, nextChar);
      }
      if (char === "\r" && breakLine !== "\r") {
        continue;
      }
      if (char === settings.enclosure) {
        if (nextChar === settings.enclosure && isEnclosure === 1) {
          v = v + settings.enclosure;
          i = i + 1;
          continue;
        }
        if (isEnclosure === 1) {
          row.push(v);
          v = '';
          isEnclosure = 0;
        } else {
          isEnclosure = 1;
        }
      } else if (char === settings.delimeter && isEnclosure === 0) {
        if (isEnclosure === 0) {
          if (v.length) {
            row.push(v);
            v = '';
          }
        }
      } else if (char === breakLine) {
        if (isEnclosure === 1) {
          v = v + char;
        } else {
          if (v.length) {
            row.push(v);
          }
          callback(row);
          v = '';
          row = [];
          isEnclosure = 0;
        }
      } else {
        v = v + char;
      }
    }
  }

  return {
    run: function () {
      var stream = fs.createReadStream(settings.filename);
      stream.on('data', function (chunk) {
        analyze(chunk.toString());
      });
      stream.on('close', function () {
        if (settings.closeCallback && typeof(settings.closeCallback) === 'function') {
          settings.closeCallback();
        }
      });
      stream.on('error', function (err) {
        if (settings.errorCallback && typeof(settings.errorCallback) === 'function') {
          settings.errorCallback(err);
        }
      });
    }
  };
}
