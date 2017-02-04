'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTransformedData = exports.noTransform = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let getTransformedData = exports.getTransformedData = (() => {
  var _ref4 = _asyncToGenerator(function* (propSpec, targetProp, rawData) {
    const specType = typeof propSpec;

    if (specType === 'boolean') {
      debug('Including property "%s" as is (boolean spec)', targetProp);

      return rawData[targetProp];
    }

    if (specType === 'string') {
      debug('Mapping original name "%s" to target property "%s"', propSpec, targetProp);

      return _objectPath2.default.get(rawData, propSpec);
    }

    if (specType === 'function') {
      debug('Calling first-level transform function for property "%s"', targetProp);

      return yield propSpec(rawData);
    }

    if (Array.isArray(propSpec)) {
      debug('Array of specs encountered for property "%s" - recursing', targetProp);

      return yield _bluebird2.default.all(propSpec.map((() => {
        var _ref5 = _asyncToGenerator(function* (subSpec) {
          return yield getTransformedData(subSpec, targetProp, rawData);
        });

        return function (_x10) {
          return _ref5.apply(this, arguments);
        };
      })()));
    }

    if (specType === 'object') {
      var _propSpec$src = propSpec.src;
      const sourceProp = _propSpec$src === undefined ? targetProp : _propSpec$src;
      var _propSpec$transform = propSpec.transform;
      const transform = _propSpec$transform === undefined ? noTransform : _propSpec$transform,
            iterate = propSpec.iterate;

      const rawValue = _objectPath2.default.get(rawData, sourceProp);

      if (iterate) {
        const isIterable = Array.isArray(rawValue);
        const iterable = isIterable ? rawValue : [rawValue];
        var _propSpec$max = propSpec.max;
        const max = _propSpec$max === undefined ? iterable.length : _propSpec$max;


        debug('Target "%s" - iterating over value of source property "%s" (max %n items)', targetProp, sourceProp, max);

        if (!isIterable) {
          console.warn('Attempted to iterate over non-array property "%s". Coerced it into an array.', sourceProp);
        }

        return yield _bluebird2.default.map(iterable.slice(0, max), transform);
      }

      return yield transform(rawValue);
    }
  });

  return function getTransformedData(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
})();

exports.default = createTransformer;
exports.validateSpec = validateSpec;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _objectPath = require('object-path');

var _objectPath2 = _interopRequireDefault(_objectPath);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('octomore:transformer');
const noTransform = exports.noTransform = raw => raw;

function createTransformer() {
  for (var _len = arguments.length, specs = Array(_len), _key = 0; _key < _len; _key++) {
    specs[_key] = arguments[_key];
  }

  debug('Creating transformer for %s specs', specs.length);

  specs.forEach(validateSpec);

  return (() => {
    var _ref = _asyncToGenerator(function* (rawData) {
      return yield _bluebird2.default.reduce(specs, (() => {
        var _ref2 = _asyncToGenerator(function* (data, spec, index) {
          if (typeof spec === 'function') {
            debug('Spec at index %s is a function', index);

            return yield spec(data);
          }

          debug('Spec at index %s is an object', index);

          return yield _bluebird2.default.reduce(Object.keys(spec), (() => {
            var _ref3 = _asyncToGenerator(function* (obj, targetProp) {
              return _extends({}, obj, {
                [targetProp]: yield getTransformedData(spec[targetProp], targetProp, data)
              });
            });

            return function (_x5, _x6) {
              return _ref3.apply(this, arguments);
            };
          })(), {});
        });

        return function (_x2, _x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      })(), rawData);
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();
}

function validateSpec(spec) {
  const specType = typeof spec;
  const isFunction = specType === 'function';
  const isObject = specType === 'object';

  if (!isFunction && !isObject) {
    throw new Error('createTransformer accepts only functions or objects as its parameter.');
  }

  const validTypes = ['boolean', 'string', 'function', 'object'];

  Object.keys(spec).forEach(targetProp => {
    const specType = typeof spec[targetProp];

    if (!validTypes.includes(specType)) {
      throw new Error(`Invalid specification encountered for property ${targetProp}. Must be one of [${validTypes.join(' | ')}] but found ${specType}.`);
    }
  });
}