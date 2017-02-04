'use strict';

const request = require('supertest');
const assert = require('assert');

const app = require('../build/index.js');
const _request = request.agent(app.default.listen());

const helpers = require('./helpers/clean');
const seed = require('./helpers/seed').seed;


describe('Root', () => {
  before(done => {
    _request
      .post('/v1/register')
      .send(seed)
      .end(done);
  });

  after(done => {
    helpers.removeAll(done);
  });

  context('# v1/', () => {
    it('should throw an error without TOKEN', done => {
      _request
        .get('/v1/')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          assert.equal(res.headers.status, '401 Unauthorized');
          assert.equal(res.body.error.current_url, 'https://api.degg.com/v1/');
          assert.equal(res.body.error.message, 'Invalid token\n');
          assert.equal(res.body.error.type, 'Protected resource, use Authorization header to get access.');
          done();
        });
    });

    it('should authenticate an existing user', done => {
      _request
        .post('/v1/authenticate')
        .set('Content-Type', 'application/json')
        .send({ username: 'deggstar', password: 'password$'})
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          process.env.token = res.body.access_token;

          assert.equal(res.body.token_type, 'bearer');
          assert.equal(res.body.current_url, 'https://api.degg.com/v1/authenticate');
          done();
        });
    });

    it('should throw an error INVALID TOKEN', done => {
      _request
        .get('/v1/')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer invalid${process.env.token}`)
        .expect(401)
        .end((err, res) => {
          assert.equal(res.headers.status, '401 Unauthorized');
          assert.equal(res.body.error.current_url, 'https://api.degg.com/v1/');
          assert.equal(res.body.error.message, 'Invalid token\n');
          assert.equal(res.body.error.type, 'Protected resource, use Authorization header to get access.');
          done();
        });
    });

    it('should not throw an error', done => {
      _request
        .get('/v1/')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${process.env.token}`)
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.current_url, 'https://api.degg.com/v1/');
          assert.equal(res.body.message, 'degg-api ¯\\_(ツ)_/¯');
          done();
        });
    });
  });
});
