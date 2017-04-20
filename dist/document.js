function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const crypto = require('crypto');
const getDebugger = require('debug');

const { noTransform } = require('./transformer');
const createPseudoCache = require('./cache/pseudo');

const debug = getDebugger('octomore:document');
const hashString = (str, algorithm = 'md5') => crypto.createHash(algorithm).update(str).digest('hex');

module.exports = function createDocument({ retriever, getUri = id => `${id}`, transformer = noTransform, rawCache = false, transformedCache = false, getCacheId = hashString, friendlyName = 'Document' }) {
  if (typeof retriever !== 'function') {
    throw new Error('A retriever function must be provided when creating a document.');
  }

  if (typeof getUri !== 'function') {
    throw new Error('A getUri function must be provided when creating a document.');
  }

  const cache = { raw: rawCache || createPseudoCache(), transformed: transformedCache || createPseudoCache() };
  const isInCache = (() => {
    var _ref = _asyncToGenerator(function* (id, cache) {
      return (yield cache.exists(id)) && !(yield cache.isOutdated(id));
    });

    return function isInCache(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })();

  let getTransformedData = (() => {
    var _ref2 = _asyncToGenerator(function* (id, options) {
      const debugDoc = function (msg, ...params) {
        return debug(`[%s %s] ${msg}`, friendlyName, id, ...params);
      };
      const uri = yield getUri(id, options);
      const cacheId = yield getCacheId(uri);
      const cachedTransformedData = yield isInCache(cacheId, cache.transformed);

      if (cachedTransformedData) {
        debug('Returning cached transformed data for uri %s (cache id %s).', uri, cacheId);

        return cache.transformed.retrieve(cacheId);
      }

      const cachedRawData = yield isInCache(cacheId, cache.raw);

      debugDoc('Retrieving raw data from %s, full uri is %s (cache id %s)', cachedRawData ? 'cache' : 'source', uri, cacheId);

      const raw = cachedRawData ? yield cache.raw.retrieve(cacheId) : yield retriever(uri, options);

      debugDoc('Raw data retrieved - applying transformation');

      if (!cachedRawData) {
        yield cache.raw.store(cacheId, raw);
      }

      const transformed = yield transformer(raw);

      debugDoc('Transformation applied');

      yield cache.transformed.store(cacheId, transformed);

      return transformed;
    });

    return function getTransformedData(_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  })();

  getTransformedData.config = {
    retriever,
    rawCache,
    transformedCache,
    getUri,
    getCacheId
  };

  return getTransformedData;
};