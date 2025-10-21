/*
AI SCOFFOLD PROMPT — DO NOT DELETE
Purpose: Use GitHub Copilot to generate NestJS modules, controllers, services, DTOs, and Prisma integration.

Project goals:
- Implement Students, Batches, Attendance, Tests (marks), Fees (invoices), Users (Admin/Teacher/Parent).
- Use Prisma ORM for DB access. Use JWT-based auth.

Follow this list of modules to generate. For each module, generate:
- Prisma model (we will paste schema separately)
- NestJS Module, Controller (REST), Service (business logic)
- DTOs (create/update) and validation using class-validator
- Example unit test skeleton (jest)

Start with Users and Students module. Generate endpoints for:
- Users: POST /auth/login (email+password) -> returns JWT, POST /auth/register (role support)
- Students: CRUD -> GET /students, POST /students, PUT /students/:id, GET /students/:id
- Batches: CRUD and endpoints to assign students
- Attendance: POST /attendance (bulk submit for a batch/date), GET /attendance?studentId=&from=&to=
- Tests: POST /tests (enter test with subject-level marks), GET /tests?studentId=&level=
- Fees: create invoice, mark paid (manual flow), list invoices per student

Generate Prisma client usage for DB access inside Service classes. Use repository pattern with Prisma service injection.

Security: secure protected routes with JWT guard. Use a simple AuthService for issuing tokens.

Return: Create or suggest required env variables and migration commands.
*/
