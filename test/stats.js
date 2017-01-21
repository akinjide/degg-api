'use strict';

const request = require('supertest');
const assert = require('assert');

const app = require('../build/index.js');
const configurator = require('../build/config/config');

const _request = request.agent(app.default.listen());

describe('Stats', () => {
  context('GET /stats', () => {
    it('should respond with system stats', done => {
      _request
        .get('/v1/stats')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${process.env.token}`)
        .expect(200)
        .end((err, res) => {
          res.body.current_url.should.equal('https://api.degg.com/v1/stats');
          res.body.system.Health.should.equal('Good');
          done();
        });
    });

    it('should respond with server logs', done => {
      _request
        .get('/v1/stats/logs')
        .set('Authorization', `Bearer ${process.env.token}`)
        .expect(200)
        .expect('Content-Type', /octet-stream/)
        .end(done);
    });
  });
});
