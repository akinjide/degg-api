'use strict';

const co = require('co');
const monk = require('monk');
const wrap = require('co-monk');

const configurator = require('../../build/config/config');

const config = configurator.default(process.env.NODE_ENV);
const db = monk(config.mongodb.connectionString);

const _users = wrap(db.get('users'));


exports.removeAll = removeAll;


function removeAll(done) {
  co(function *() {
    yield _users.remove({});
  }).then(done);
}
