# API

Auth.js exposes its standard GET and POST handlers at `/api/auth/[...nextauth]`. These handlers provide CSRF-protected credential sign-in, JWT session inspection, and sign-out. They must be accessed through Auth.js clients rather than called with unvalidated application data.

No business API endpoints are included yet. Future endpoints should live in App Router route handlers, validate inputs with Zod, call `requireAuth` or `requireRole`, keep business logic in feature services, and return consistent typed error responses.
