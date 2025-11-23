# 🎓 Arnav Abacus Academy - Learning Management System

A comprehensive, modern full-stack Learning Management System built with **Next.js 15**, **NestJS**, **PostgreSQL**, and **Prisma ORM**.

## 🌟 Features

### Core Functionality
- ✅ **Student Management** - Complete CRUD with profiles, batch assignment, and performance tracking
- ✅ **Batch & Level Management** - Organize students by skill levels and class groups
- ✅ **Attendance Tracking** - Daily attendance with automated reports and analytics
- ✅ **Test Management** - Multi-subject tests with automatic grading
- ✅ **Homework System** - Assignment creation, submission, and grading
- ✅ **Fee Management** - Invoice generation, payment tracking, and financial reports
- ✅ **Parent Portal** - Parent access to student progress and communication
- ✅ **Teacher Dashboard** - Attendance marking, test entry, and class management
- ✅ **Admin Dashboard** - Comprehensive system administration and analytics

### Additional Features
- 📊 **Analytics & Reports** - Detailed performance metrics and insights
- 📅 **Timetable Management** - Schedule classes and manage teacher assignments
- 💬 **Messaging System** - Communication between teachers, parents, and admin
- 📢 **Announcements & Broadcasts** - System-wide and targeted notifications
- 🎉 **Events & Holidays** - Calendar management for school events
- 📜 **Certificates** - Generate and manage student certificates
- 🔄 **Referral System** - Track student referrals and sources
- 👨‍👩‍👧 **Sibling Management** - Link related students
- 🏥 **Leave Management** - Track student and teacher absences
- 📦 **Inventory System** - Manage school resources and materials
- 👤 **Guardian Management** - Multiple guardian support per student
- 💰 **Expenditure Tracking** - Track school expenses and budgets
- 💳 **Fee Templates** - Predefined fee structures for different levels

## 🏗️ Tech Stack

### Backend
- **Framework:** NestJS 10
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 6.2
- **Authentication:** JWT + Passport
- **Validation:** class-validator
- **API Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 3.4
- **State Management:** TanStack React Query 5.90
- **HTTP Client:** Axios 1.7
- **Animations:** Framer Motion 12
- **Charts:** Recharts 2.15
- **Toasts:** Sonner
- **Icons:** Lucide React

### Database Schema
15 Prisma models covering:
- Users & Authentication
- Students, Teachers, Parents, Guardians
- Batches, Levels, Timetables
- Attendance, Tests, Homework
- Fees, Expenditure, Invoices
- Messages, Notifications, Events
- And more...

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd arnav-abacus
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd apps/api && npm install
   cd ../web && npm install
   ```

3. **Set up environment variables**

   **Backend** (`apps/api/.env`):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/aa_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   FRONTEND_URL="http://localhost:3001"
   ```

   **Frontend** (`apps/web/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Setup database**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Create admin user** (Optional)
   ```bash
   node scripts/create-admin.js
   ```
   Creates admin with:
   - Email: `admin@arnav-abacus.com`
   - Password: `admin123`

### Running the Application

**Development mode:**

Terminal 1 - Backend:
```bash
cd apps/api
npm run dev
```

Terminal 2 - Frontend:
```bash
cd apps/web
npm run dev
```

**Access:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

### Production Build

**Backend:**
```bash
cd apps/api
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd apps/web
npm run build
npm start
```

## 📁 Project Structure

```
arnav-abacus/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication & JWT
│   │   │   ├── users/          # User management
│   │   │   ├── students/       # Student CRUD
│   │   │   ├── teachers/       # Teacher management
│   │   │   ├── parents/        # Parent portal
│   │   │   ├── batches/        # Batch management
│   │   │   ├── levels/         # Level configuration
│   │   │   ├── attendance/     # Attendance tracking
│   │   │   ├── tests/          # Test management
│   │   │   ├── homework/       # Homework system
│   │   │   ├── fees/           # Fee management
│   │   │   ├── messages/       # Messaging system
│   │   │   ├── notifications/  # Notifications
│   │   │   ├── reports/        # Analytics & reports
│   │   │   ├── timetable/      # Schedule management
│   │   │   ├── events/         # Events & calendar
│   │   │   ├── inventory/      # Resource management
│   │   │   └── ... (30+ modules)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── migrations/     # DB migrations
│   │   └── uploads/            # File uploads
│   │
│   └── web/                    # Next.js Frontend
│       ├── app/
│       │   ├── admin/          # Admin dashboard
│       │   ├── teacher/        # Teacher portal
│       │   ├── parent/         # Parent portal
│       │   ├── student/        # Student portal
│       │   └── auth/           # Login/Register
│       ├── components/
│       │   ├── ui/             # Reusable UI components
│       │   └── layout/         # Layout components
│       └── lib/
│           ├── api.ts          # API client
│           └── utils.ts        # Utilities
│
└── README.md
```

## 🔐 Default Credentials

After running `scripts/create-admin.js`:

- **Admin:** admin@arnav-abacus.com / admin123
- **Role:** ADMIN

⚠️ **Important:** Change these credentials in production!

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT
- `GET /auth/me` - Get current user

### Students
- `GET /students` - List all students
- `POST /students` - Create student
- `GET /students/:id` - Get student details
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Batches
- `GET /batches` - List all batches
- `POST /batches` - Create batch
- `GET /batches/:id/students` - Get batch students

### Tests
- `POST /tests` - Create test entry
- `GET /tests` - List all tests
- `GET /tests/summary/:studentId` - Get student test summary

### Attendance
- `POST /attendance/batch` - Mark batch attendance
- `GET /attendance/student/:id` - Get student attendance
- `GET /attendance/student/:id/summary` - Get attendance summary

### And 50+ more endpoints...

Full API documentation available at `/api` when server is running.

## 🧪 Testing

Test script included for endpoint verification:
```bash
.\test-endpoints-simple.ps1
```

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ SQL injection protection (Prisma)
- ✅ CORS configuration
- ✅ Environment variable protection

## 📝 Development Notes

### Adding a New Module

1. Generate module: `nest g module feature-name`
2. Generate service: `nest g service feature-name`
3. Generate controller: `nest g controller feature-name`
4. Add to `app.module.ts` imports
5. Add PrismaService to module providers

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only!)
npx prisma migrate reset
```

## 🚢 Deployment

### Backend (Railway/Heroku/AWS)
1. Set environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm run start:prod`

### Frontend (Vercel/Netlify)
1. Set `NEXT_PUBLIC_API_URL`
2. Build: `npm run build`
3. Deploy build output

### Database (Supabase/Railway/AWS RDS)
- Recommended: Managed PostgreSQL service
- Ensure migrations are applied
- Set up automated backups

## 📦 Environment Variables

### Backend Required
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)

### Frontend Required
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes
4. Check for uncommitted changes: `./check-uncommitted.sh`
5. Commit changes: `git commit -m 'Add AmazingFeature'`
6. Push to branch: `git push origin feature/AmazingFeature`
7. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).  
For handling uncommitted changes, see [UNCOMMITTED_CHANGES.md](UNCOMMITTED_CHANGES.md).

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

**Project:** Arnav Abacus Academy  
**Version:** 1.0.0  
**Last Updated:** October 2025

## 📞 Support

For support, email support@arnav-abacus.com

---

<div align="center">

**Made with ❤️ for Arnav Abacus Academy**

⭐ Star this repo if you find it helpful!

</div>
