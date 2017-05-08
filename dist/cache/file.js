function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const { createLogger } = require('../logger');

Promise.promisifyAll(fs);

module.exports = function createFileCache({ lifetime = 0, directory = 'cache', extension = 'json', json = true, logger = createLogger('octomore:cache:file') } = {}) {
  logger.verbose('Creating file cache object. Lifetime is %s sec, cache directory is "%s", file extension is "%s".', lifetime, directory, extension);

  const getFullPath = id => path.resolve(directory, `${id}.${extension}`);

  const getConfig = () => ({ lifetime, directory, extension });

  const exists = (() => {
    var _ref = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      logger.verbose('Checking if file %s exists', fullPath);

      try {
        yield fs.accessAsync(fullPath);

        logger.debug('File %s exists', fullPath);

        return true;
      } catch (e) {
        logger.verbose('Cannot access file %s (error message: %s)', fullPath, e.message);

        return false;
      }
    });

    return function exists(_x) {
      return _ref.apply(this, arguments);
    };
  })();

  const store = (() => {
    var _ref2 = _asyncToGenerator(function* (id, data) {
      const fullPath = getFullPath(id);

      logger.verbose('Attempting to write cache file %s', fullPath);

      yield fs.ensureDirAsync(path.dirname(fullPath));
      yield fs.writeFileAsync(fullPath, json ? JSON.stringify(data) : data, { encoding: 'utf8' });

      logger.debug('Cache file %s written', fullPath);
    });

    return function store(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  })();

  const retrieve = (() => {
    var _ref3 = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      logger.verbose('Attempting to read cache file %s', fullPath);

      const raw = yield fs.readFileAsync(fullPath, 'utf8');

      logger.debug('Cache file %s read, JSON.parse()ing contents.', fullPath);

      return json ? JSON.parse(raw) : raw;
    });

    return function retrieve(_x4) {
      return _ref3.apply(this, arguments);
    };
  })();

  const remove = (() => {
    var _ref4 = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      logger.verbose('Attempting to remove cache file %s', fullPath);

      yield fs.unlinkAsync(fullPath);

      logger.debug('Cache file %s removed', fullPath);
    });

    return function remove(_x5) {
      return _ref4.apply(this, arguments);
    };
  })();

  const getRemainingLifetime = (() => {
    var _ref5 = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      const { mtime } = yield fs.statAsync(fullPath);
      const now = new Date();
      const age = (now - mtime) / 1000;
      const remaining = age >= lifetime ? 0 : lifetime - age;

      logger.debug('mtime for cache file %s is %s, now is %s, age is therefore %s sec. Lifetime is %s sec, thus %s sec remain.', fullPath, mtime, now, age, lifetime, remaining);

      return remaining;
    });

    return function getRemainingLifetime(_x6) {
      return _ref5.apply(this, arguments);
    };
  })();

  const isOutdated = (() => {
    var _ref6 = _asyncToGenerator(function* (id) {
      return (yield getRemainingLifetime(id)) === 0;
    });

    return function isOutdated(_x7) {
      return _ref6.apply(this, arguments);
    };
  })();

  return {
    getConfig,
    exists,
    store,
    retrieve,
    remove,
    getRemainingLifetime,
    isOutdated
  };
};