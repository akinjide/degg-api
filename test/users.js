import co from 'co';
import users from './userRoutes';
import app from './index.js';
import request from 'supertest';

const _request = request.agent(app.listen());
const _users = users;

describe('User API', () => {
	const seed = {
		name: 'Marcus',
		city: 'Bandung, Indonesia'
	};

	it('should create a user', (done) => {
		_request
			.post('/user')
			.send(seed)
			.expect(200, done)
	});

});
