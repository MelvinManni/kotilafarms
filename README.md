# Kotila Farm — internal tool

Handoff repo for building the Kotila Farm management app with Claude Code.

## Start

1. Put this folder in a new git repo and open it in Claude Code (locally, or in the dev container: *Reopen in Container*).
2. Tell Claude Code: **"Read AGENTS.md, then start docs/10-build-plan.md at P0.1."**
3. Review each task's change-log entry in `AGENTS.md` as it lands.

## What's here

| Path | What |
| --- | --- |
| `AGENTS.md` | Rules for agents, stack, version policy, folder layout, commands, and the change log |
| `CLAUDE.md` | Points Claude Code at AGENTS.md |
| `docs/01-product-spec.md` | The full feature spec |
| `docs/02-architecture.md` … `docs/07-offline-sync.md` | How it is built: architecture, data model, API, auth and roles, client data, offline |
| `docs/08-design-system.md` | How to apply the Kotila Farm Ledger design system with shadcn + Base UI + Tailwind |
| `docs/09-screens.md` | Every screen: route, role, data, components, acceptance criteria |
| `docs/10-build-plan.md` | Ordered tasks P0 → P3 |
| `docs/11-versions.md` | Version log (observed at handoff; re-verify) |
| `docs/12-seed-data.md` | Reference farm numbers for test fixtures (never loaded into the database) |
| `design/` | Tokens, Tailwind v4 theme, reference React components, brand book, logos, screen designs |
| `Dockerfile`, `docker-compose.yml`, `.devcontainer/` | Container setup; running the app in Docker against AWS RDS is in `docs/13-deploy.md` |
