'use strict';
var assert = require('assert');
var csv_iterator = require('../index.js');

var assert = require('assert');

var resultTable = {
  'example1.csv': [
    ['aa', 'bb', 'cc'], ['xx', 'yy', 'zz']
  ],
  'example2.csv': [
    ['aa', 'bb', 'cc'], ['zz', 'yy', 'xx']
  ],
  'example3.csv': [
    ['aa', 'b\nb', 'cc'], ['zz', 'yy', 'xx']
  ],
  'example4.csv': [
    ['aaa', 'b"b"b', 'ccc']
  ],
  'example5.csv': [
    ['aaa', 'bb,bb"bb"', 'cc'], ['aaa', "bb\n,\nbb\"bb\"", 'cc']
  ],
  'example6.csv': [
    ['a', 'b', 'c'], ['x', 'y', 'z']
  ],
  'example7.csv': [
    ['aa', 'bb', 'cc'], ['xx', 'yy', 'zz']
  ]
}

Object.keys(resultTable).forEach(function (file) {
  describe('loading ' + file, function() {
    it('should return lines of csv', function(done) {
      let rowCount = 0;
      let settings = {
        filename: __dirname + '/' + file,
        delimeter: ',',
        enclosure: '"',
        closeCallback: function() {
          done();
        }
      };
      if (file == 'simple7.csv') {
        settings.delimeter = "\t";
      }
      csv_iterator(settings, function(row) {
        assert.deepEqual(resultTable[file][rowCount], row);
        rowCount = rowCount + 1;
      }).run();
    });
  });
});

describe('loading not file that doesnt exists', function() {
  it('should return error to errorCallback', function(done) {
    let settings = {
      filename: __dirname + '/simple_no_file.csv',
      delimeter: ',',
      enclosure: '"',
      errorCallback: function(err) {
        assert.equal(err.code, 'ENOENT');
        done();
      }
    };
    csv_iterator(settings, function(row) {}).run();
  });

});
