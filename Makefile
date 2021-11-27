.DEFAULT_GOAL := build
.PHONY: build

BIN := ./node_modules/.bin

JEST = $(BIN)/jest
NEST = $(BIN)/nest
TS_NODE = $(BIN)/ts-node

TYPEORM = ./node_modules/typeorm/cli.js
ORM_CONFIG = ./src/ormconfig.ts

build:
	$(NEST) build

test-debug:
	node \
		--inspect-brk \
		-r tsconfig-paths/register \
		-r ts-node/register \
		$(JEST) \
		--runInBand

migrations-create:
	$(TS_NODE) \
		-r tsconfig-paths/register \
		$(TYPEORM) \
		--config src/ormconfig.ts \
		migration:create -- -n

migrations-run:
	$(TS_NODE) \
		-r tsconfig-paths/register \
		$(TYPEORM) \
		--config $(ORM_CONFIG) \
		migration:run