# Running the app in Docker

The Docker image runs the app only. The database lives outside it: **AWS RDS (PostgreSQL 18) in production**, the local `db` container while developing. Receipts go to S3 (see `.env.example`).

## The image

`docker build -t kotila-farm .` makes one image (Node 24 LTS, Next.js standalone) that holds:

| Command | What it does |
| --- | --- |
| `sh docker-start.sh` (default) | Migrates, runs setup (when `FIRST_OWNER_EMAIL` is set), then runs the app on port 3000 |
| `node db-migrate.cjs` | Applies the committed migrations to `DATABASE_URL`, then exits. Safe to run every deploy |
| `node db-setup.cjs` | Adds the first owner (`FIRST_OWNER_*`) and the fixed lists on an empty database, then exits. Safe to run again |
| `node server.js` | Runs the app only |

Both database steps are safe to repeat: migrations already applied are skipped, and setup leaves an existing owner alone. If either fails, the container stops and the app doesn't start. Set `DB_SETUP_ON_START=false` to skip both (for example when running more than one copy of the app, so they don't migrate at the same time).

It also carries Chromium (PDF reports) and Amazon's RDS certificates (`NODE_EXTRA_CA_CERTS`), so `?sslmode=verify-full` to RDS works.

## Settings the container needs

Everything in `.env.example`, given as environment variables (or an env file). For production:

- `DATABASE_URL` — the RDS address with `?sslmode=verify-full`
- `NEXTAUTH_URL` — the public `https://…` address people open
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`, kept secret
- `S3_BUCKET`, `S3_REGION` — leave `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` empty when the task has an IAM role with access to the bucket
- `FIRST_OWNER_NAME`, `FIRST_OWNER_EMAIL`, `FIRST_OWNER_PASSWORD` — the first owner, made on the first start. Once you can sign in, remove them (setup is then skipped; the owner stays)

`INTERNAL_APP_URL` is already set in the image (`http://127.0.0.1:3000`): the PDF printer visits the app inside the container.

## First deploy against RDS

1. Create the RDS PostgreSQL 18 instance and a database named `kotila`; let the app's network reach port 5432.
2. Build and push the image to ECR (or any registry).
3. Run the image with the default command behind HTTPS (Deckhand, App Runner or similar), port 3000, with `FIRST_OWNER_*` set. The first start migrates and makes the owner; the logs say `Made the first owner: …`.
4. Sign in as the first owner and invite everyone else. Then remove `FIRST_OWNER_*`.

Every later deploy: build, push, roll the app. It migrates on start.

The app's host must reach RDS on port 5432: RDS needs **Publicly accessible** when the app runs outside AWS (e.g. Deckhand), and its security group must allow the host's outbound IPs (IPv4; RDS is IPv4-only by default).

## With docker compose

```bash
docker compose --profile app up -d --build  # app against DATABASE_URL (RDS); migrates and sets up on start
docker compose up -d db                       # local Postgres only, for development
```

To run everything locally in containers, also start the `localdb` profile and set `CONTAINER_DATABASE_URL=postgres://kotila:<password>@db:5432/kotila` (inside a container, `localhost` is the container itself).
