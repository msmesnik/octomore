'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defineDocument;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _transformer = require('./transformer');

var _pseudo = require('./cache/pseudo');

var _pseudo2 = _interopRequireDefault(_pseudo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('octomore:document');
const hashString = function (str) {
  let algorithm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'md5';
  return _crypto2.default.createHash(algorithm).update(str).digest('hex');
};

function defineDocument(_ref) {
  let retriever = _ref.retriever,
      uriTemplate = _ref.uriTemplate;
  var _ref$getUri = _ref.getUri;
  let getUri = _ref$getUri === undefined ? id => `${id}` : _ref$getUri;
  var _ref$transformer = _ref.transformer;
  let transformer = _ref$transformer === undefined ? _transformer.noTransform : _ref$transformer;
  var _ref$rawCache = _ref.rawCache;
  let rawCache = _ref$rawCache === undefined ? (0, _pseudo2.default)() : _ref$rawCache;
  var _ref$transformedCache = _ref.transformedCache;
  let transformedCache = _ref$transformedCache === undefined ? (0, _pseudo2.default)() : _ref$transformedCache;
  var _ref$getCacheId = _ref.getCacheId;
  let getCacheId = _ref$getCacheId === undefined ? hashString : _ref$getCacheId;
  var _ref$friendlyName = _ref.friendlyName;
  let friendlyName = _ref$friendlyName === undefined ? 'Document' : _ref$friendlyName;

  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when defining a document.');
  }

  if (typeof getUri !== 'function' && typeof uriTemplate !== 'string') {
    throw new Error('You must provide either an "uriTemplate" string or a "getUri" function when creating a new document.');
  }

  const getFullUri = uriTemplate ? id => uriTemplate.replace(/\{id\}/i, id) : getUri;
  const isInCache = (() => {
    var _ref2 = _asyncToGenerator(function* (id, cache) {
      return (yield cache.exists(id)) && !(yield cache.isOutdated(id));
    });

    return function isInCache(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  })();

  let getTransformedData = (() => {
    var _ref3 = _asyncToGenerator(function* (id, options) {
      const debugDoc = function (msg) {
        for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          params[_key - 1] = arguments[_key];
        }

        return debug(`[%s %s] ${msg}`, friendlyName, id, ...params);
      };
      const uri = yield getFullUri(id, options);
      const cacheId = yield getCacheId(uri);
      const cachedTransformedData = yield isInCache(cacheId, transformedCache);

      if (cachedTransformedData) {
        debug('Returning cached transformed data for uri %s (cache id %s).', uri, cacheId);

        return yield transformedCache.retrieve(cacheId);
      }

      const cachedRawData = yield isInCache(cacheId, rawCache);

      debugDoc('Retrieving raw data from %s, full uri is %s (cache id %s)', cachedRawData ? 'cache' : 'source', uri, cacheId);

      const raw = cachedRawData ? yield rawCache.retrieve(cacheId) : yield retriever(uri, options);

      debugDoc('Raw data retrieved - applying transformation');

      if (!cachedRawData) {
        yield rawCache.store(cacheId, raw);
      }

      const transformed = yield transformer(raw);

      debugDoc('Transformation applied');

      yield transformedCache.store(cacheId, transformed);

      return transformed;
    });

    return function getTransformedData(_x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  })();

  getTransformedData.config = {
    retriever,
    rawCache,
    transformedCache,
    getFullUri,
    getCacheId
  };

  return getTransformedData;
}