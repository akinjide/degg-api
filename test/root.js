const request = require('supertest');
const assert = require('assert');

const app = require('../build/index.js');
const _request = request.agent(app.default.listen());

describe('# v1/', () => {
  context('when present', () => {
    it('should not throw an error', done => {
      _request
        .get('/v1/')
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.current_url, 'https://api.degg.com/v1/');
          assert.equal(res.body.message, 'degg-api ¯\\_(ツ)_/¯');
          done();
        });
    });
  });
});