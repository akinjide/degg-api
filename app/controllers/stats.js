import 'babel-polyfill';
import _ from 'lodash';
import os from 'os';
import fs from 'fs';
import co from 'co';

import fsWrap from '../utils/fs-wrap';
import * as Handler from '../utils/handlers';
import {
  default as HTTPStatus,
  code as HTTPCode
} from '../utils/http-status';


/**
 * GET stats.
 */

export function *stats() {
  var fn = co.wrap(function *() {
    try {
      return yield {
        Hostname: os.hostname(),
        averageLoad: os.loadavg(),
        CPUs: os.cpus(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        upTime: os.uptime(),
        Architecture: os.arch(),
        Release: os.release(),
        Type: os.type(),
        Platform: os.platform(),
        Health: 'Good'
      }
    } catch(e) {
      this.status = e.status || HTTPStatus.INTERNAL_SERVER_ERROR;
      logger.error(e);
      this.body = _.merge(yield* Handler.error(this.route.path, this.message, e, this.status), { system: { Health: 'Critical' } });
    }
  });

  this.status = HTTPStatus.OK;
  this.body = _.merge(yield* Handler.success(this.route.path, this.message, this.status), { system: yield fn() });
}

/**
 * GET logs.
 */

export function *logs() {
  this.status = HTTPStatus.OK;
  const isLogAvailable = yield fsWrap.exists('server.log');

  if (isLogAvailable) {
    this.body = fs.createReadStream('server.log');
  } else {
    this.body = yield* Handler.success(this.route.path, 'No log yet! :)', this.status);
  }
}
