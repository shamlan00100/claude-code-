# Impeccable (vendored, modified)

Source: https://github.com/pbakaus/impeccable (commit e0881d2de397d5e9761d7b35ff5017d8f5ebf69b),
Apache License 2.0 (see LICENSE). Copyright its authors.

Modifications for Focus PT:

- Only `SKILL.md` and the text references in `reference/` are included. The launcher,
  compiled engine, Claude Code hooks, sub-agents and live-browser scripts are not.
- `SKILL.md` setup reads `CLAUDE.md` and `DESIGN.md` directly instead of running the
  launcher, states that those files win on any conflict, and drops the `live`,
  `generate`, pin, hooks and doctor commands that depend on the removed tooling.
- `reference/live.md`, `live-setup.md`, `generate.md`, `hooks.md` and `doctor.md` are
  omitted for the same reason.
