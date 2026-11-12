# Engineering documentation

This directory contains the project specification, implementation notes, operating procedures and release evidence for Startek Restaurant POS. Documents in the engineering-history section describe earlier milestones and may not reflect the current code; the current README, architecture and release record take precedence.

## Start here

| Document | Purpose |
| --- | --- |
| [Project overview](../README.md) | Product scope, demo media, setup and status |
| [Architecture](ARCHITECTURE.md) | System components, trust boundaries and deployment design |
| [Current feature scope](PROJECT.md) | Approved modules and explicitly excluded features |
| [Database](DATABASE.md) | Prisma schema, migrations and transactional behavior |
| [API and access control](API.md) | Auth.js, HTTP endpoints, server actions and authorization |
| [UI guide](UI_GUIDE.md) | Responsive layout and receipt rules |

## Deployment and operations

| Document | Purpose |
| --- | --- |
| [Deployment](DEPLOYMENT.md) | Workstation and cloud deployment considerations |
| [Installation](RICE_KOTTU_HUT_INSTALLATION.md) | Local restaurant workstation procedure |
| [Thermal printer guide](windows-thermal-printer.md) | Local Windows ESC/POS setup |
| [Printer acceptance checklist](PRINTER_ACCEPTANCE_CHECKLIST.md) | On-site printer, cutter and drawer sign-off |
| [Backup and restore](BACKUP_RESTORE_GUIDE.md) | Recovery safeguards and operator procedures |
| [Data exports](DATA_EXPORT_GUIDE.md) | Export permissions, formats and data exclusions |
| [Support](SUPPORT.md) | Ongoing maintenance guidance |
| [Staff training](STAFF_TRAINING_GUIDE.md) | Cashier and management training |

## Portfolio and quality evidence

| Document | Purpose |
| --- | --- |
| [Release verification](PORTFOLIO_RELEASE.md) | Executed tests and open external gates |
| [Case study](PORTFOLIO_CASE_STUDY.md) | Problem, design, engineering decisions and outcomes |
| [Screenshots and video](portfolio/README.md) | Synthetic demonstration assets |
| [Recorded demo guide](PORTFOLIO_WALKTHROUGH.md) | Reproducible walkthrough narrative |
| [Client publication approval](PORTFOLIO_PUBLICATION_APPROVAL.md) | Authorization checklist; **not** evidence of consent |
| [UAT](RICE_KOTTU_HUT_UAT.md) | Restaurant-side acceptance template |

## Engineering history

Earlier project milestones, task notes, stabilization reports and prior QA results are retained for traceability: [Milestones](MILESTONES.md), [Tasks](TASKS.md), [Tasks archive](Tasks/), [Bug fix report](BUG_FIX_REPORT.md), [QA checklist](QA_CHECKLIST.md), [Menu variants](MENU_VARIANTS.md), and [Roadmap](ROADMAP.md).

Avoid treating historical test results as evidence for the latest release; consult [Release verification](PORTFOLIO_RELEASE.md).
