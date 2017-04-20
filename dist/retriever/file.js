function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const Promise = require('bluebird');

const readFileAsync = Promise.promisify(fs.readFile);

module.exports = function createFileRetriever(defaults = {}) {
  return (() => {
    var _ref = _asyncToGenerator(function* (uri, options = {}) {
      return readFileAsync(uri, Object.assign({ encoding: 'utf8' }, defaults, options));
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();
};