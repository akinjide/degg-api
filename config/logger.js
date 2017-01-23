import _ from 'lodash';
import winston from 'winston';
import 'winston-loggly-bulk';

import configurator from '../config/config';

winston.emitErrs = true;

const { inputToken, subdomain } = configurator(process.env.NODE_ENV);
const logglyCredentials = { inputToken, subdomain };


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

  return new winston.transports[type](_.assign({}, defaultConfig(confOpts), opts));
}


const logger = (env) => {
  let ret;

  if (env === 'production') {
    ret = new winston.Logger({
      transports: [
        getWinstonConfig('Console', { level: 'error' }),
        getWinstonConfig('File', { level: 'info', json: true }, { maxFiles: 100 }),
        getWinstonConfig('Loggly', { level: 'info', json: true },
          _.assign({}, logglyCredentials, {
          tags: ["degg-production"]
        }))
      ],
      exitOnError: false
    });
  } else if (env === 'development') {
    ret = new winston.Logger({
      transports: [
        getWinstonConfig('Console'),
        getWinstonConfig('File', { level: 'info', json: true }, { maxFiles: 5, colorize: false }),
        getWinstonConfig('Loggly', { level: 'info', json: true },
          _.assign({}, logglyCredentials, {
          tags: ["degg-development"]
        }))
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