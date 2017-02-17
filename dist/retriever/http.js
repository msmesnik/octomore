'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createHttpRetriever;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function createHttpRetriever() {
  let defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return (() => {
    var _ref = _asyncToGenerator(function* (uri) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return yield (0, _requestPromise2.default)(_extends({}, defaults, options, { uri }));
    });

    return function (_x2) {
      return _ref.apply(this, arguments);
    };
  })();
}