let getTransformedData = (() => {
  var _ref6 = _asyncToGenerator(function* (propSpec, targetProp, rawData) {
    const specType = typeof propSpec;

    if (specType === 'boolean') {
      debug('Including property "%s" as is (boolean spec)', targetProp);

      return rawData[targetProp];
    }

    if (specType === 'string') {
      debug('Mapping original name "%s" to target property "%s"', propSpec, targetProp);

      return objectPath.get(rawData, propSpec);
    }

    if (specType === 'function') {
      debug('Calling first-level transform function for property "%s"', targetProp);

      return yield propSpec(rawData);
    }

    if (Array.isArray(propSpec)) {
      debug('Array of specs encountered for property "%s" - recursing', targetProp);

      return yield Promise.all(propSpec.map((() => {
        var _ref7 = _asyncToGenerator(function* (subSpec) {
          return yield getTransformedData(subSpec, targetProp, rawData);
        });

        return function (_x13) {
          return _ref7.apply(this, arguments);
        };
      })()));
    }

    if (specType === 'object') {
      const { src: sourceProp = targetProp, transform = noTransform, iterate } = propSpec;
      const rawValue = objectPath.get(rawData, sourceProp);
      const applyTransform = typeof transform === 'object' ? createTransformer(transform) : transform;

      if (iterate) {
        const isIterable = Array.isArray(rawValue);
        const iterable = typeof rawValue === 'undefined' ? [] : isIterable ? rawValue : [rawValue];
        const { max = iterable.length } = propSpec;

        debug('Target "%s" - iterating over value of source property "%s" (max %s items)', targetProp, sourceProp, max);

        if (!isIterable) {
          debug('Attempted to iterate over non-array property "%s". Coerced it into an array.', sourceProp);
        }

        return yield Promise.map(iterable.slice(0, max), applyTransform);
      }

      return yield applyTransform(rawValue);
    }
  });

  return function getTransformedData(_x10, _x11, _x12) {
    return _ref6.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const getDebugger = require('debug');
const objectPath = require('object-path');
const Promise = require('bluebird');

const debug = getDebugger('octomore:transformer');
const noTransform = raw => raw;
const isExcluded = targetSpec => typeof targetSpec === 'boolean' && !targetSpec;

function createTransformer(...specs) {
  debug('Creating transformer for %s specs', specs.length);

  specs.forEach(validateSpec);

  return (() => {
    var _ref = _asyncToGenerator(function* (rawData) {
      return yield Promise.reduce(specs, (() => {
        var _ref2 = _asyncToGenerator(function* (data, spec, index) {
          if (typeof spec === 'function') {
            debug('Spec at index %s is a function', index);

            return yield spec(data);
          }

          debug('Spec at index %s is an object', index);

          return yield Promise.reduce(Object.keys(spec), (() => {
            var _ref3 = _asyncToGenerator(function* (obj, targetProp) {
              const targetSpec = spec[targetProp];

              if (isExcluded(targetSpec)) {
                return obj;
              }

              return Object.assign({}, obj, { [targetProp]: yield getTransformedData(targetSpec, targetProp, data) });
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

function createAdditiveTransformer(...specs) {
  return (() => {
    var _ref4 = _asyncToGenerator(function* (rawData) {
      return yield Promise.reduce(specs, (() => {
        var _ref5 = _asyncToGenerator(function* (data, spec) {
          const applyTransform = createTransformer(spec);
          const transformed = yield applyTransform(data);

          let obj = Object.assign({}, data, transformed);

          Object.keys(spec).forEach(function (prop) {
            if (isExcluded(spec[prop])) {
              delete obj[prop];
            }
          });

          return obj;
        });

        return function (_x8, _x9) {
          return _ref5.apply(this, arguments);
        };
      })(), rawData);
    });

    return function (_x7) {
      return _ref4.apply(this, arguments);
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

module.exports = {
  noTransform,
  createTransformer,
  createAdditiveTransformer,
  validateSpec,
  getTransformedData
};