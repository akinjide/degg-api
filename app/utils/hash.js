import 'babel-polyfill';
import bcrypt from 'co-bcryptjs';

class Hash {
  constructor() {}

  /**
   * Hash Password
   *
   * @param {String} password
   * @return {Array} Salt and Encrypted Password
   * @public static
   */
  static *hashPassword (password) {
    const salt = yield bcrypt.genSalt(10);
    const hash = yield bcrypt.hash(password, salt);

    return [ salt, hash ];
  }

  /**
   * Compare Password
   *
   * @param {String} password
   * @param {String} Encrypted password
   * @return {Boolean}
   * @public static
   */
  static *isPassword (password, hash) {
    return yield bcrypt.compare(password, hash);
  }
}

/**
 * Expose `Hash`
 *
 * @type {Object} Hash Class
 * @api public
 */
export default Hash;