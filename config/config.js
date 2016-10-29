'use strict';

module.exports = {

    mongodb: {
        connectionString: 'localhost/degg_db',
        testConnectionString: 'localhost/test_degg_db'
    },

    ratelimit: {
        max: 1000,
        duration: 60000 
    },

    secret: process.env.secretJwt,

    REDISURL: process.env.REDISURL,
};
