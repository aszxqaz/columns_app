down:
	docker compose down

up:
	docker compose up -d

gen:
	npx prisma db pull
	prisma-case-format -f ./prisma/schema.prisma \
		--map-table-case=snake,plural \
		--table-case=pascal,singular \
		--field-case=camel,singular \
		--enum-case=pascal \
		--map-enum-case=snake,singular \
		--pluralize
	npx prisma generate