'use strict'

const db = require('../build/app/utils/connect').default();

exports.up = function(next) {
  db;
  next();
};

exports.down = function(next) {
  db.close(next);
};
