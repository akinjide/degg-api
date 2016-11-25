test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter dot \
		--ui bdd \
		--bail \
		--growl \
		test/*.js

.PHONY: test