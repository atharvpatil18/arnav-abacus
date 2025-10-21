# Test Credentials for Arnav Abacus LMS

## Default Test Users

### Admin Account ✅ VERIFIED
- **Email:** admin@arnavabacus.com
- **Password:** admin123
- **Role:** ADMIN
- **Access:** Full system access - manage users, students, batches, fees, reports

### Teacher Account ✅ VERIFIED
- **Email:** teacher@arnavabacus.com
- **Password:** password123
- **Role:** TEACHER
- **Access:** Student management, attendance, tests, homework, grades

### Parent Account ✅ VERIFIED
- **Email:** parent@arnavabacus.com
- **Password:** password123
- **Role:** PARENT
- **Access:** View student progress, attendance, fees, homework, reports

---

## Seeding Test Data

To create these test users, run:

```bash
cd apps/api
npm run seed:test-users
```

Or for complete data with students, batches, etc:

```bash
npm run seed:complete
```

---

## Login URLs

- **Frontend:** http://localhost:3001/auth/login
- **Backend API:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:3000/api

---

## Testing Steps

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd apps/api
   npm run dev

   # Terminal 2 - Frontend
   cd apps/web
   npm run dev
   ```

2. Navigate to: http://localhost:3001/auth/login

3. Login with any of the credentials above

4. You will be redirected to the appropriate dashboard based on role

---

## Role-Based Dashboards

### Admin Dashboard
- URL: http://localhost:3001/admin/dashboard
- Features: User management, system settings, analytics, reports

### Teacher Dashboard
- URL: http://localhost:3001/teacher/dashboard
- Features: Attendance, tests, homework, student progress

### Parent Dashboard
- URL: http://localhost:3001/parent/dashboard
- Features: View children's progress, attendance, fees, messages

---

## API Endpoints to Test

### Auth Endpoints
- POST `/auth/login` - Login
- POST `/auth/register` - Register
- POST `/auth/logout` - Logout
- GET `/auth/me` - Get current user

### Core Endpoints (require authentication)
- GET `/students` - List all students
- GET `/batches` - List all batches
- GET `/tests` - List all tests
- GET `/fees` - List all fees
- GET `/attendance` - List attendance records
- GET `/users` - List all users (admin only)

---

## Notes

- All passwords use the same format: `Role@123`
- Tokens are stored in httpOnly cookies for security
- JWT tokens expire after 24 hours (configurable in .env)
- Use the admin account for full system testing
