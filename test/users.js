'use strict';

const co = require('co');
const monk = require('monk');
const wrap = require('co-monk');
const request = require('supertest');
const assert = require('assert');
const moment = require('moment');
const _ = require('lodash');

const app = require('../build/index.js');
const configurator = require('../build/config/config');

const config = configurator.default(process.env.NODE_ENV);
const _request = request.agent(app.default.listen());
const db = monk(config.mongodb.testConnectionString);

const helpers = require('./helpers/clean');
const seed = require('./helpers/seed').seed;


describe('User', () => {
	const _users = wrap(db.get('users'));

	context('POST /users', () => {
		after(done => {
	    helpers.removeAll(done);
		});

		it('should create a user', done => {
			_request
				.post('/v1/users')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.token}`)
				.send(seed)
        .expect('Content-Type', /json/)
				.expect(201)
				.expect('location', /^\/user\/[0-9a-fA-F]{24}$/)
				.end((err, res) => {
					res.body.current_url.should.equal('https://api.degg.com/v1/users');
					done();
				});
		});

		it('should fail with validation error for users without name', done => {
			seed.name = null;

			_request
				.post('/v1/users')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${process.env.token}`)
				.send(seed)
        .expect('Content-Type', /json/)
				.expect(403)
				.end((err, res) => {
					res.body.error.type.should.equal('Forbidden');
					res.body.error.message['.name'].should.equal('is required');
					done();
				});
		});
	});


	context('GET /users', () => {
		before(done => {
	    const newseed = _.assign({}, seed);
	    newseed.name = 'Degg';

			co(function *() {
				const user = yield _users.insert(newseed);
			}).then(done);
		});

		after(done => {
	    helpers.removeAll(done);
	    seed.name = 'Degg';
		});

		it('should retrieve all users', done => {
			_request
				.get('/v1/users')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${process.env.token}`)
				.expect(200)
				.end((err, res) => {
					res.body.users.length.should.equal(1);
					res.body.users[0].name.should.eql('Degg');
					done();
				});
		});

		it('should retrieve all users with specified fields', done => {
			_request
				.get('/v1/users?fields=city,username')
        .expect('Content-Type', /json/)
        .set('Authorization', `Bearer ${process.env.token}`)
				.expect(200)
				.end((err, res) => {
					res.body.users[0].username.should.eql(seed.username);
					res.body.users[0].city.should.eql(seed.city);
					done();
				});
		});

		it('should get user by Id', done => {
			co(function *(done) {
        seed.name = 'Degg';
				const user = yield _users.insert(seed);
				const url = '/v1/users/' + user._id;
        return url;
			}).then(url => {
        _request
          .get(url)
          .expect('Content-Type', /json/)
          .set('Authorization', `Bearer ${process.env.token}`)
          .expect(200)
          .expect(/Degg/)
          .end((err, res) => {
            res.body.user.name.should.eql(seed.name);
            res.body.user.email.should.eql(seed.email);
            done();
          })
      });
		});

    it('should get user by Id with specified fields', done => {
      co(function *(done) {
        const user = yield _users.find({ name: seed.name });
        const url = '/v1/users/' + user[0]._id + '?fields=name,city';
        return url;
      }).then(url => {
        _request
          .get(url)
          .expect('Content-Type', /json/)
          .set('Authorization', `Bearer ${process.env.token}`)
          .expect(200)
          .expect(/Degg/)
          .end((err, res) => {
            res.body.user.name.should.eql(seed.name);
            res.body.user.city.should.eql(seed.city);
            done();
          });
      });
    });
	});


	context.skip('PUT /users', () => {
		let url;

		before(done => {
			_request
				.post('/v1/users')
        .set('Content-Type', 'application/json')
				.send(seed)
				.end((err, res) => {
					url = res.header.location;
					console.log(url, res.body)
					done();
				});
		});

		after(done => {
	    helpers.removeAll(done);
		});

		it('should update existing user', done => {
			const id = _.split(url, '/')[2];
			console.log(id, 'update')

			_request
				.put(`/v1/users/${id}`)
        .set('Content-Type', 'application/json')
				.send({ name: 'new Degg', city: 'New York, NY' })
				.expect('Content-Type', /json/)
				.expect(204)
				// .expect('location', url)
				// .expect(/new Degg/)
				.end((err, res) => {
					console.log(res.body, 'yeet');
					done();
				});
		});
	});


	// context('DELETE /users', () => {
	// 	// seed = {
	// 	// 	name: 'Degg',
	// 	// 	city: 'Bandung, Indonesia'
	// 	// };

	// 	before(done => {
	//     helpers.removeAll(done);
	// 	});

	// 	after(done => {
	//     helpers.removeAll(done);
	// 	});

	// 	it('should update existing user', done => {
	// 		co.wrap(function *() {
	// 			const user = yield _users.insert(seed);
	// 			const url = '/v1/users/' + user._id;

	// 			_request
	// 				.delete(url)
	// 				.expect(200, done)
	// 		})();
	// 	});
	// });
});
