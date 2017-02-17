'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createPseudoCache;
function createPseudoCache() {
  return {
    getConfig: () => ({}),
    exists: id => false,
    isOutdated: id => true,
    store: (id, data) => data,
    retrieve: id => undefined,
    remove: id => true,
    getRemainingLifetime: id => 0
  };
}