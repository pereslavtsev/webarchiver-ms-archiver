test-debug:
	node \
		--inspect-brk \
		-r tsconfig-paths/register \
		-r ts-node/register node_modules/.bin/jest \
		--runInBand