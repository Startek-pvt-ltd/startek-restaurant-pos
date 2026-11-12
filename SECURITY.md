# Security and responsible disclosure

This repository describes a restaurant POS application and its isolated demonstration deployment. **Do not file credentials, customer data or live installation details in public issues or pull requests.**

## Reporting

If you discover a security issue, contact the Startek repository maintainers privately through an authenticated company communication channel or GitHub's private vulnerability reporting feature **if enabled**. Do not publish exploit details or proof-of-concept data before the maintainers have had an opportunity to investigate.

Please include affected version/commit, reproduction steps using synthetic data, expected and observed behavior, and likely impact. Never send live database passwords, authentication secrets or customer financial records.

## Deployment requirements

- Unique secrets per environment, least-privilege database roles and TLS for cloud database connections.
- Server-side role checks and revocable sessions for every protected data operation.
- Authenticated, loopback-restricted hardware bridges; cloud hardware commands are disabled.
- Independent database backups and an exercised restore procedure before customer cutover.
- A clean cloud build: **do not package `.env` files**, local backups or private print tokens.
- Verified logs, monitoring and rollback procedures for operational deployment.

## Release and incident status

The v1.0.0 portfolio candidate passed recorded local/staging checks, but GitHub-hosted CI has an account-level billing restriction. A previous staging build artifact incident was remediated, while historical provider access/retention and possible Windows secret reuse remain subject to operator and incident-owner review.

The software release must not be described as production-commissioned until those security decisions and physical printer/cash-drawer acceptance are recorded. See [Release verification](docs/PORTFOLIO_RELEASE.md) and [Architecture](docs/ARCHITECTURE.md).
