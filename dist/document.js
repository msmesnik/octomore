'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defineDocument;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _transformer = require('./transformer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('octomore:document');

function defineDocument(_ref) {
  let retriever = _ref.retriever,
      uriTemplate = _ref.uriTemplate,
      getUri = _ref.getUri;
  var _ref$transformer = _ref.transformer;
  let transformer = _ref$transformer === undefined ? _transformer.noTransform : _ref$transformer;
  var _ref$friendlyName = _ref.friendlyName;
  let friendlyName = _ref$friendlyName === undefined ? 'Document' : _ref$friendlyName;

  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when defining a document.');
  }

  if (typeof getUri !== 'function' && typeof uriTemplate !== 'string') {
    throw new Error('You must provide either an "uriTemplate" string or a "getUri" function when creating a new document.');
  }

  const getFullUri = getUri || (id => uriTemplate.replace(/\{id\}/i, id));

  let getTransformedData = (() => {
    var _ref2 = _asyncToGenerator(function* (id, options) {
      const debugDoc = function (msg) {
        for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          params[_key - 1] = arguments[_key];
        }

        return debug(`[%s %s] ${msg}`, friendlyName, id, ...params);
      };
      const uri = yield getFullUri(id, options);

      debugDoc('Retrieving raw data, full uri is %s', uri);

      const raw = yield retriever(uri, options);

      debugDoc('Raw data retrieved - applying transformation');

      const transformed = yield transformer(raw);

      debugDoc('Transformation applied');

      return transformed;
    });

    return function getTransformedData(_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  })();

  getTransformedData.retriever = retriever;
  getTransformedData.cache = _asyncToGenerator(function* () {
    return 'cache';
  });

  return getTransformedData;
}