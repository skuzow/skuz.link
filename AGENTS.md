# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues on `skuzow/skuz.link` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Layers

Read ADR-0001 and ADR-0004 in `docs/adr/` before adding a file or an import. Code lives in the `base`, `auth` or `links` Nuxt layer, and root is the composition shell. Imports point `root → links → auth → base`, and `pnpm lint` fails on an import against that direction. Auto-imported components and composables cross layers without an import, so check those by hand.

## Testing

Read `docs/agents/testing.md` before writing a test or test helper, and when a server test fails on an undefined auto-import.
