import winston from 'winston';

winston.emitErrs = true;

/**
 * winston configuration object.
 * @api private
 */
const defaultConfig = (opts) => {
  return {
    level: opts.level || 'debug',
    handleExceptions: opts.handleExceptions || true,
    json: opts.json || false,
    colorize: opts.colorize || true
  }
}


/**
 * Expose winston configuration.
 * @param {String}
 * @param {Object} confOpts
 * @param {Object} opts
 * @return {instance} configuration
 * @api private
 */
const getWinstonConfig = (type, confOpts = {}, opts = {}) => {
  if (type === 'File') {
    opts.filename = './server.log';
    opts.maxsize = 5242880;
  }

  return new winston.transports[type](Object.assign({}, defaultConfig(confOpts), opts));
}


const logger = (env) => {
  let ret;

  if (env === 'production') {
    ret = new winston.Logger({
      transports: [
        getWinstonConfig('Console', { level: 'error' }),
        getWinstonConfig('File', { level: 'info', json: true }, { maxFiles: 100 })
      ],
      exitOnError: false
    });
  } else if (env === 'development') {
    ret = new winston.Logger({
      transports: [
        getWinstonConfig('Console'),
        getWinstonConfig('File', { level: 'info', json: true }, { maxFiles: 5, colorize: false })
      ],
      exitOnError: false
    });
  } else {
    // Else return default logger
    return new winston.Logger({
      transports: [
        getWinstonConfig('Console')
      ],
      exitOnError: false
    });
  }

  ret.stream = {
    write: function(message, encoding) {
      logger.info(message);
    }
  };

  return ret;
};


/**
 * Expose `logger()`.
 * @param {string} NODE_ENV
 * @return {Logger} logger
 * @api public
 */
export default logger;