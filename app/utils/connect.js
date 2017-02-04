import monk from 'monk';
import configurator from '../../config/config';

const environment = process.env.NODE_ENV || 'development'
const config = configurator(environment);

/**
 * connect to mongodb
 *
 * @param {String} mongo uri
 * @param {Object} opts
 * @return {Promise} resolve when the connection is opened
 * @public
 */
const db = (uri = `${config.mongodb.connectionString}`, opts = {}) => monk(uri, opts);

/**
 * Expose `db()`.
 *
 * @return {Connection} db
 * @public
 */
export default db;
