'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createFileRetriever;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const readFileAsync = _bluebird2.default.promisify(_fs2.default.readFile);

function createFileRetriever() {
  let defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return (() => {
    var _ref = _asyncToGenerator(function* (uri) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return yield readFileAsync(uri, _extends({ encoding: 'utf8' }, defaults, options));
    });

    return function (_x2) {
      return _ref.apply(this, arguments);
    };
  })();
}