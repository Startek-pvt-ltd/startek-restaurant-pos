# Database

PostgreSQL is accessed through Prisma ORM. Connection settings belong in `DATABASE_URL`; never commit credentials. The schema currently contains no business models by design.

After changing `prisma/schema.prisma`, run `npm run prisma:generate`. Once models are approved, use `npm run prisma:migrate` to create development migrations.
