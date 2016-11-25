'use strict'

const db = require('../build/app/utils/connect').default();
const collection = 'users';

exports.up = function(next) {
  db.get(collection)
    .index({
      username: 1,
      firstname: 1
    },
    {
      unqiue: true,
      background: true,
      w: 1
    });

    db.get(collection)
      .indexes(next);
};

exports.down = function(next) {
  db.get(collection)
    .dropIndexes(next);
};
