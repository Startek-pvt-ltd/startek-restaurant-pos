# Changelog

Meaningful changes to Startek Restaurant POS are documented here. Version 1.1.0 is the current released software baseline on `main`; the original v1.0.0 tag from July 2026 is retained. The Netlify public site remains an isolated synthetic-data environment; customer-site commissioning evidence is maintained separately.

## [1.1.0] — 2026-11-12

### Application
- Implemented and verified core restaurant billing, menu, orders, staff, expenses, reporting and 80 mm receipts.
- Added server-priced and transaction-protected checkout, including duplicate-submission handling.
- Preserved new order-line names in receipt and export history.
- Replaced presentation-only dashboard content with bounded PostgreSQL queries.
- Hardened report exports against spreadsheet formula interpretation.
- Fixed an expense dialog initialization race found during isolated browser testing.

### Release engineering
- Added Netlify-compatible authentication/Node runtime separation and bounded Neon database connections for staging.
- Added isolated PostgreSQL browser verification and GitHub Actions workflow definition.
- Executed a synthetic database backup/restore rehearsal and artifact screening.
- Recorded portfolio case study, demonstration media, architecture and quality evidence.

### Outstanding
- GitHub-hosted CI cannot start until the account-level billing restriction is resolved.
- Windows credential-reuse and historical Netlify artifact-access review require incident-owner disposition.
- Physical Windows printer, cutter, drawer and live failover have not been accepted.
- PR #1 was squash-merged into `main` as `5839447`. The project owner reports successful customer-site functional verification. External incident, consent and operational follow-ups are documented in the release report.

See [release verification](docs/PORTFOLIO_RELEASE.md) for evidence and the current security gate.

## [1.0.0] — 2026-07-27

- Original restaurant POS workstation baseline, retained at Git tag `v1.0.0` (commit `c476279`).
