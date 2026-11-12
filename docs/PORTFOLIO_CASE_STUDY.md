# Rice & Kottu Hut Restaurant POS

Startek (PVT) LTD developed this application to bring order entry, menu updates, expense tracking, and transaction reporting into a single restaurant workspace. The operator can select dishes and sizes, record the tender, and open an 80 mm receipt from the saved order. Management can reconcile orders, payments and expenses and export business records for further review.

## Design and implementation

The interface retains the restaurant’s gold and brown palette and the POS cart layout. The catalog uses responsive cards, while order and report views use filters and tables. The portfolio audit removed an inactive search field and replaced mock dashboard lists with PostgreSQL queries and explicit empty states.

The application uses Next.js, React and TypeScript, with PostgreSQL accessed through Prisma. Auth.js handles sign-in. The proxy checks the session token early, while server operations verify the active account and its role. Checkout looks up the current menu prices, records the order and tender in one transaction, and uses a unique token to recognize retries. The receipt snapshot preserves the item name, variant, quantity and prices for new lines even if the catalog changes.

## Release challenges

The local installation and Netlify have different storage and hardware boundaries. Local backup files and printer bridge commands stay on the workstation. Netlify serves the browser interface through Edge and Node.js functions with pooled Neon connections. Cloud builds reject local dotenv files, and release artifacts are checked before deployment. Exports escape formula-like text in CSV, while Excel exports store those values as text.

## Verification and outcome

The release suite combines unit checks with browser tests on disposable synthetic PostgreSQL data. The browser suite covers role login, menu category and expense creation, cash/card/QR checkout, concurrent duplicate submission, order history, receipt stability after a menu rename, exports, session deactivation and local backup. The release report records the results, the staging recovery rehearsal, and which operations still require separate acceptance. [Release verification](PORTFOLIO_RELEASE.md)

This project demonstrates a complete order-to-receipt workflow and the release engineering needed to operate it on both a workstation and isolated cloud staging. Portfolio media uses synthetic records. No customer financial outcomes, production commissioning or hardware test results are claimed.
