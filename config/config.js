import path from 'path';
import { _extend as extend } from 'util';

import production from './env/production';
import development from './env/development';
import test from './env/test';

const defaults = {
  root: path.normalize(__dirname + '/..'),

  ratelimit: {
    max: 1000,
    duration: 60000
  },

  secret: 'degg-secret' || process.env.secretJwt,

  REDISURL: process.env.REDISURL
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