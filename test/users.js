'use strict';

process.env.NODE_ENV = 'test'

const co = require('co');
const monk = require('monk');
const wrap = require('co-monk');
const request = require('supertest');
const assert = require('assert');
const moment = require('moment');
const _  = require('lodash');

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
				.send(seed)
        .expect('Content-Type', /json/)
				.expect('location', /^\/user\/[0-9a-fA-F]{24}$/)
				.expect(201)
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
				.send(seed)
				.expect(403)
        .expect('Content-Type', /json/)
				.end((err, res) => {
					res.body.error.type.should.equal('Forbidden');
					res.body.error.message['.name'].should.equal('is required');
					done();
				});
		});
	});


	context('GET /users', () => {
		before((done) => {
	    const newseed = _.assign({}, seed);
	    newseed.name = 'Degg';

			co(function *() {
				const user = yield _users.insert(newseed);
			}).then(done);
		});

		after(done => {
	    helpers.removeAll(done);
		});

		it('should retrieve all users', done => {
			_request
				.get('/v1/users')
				.expect(200)
        .expect('Content-Type', /json/)
				.end((err, res) => {
					res.body.users.length.should.equal(1);
					res.body.users[0].name.should.eql('Degg');
					done();
				});
		});

		it.skip('should retrieve all users with username, city fields', done => {
			_request
				.get('/v1/users?fields=name,username,password,salt')
				.expect(200)
        .expect('Content-Type', /json/)
				.end((err, res) => {
					res.body.users.length.should.equal(1);
					res.body.users[0].name.should.eql(seed.name);
					done();
				});
		});

		it('should get user', done => {
			co(function *() {
				const user = yield _users.insert(seed);
				const url = '/v1/users/' + user._id;

				_request
					.get(url)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(/Degg/)
					.expect(200)
					.end((err, res) => {
						res.body.user.name.should.eql(seed.name);
						res.body.user.username.should.eql(seed.dg);
						done();
					})
			}).then(done);
		});
	});


	// context('PUT /users', () => {
	// 	// seed = {
	// 	// 	name: 'Degg',
	// 	// 	city: 'Bandung, Indonesia',
	// 	// 	added_at: moment()
	// 	// };

	// 	before(done => {
	// 		removeAll(done);
	// 		done();
	// 	});

	// 	it('should update existing user', done => {
	// 		co.wrap(function *() {
	// 			const user = yield _users.insert(seed);
	// 			const url = '/v1/users/' + user._id;

	// 			_request
	// 				.put(url)
	// 				.send({ name: 'new Degg', city: 'New York, NY' })
	// 				.expect('location', url)
	// 				.expect(/new Degg/)
	// 				.expect(204, done)
	// 		})();
	// 	});
	// });


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