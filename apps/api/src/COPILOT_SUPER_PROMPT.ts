/*
SUPER PROMPT: FULL BACKEND SCAFFOLD VIA COPILOT

You are an expert NestJS+Prisma backend engineer.
Project: Arnav Abacus Academy backend.

Requirements (implement all these features except payment gateway):
- Auth: register, login (email+password) with JWT; roles: ADMIN, TEACHER, PARENT.
- Users module: manage users and teachers.
- Students module: CRUD student profiles, assign to batch.
- Levels & Batches: CRUD levels and batches, capacity check on enroll.
- Attendance: bulk POST for batch+date; GET attendance by student and summary percent calc.
- Tests: create tests with subject-level marks (subjects: [{name,obtained,total}]); compute totals and percent; query by student and level.
- Fees/Invoices: create invoice, list invoices, mark invoice paid (manual).
- Reports: endpoints for admin dashboard (counts), student_level_summary (average percent by level).
- File upload: student photos (local upload handler + route) — S3 placeholder in code.
- Notifications: placeholder services to send push/email/SMS (stubs).
- Utilities: percent calculator util, date helpers.

Design constraints:
- Use Prisma Client for DB access (Prisma schema is already present).
- Use DTOs + class-validator for inputs.
- Use NestJS best practices: modules, controllers, services, providers.
- Protect routes with JWT guard; only ADMIN can create batches/levels; TEACHER can mark attendance and tests; PARENT can view their child's data.

Generate code for:
- Modules: auth, users, students, levels, batches, attendance, tests, fees, reports, files, notifications
- For each module generate: module.ts, controller.ts, service.ts, dto files
- Optionally generate basic unit test stubs with Jest.

Also generate README section describing required env variables and commands to run migrations and start dev servers.

Start by scaffolding Auth module (AuthService, AuthController, JwtStrategy, JWT module config), then Users module, then Students, then Attendance, then Tests, then Fees, then Reports.

Output: create files with sensible names and code; if code references packages not installed, list them at the end to install via npm.
*/
