import path from 'path';
import { _extend as extend } from 'util';

import production from './env/production';
import development from './env/development';
import test from './env/test';

const defaults = {
  root: path.normalize(__dirname + '/..'),

  ratelimit: {
    max: process.env.redisMax || 1000,
    duration: process.env.redisDuration || 60000
  },

  secret: process.env.secretJwt || 'degg-secret',

  secretKeys: [
    process.env.secretKey || 'i like turtle',
    process.env.secretJwt || 'im a newer secret'
  ],

  REDISURL: process.env.REDIS_URL
};

const configurator = environment => {
  switch (environment) {
    case 'production':
      return extend(production, defaults);
      break;
    case 'test':
      return extend(test, defaults);
      break;
    default:
      return extend(development, defaults);
  }
};

export default configurator;
