import jwt from 'koa-jwt';
import configurator from '../../config/config';

const environment = process.env.NODE_ENV || 'development'
const config = configurator(environment);

/**
 * Sign Token. Generated jwts will include an iat (issued at).
 *
 * @param {Object} Payload
 * @return {String} Encrypted Token
 * @public
 */
function *issueToken(payload) {
  return jwt.sign(
    payload,
    config.secret,
    {
      issuer:   'https://api.degg.com',
      subject: 'degg_token',
      expiresIn: '24h'
    }
  );
}

/**
 * Verify Token.
 *
 * @param {String} token. JWT
 * @return {Object} Decrypted Payload if signature, (and optionally exp, aud, iss) are valid.
 * @public
 */
function *verifyToken(token) {
  try {
    return jwt.verify(
      token,
      config.secret,
      {
        algorithms: ['HS256'],
        issuer:   'https://api.degg.com',
        ignoreExpiration: false,
        subject: 'degg_token'
      }
    );
  } catch(e) {
    return e;
  }
}

/**
 * Decode Token.
 *
 * Warning: use only for trusted messages, otherwise use `verifyToken` Method instead.
 *
 * @param {String} token. JWT
 * @param {Object} opts
 * @return {Object} Payload without validating signature.
 * @public
 */
function *decodeToken(token, opts={ json: true, complete: true}) {
  return jwt.decode(
    token,
    opts
  )
}

/**
 * Expose `Token`
 *
 * @type {Object} JWT Methods
 * @api public
 */
export { issueToken, verifyToken, decodeToken };