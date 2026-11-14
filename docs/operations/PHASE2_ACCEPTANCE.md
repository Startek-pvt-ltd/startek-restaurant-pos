# Phase 2.3-2.8 integrated hardening acceptance matrix

All proposed changes remain NONPRODUCTION until an approved release gate.

| Workstream | Acceptance evidence | Release gate |
|---|---|---|
| 2.3 Recovery | Exact production DB identity; encrypted offsite dump; isolated restore and checksum | BLOCKED until live endpoint identified |
| 2.4 Login | Canonical-account plus optional trusted-IP PostgreSQL throttle; unit and disposable SQL integration tests | Requires production backup, migration review, preview header verification and incident unlock playbook |
| 2.5 Headers | Static checks, Next.js build and browser QA across receipt/login | Enforce strict CSP only after nonce plan |
| 2.6 Monitoring | Correlation IDs, redacted error logging, monitored readiness and alerts | External monitor not configured |
| 2.7 Quality | lint, TS, unit, isolated migrations, E2E checkout, cloud build | All checks pass before merge |
| 2.8 Docs | Architecture, threat model, recovery, monitoring and release record | Match released code, not aspirational changes |

Never claim Cloud Production database backup from a localhost PostgreSQL
backup, a staging snapshot, or a successful health endpoint. Never promote a
recovery branch to default except through an approved recovery plan.
