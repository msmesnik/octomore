'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createFileCache;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('octomore:cache:file');

_bluebird2.default.promisifyAll(_fsExtra2.default);

function createFileCache() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$lifetime = _ref.lifetime;

  let lifetime = _ref$lifetime === undefined ? 0 : _ref$lifetime;
  var _ref$directory = _ref.directory;
  let directory = _ref$directory === undefined ? 'cache' : _ref$directory;
  var _ref$extension = _ref.extension;
  let extension = _ref$extension === undefined ? 'json' : _ref$extension;
  var _ref$json = _ref.json;
  let json = _ref$json === undefined ? true : _ref$json;

  debug('Creating file cache object. Lifetime is %s sec, cache directory is "%s", file extension is "%s".', lifetime, directory, extension);

  const getFullPath = id => _path2.default.resolve(directory, `${id}.${extension}`);

  const getConfig = () => ({ lifetime, directory, extension });
  const exists = (() => {
    var _ref2 = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      debug('Checking if file %s exists', fullPath);

      try {
        yield _fsExtra2.default.accessAsync(fullPath);

        debug('File %s exists', fullPath);

        return true;
      } catch (e) {
        debug('Cannot access file %s (error message: %s)', fullPath, e.message);

        return false;
      }
    });

    return function exists(_x2) {
      return _ref2.apply(this, arguments);
    };
  })();
  const store = (() => {
    var _ref3 = _asyncToGenerator(function* (id, data) {
      const fullPath = getFullPath(id);

      debug('Attempting to write cache file %s', fullPath);

      yield _fsExtra2.default.ensureDirAsync(_path2.default.dirname(fullPath));
      yield _fsExtra2.default.writeFileAsync(fullPath, json ? JSON.stringify(data) : data, { encoding: 'utf8' });

      debug('Cache file %s written', fullPath);
    });

    return function store(_x3, _x4) {
      return _ref3.apply(this, arguments);
    };
  })();
  const retrieve = (() => {
    var _ref4 = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      debug('Attempting to read cache file %s', fullPath);

      const raw = yield _fsExtra2.default.readFileAsync(fullPath, 'utf8');

      debug('Cache file %s read, JSON.parse()ing contents.', fullPath);

      return json ? JSON.parse(raw) : raw;
    });

    return function retrieve(_x5) {
      return _ref4.apply(this, arguments);
    };
  })();
  const remove = (() => {
    var _ref5 = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      debug('Attempting to remove cache file %s', fullPath);

      yield _fsExtra2.default.unlinkAsync(fullPath);

      debug('Cache file %s removed', fullPath);
    });

    return function remove(_x6) {
      return _ref5.apply(this, arguments);
    };
  })();
  const getRemainingLifetime = (() => {
    var _ref6 = _asyncToGenerator(function* (id) {
      const fullPath = getFullPath(id);

      var _ref7 = yield _fsExtra2.default.statAsync(fullPath);

      const mtime = _ref7.mtime;

      const now = new Date();
      const age = (now - mtime) / 1000;
      const remaining = age >= lifetime ? 0 : lifetime - age;

      debug('mtime for cache file %s is %s, now is %s, age is therefore %s sec. Lifetime is %s sec, thus %s sec remain.', fullPath, mtime, now, age, lifetime, remaining);

      return remaining;
    });

    return function getRemainingLifetime(_x7) {
      return _ref6.apply(this, arguments);
    };
  })();
  const isOutdated = (() => {
    var _ref8 = _asyncToGenerator(function* (id) {
      return (yield getRemainingLifetime(id)) === 0;
    });

    return function isOutdated(_x8) {
      return _ref8.apply(this, arguments);
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
}