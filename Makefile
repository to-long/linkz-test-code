.PHONY: i install up down dev dev-be dev-fe stripe migrate seed setup lint format kill openapi-gen storybook test test-unit test-e2e test-concurrency

i: install
install:
	bun install

up:
	docker compose up -d

down:
	docker compose down

dev: up
	bun run dev

stripe:
	docker compose logs -f stripe-cli

dev-be:
	bun run dev:be

dev-fe:
	bun run dev:fe

migrate:
	cd apps/be && bun run db:migrate

seed:
	cd apps/be && bun run db:seed

setup: install up migrate seed

lint:
	bunx biome check .

format:
	bunx biome format --write .

kill:
	-lsof -ti:8081 | xargs kill -9 2>/dev/null
	-lsof -ti:3031 | xargs kill -9 2>/dev/null

openapi-gen:
	bun run openapi-gen

storybook:
	cd apps/fe && bunx storybook dev -p 6006

test: test-unit

test-unit:
	cd packages/shared && bun test
	cd apps/fe && bun test src/__tests__
	cd apps/be && bun test

test-e2e:
	cd apps/be && bun test src/__tests__/api.test.ts

test-concurrency:
	cd apps/be && bun test src/__tests__/concurrency.test.ts
