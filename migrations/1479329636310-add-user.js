'use strict'

const db = require('../build/app/utils/connect').default();
const collection = 'users';

exports.up = function(next) {
  db.create(collection, {
    validator: { $or:
      [
        { username:
          {
            $type: 'string',
            $exists: true
          }
        },
        { firstname: { $type: 'string' } },
        { lastname: { $type: 'string' } },
        { phone: { $type: 'string' } },
        { email:
          {
            $type: 'string',
            $exists: true,
            $regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
          }
        },
        { city: { $type: 'string' } },
        { password:
          {
            $type: 'string',
            $exists: true
          }
        },
        { salt: { $type: 'string' } }
      ]
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });
  next();
};

exports.down = function(next) {
  db.get(collection)
    .drop(next);
};
