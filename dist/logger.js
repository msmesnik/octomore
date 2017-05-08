const getDebugger = require('debug');

const createLogger = identifier => {
  const debug = getDebugger(identifier);

  return {
    debug,
    verbose: debug,
    info: debug,
    warn: debug,
    error: debug
  };
};

module.exports = {
  createLogger
};