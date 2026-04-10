# Stats Backend

Built with Express API and MySQL in a consitent containerized docker.

## Getting Started

1. Copy `.env.example` to `.env` and adjust values. **Do not leave
   `DB_USER` set to `root`**; the MySQL image will reject it. Choose a
   distinct application user or leave the file unchanged to use the
   preconfigured `statsuser`.

```bash
cp .env.example .env
# then edit .env if you need different credentials
```

2. Build and start containers:

```bash
docker-compose up --build
```

3. API will be available at `http://localhost:3000`.

## Database

The MySQL service exposes port 3306. Use the credentials from `.env`.

### Schema management (migrations)

Instead of manually creating tables, we use **Knex** for migrations, which
mirrors how production teams manage schema changes.

- migrations live in `migrations/` and are run in lexicographic order based on
  their filename prefix (timestamps or numbers).
- `npm run migrate` executes any files that haven't yet been applied; Knex
  records completed migrations in the `knex_migrations` table.
- On startup the server automatically runs pending migrations before listening.

The initial migration creates the `players` table; you can add more as
features grow.

#### Adding new tables or columns

1. Generate a new migration with a descriptive name, e.g.:
   ```bash
   npx knex migrate:make add_scores_column
   # or create your own filename, e.g. 20260308_add_scores_column.js
   ```
2. Edit the generated file inside `migrations/` with `exports.up`/`exports.down`.
   Here’s an example that adds a `level` column to `players`:

   ```js
   exports.up = (knex) =>
     knex.schema.table('players', (table) => {
       table.integer('level').defaultTo(1);
     });

   exports.down = (knex) =>
     knex.schema.table('players', (table) => {
       table.dropColumn('level');
     });
   ```

3. Apply the new migration either manually (`npm run migrate`) or let the
   server run it on next start. Repeat for each schema change.

### Running migrations manually

```bash
npm install        # first time only
npm run migrate
```

## Development

Install dependencies locally for dev:

```bash
npm install
npm run dev
```
