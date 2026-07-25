# Project

Startek Restaurant POS is the restaurant management platform for Rice & Kottu Hut. The application includes a maintainable Next.js foundation, PostgreSQL persistence, and Auth.js credential authentication with role-based access control. Operational modules will be implemented in future phases.

## Authentication

- Active users can authenticate with either username or email and a bcrypt-protected password.
- Auth.js stores an encrypted JWT session in a secure, HTTP-only cookie. Sessions last eight hours by default or 30 days when the user explicitly selects remember me.
- Protected server code uses `requireAuth`, `requireRole`, and `hasRole` from `src/lib/auth-utils.ts`.
- Successful login and logout events are written to `ActivityLog` when database logging is available.
- `/dashboard` requires authentication, while signed-in users are redirected away from `/login`.

## Stakeholders

- Client: Rice & Kottu Hut, No.32, Padukka Road, Meegoda
- Contact: 0777250493 / 0778375427
- Developer: Startek (PVT) LTD
- Version: 1.0.0
