const co = require('co');
const db = require('../build/app/utils/connect');
const wrap = require('co-monk');
const request = require('supertest');
const assert = require('assert');

const app = require('../build/index.js');
const _request = request.agent(app.default.listen());

describe('User', () => {
	const _users = wrap(db.default.get('users'));
	const seed = {
		name: 'Degg',
		city: 'Bandung, Indonesia'
	};

	const removeAll = done => {
		co.wrap(function *() {
			yield _users.remove({});
		})(done);
	}

	context('POST /users', () => {
		after(done => {
			removeAll(done);
			done();
		});

		it('should create a user', done => {
			_request
				.post('/v1/users')
				.send(seed)
				.expect('location', /^\/user\/[0-9a-fA-F]{24}$/)
				.expect(201, done);
		});
	});

	context('GET /users', () => {
		before(done => {		
			_request
				.post('/v1/users')
				.send(seed)
				.end(done);
		});

		after(done => {
			removeAll(done);
			done();
		});

		it('should retrieve all users', done => {
			_request
				.get('/v1/users')
				.expect(200)
				.end((err, res) => {
					res.body.users.length.should.equal(1);
					res.body.users[0].name.should.eql(seed.name);
					done();
				});
		});

		// it('should get user', done => {
		// 	co.wrap(function *() {
		// 		const user = yield _users.insert(seed);
		// 		const url = '/user/' + user._id;

		// 		_request
		// 			.get(url)
		// 			.set('Accept', 'application/json')
		// 			.expect('Content-Type', /json/)
		// 			.expect(/Degg/)
		// 			.expect(200, done);
		// 	})();
		// });
	});
});