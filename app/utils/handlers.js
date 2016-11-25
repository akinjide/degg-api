import 'babel-polyfill';

const domain = 'https://api.degg.com';

/**
 *
 * success Handler
 *
 * Expose response default.
 *
 * @param {String} path
 * @param {String} message
 * @param {Integer} code
 * @return {Object}
 * @public
 */
function *success(path, message, code) {
  const current_url = `${domain}${path}`;

  return { current_url, message, code };
}

/**
 *
 * error Handler
 *
 * Expose response default.
 *
 * @param {String} path
 * @param {String} type
 * @param {String} message
 * @param {Integer} code
 * @return {Object}
 * @public
 */
function *error(path, type, message = `Ooops! Request URL does not exist!`, code=404) {
  const current_url = `${domain}${path}`;

  return { error: { current_url, message, type, code } };
}

/**
 * Expose `Handler`
 *
 * @type {Object} Handler Methods
 * @api public
 */
export { success, error };