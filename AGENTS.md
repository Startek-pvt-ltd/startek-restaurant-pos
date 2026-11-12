# Engineering guidance — Startek Restaurant POS

This repository contains an existing restaurant POS implementation owned and
maintained by Startek (PVT) LTD. Preserve approved order, payment, reporting,
authentication and receipt behavior unless a change is justified by a verified
defect or agreed product requirement.

- Use Node.js 22 and npm with the checked-in lockfile.
- Consult the installed Next.js version documentation for framework-specific
  changes. Do not assume APIs from an older Next.js release apply here.
- Keep validation and authorization in server actions/services, not only in UI.
- Use additive, reviewed Prisma migrations. Never reset or reseed customer data.
- Maintain checkout idempotency, unique invoice constraints and historical
  receipt snapshots.
- Keep local workstation hardware capabilities separate from Netlify staging.
  Never enable unattended printer or cash-drawer commands in cloud builds.
- Never commit .env files, credentials, backup dumps, private print tokens,
  customer orders or live staff records.
- Test against isolated synthetic data; run lint, TypeScript, unit tests, Prisma
  validation, and the full browser suite for affected business workflows.
- Keep README, docs/ARCHITECTURE.md, docs/PORTFOLIO_RELEASE.md and demo
  screenshots consistent with verified functionality and release status.
- Do not merge a security-held release or commission customer production
  without explicit authorization and outstanding acceptance evidence.
