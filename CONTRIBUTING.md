# Contributing to Arnav Abacus Academy LMS

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Git
- Basic knowledge of TypeScript, React, and NestJS

### Development Setup

1. Fork and clone the repository
   ```bash
   git clone https://github.com/yourusername/arnav-abacus.git
   cd arnav-abacus
   ```

2. Install dependencies
   ```bash
   npm install
   cd apps/api && npm install
   cd ../web && npm install
   ```

3. Set up environment variables (see README.md)

4. Run database migrations
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```

5. Start development servers
   ```bash
   # Terminal 1
   cd apps/api && npm run dev
   
   # Terminal 2
   cd apps/web && npm run dev
   ```

## 📝 Development Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring
- `test/what-added` - Test additions

### Commit Messages
Follow conventional commits:
- `feat: add student bulk import feature`
- `fix: resolve attendance date validation issue`
- `docs: update API endpoint documentation`
- `refactor: simplify fee calculation logic`
- `test: add unit tests for auth service`
- `chore: update dependencies`

### Pull Request Process

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - Test results

5. Wait for code review and address feedback

## 🏗️ Code Standards

### TypeScript
- Use TypeScript strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types from separate `.types.ts` files

### React/Next.js
- Use functional components with hooks
- Follow React Query patterns for data fetching
- Keep components small and focused
- Use Tailwind CSS for styling (no inline styles)
- Add proper error handling

### NestJS
- Follow module-based architecture
- Use DTOs for request validation
- Add Swagger decorators for API documentation
- Use dependency injection properly
- Add proper error handling with filters

### Database
- Use Prisma for all database operations
- Create migrations for schema changes
- Add indexes for frequently queried fields
- Use transactions for related operations

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd apps/api
npm run test

# Frontend tests
cd apps/web
npm run test

# E2E tests
npm run test:e2e
```

### Writing Tests
- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Aim for 80%+ code coverage

## 📚 Adding New Features

### Backend Module
1. Generate module structure:
   ```bash
   cd apps/api
   nest g module feature-name
   nest g service feature-name
   nest g controller feature-name
   ```

2. Add Prisma model to `schema.prisma`

3. Create DTOs in `feature-name/dto/`

4. Implement service logic

5. Add controller endpoints with:
   - Proper decorators (@Get, @Post, etc.)
   - Authentication guards
   - Validation pipes
   - Swagger documentation

6. Register module in `app.module.ts`

7. Add PrismaService to module providers

### Frontend Page
1. Create page component in appropriate folder:
   - `app/admin/` for admin features
   - `app/teacher/` for teacher features
   - `app/parent/` for parent features

2. Use React Query for data fetching

3. Implement loading and error states

4. Add form validation with proper error messages

5. Style with Tailwind CSS

6. Test responsive design

## 🐛 Bug Reports

When filing a bug report, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Environment details (OS, Node version, etc.)
- Error messages and stack traces

## 💡 Feature Requests

When suggesting a feature:
- Describe the problem it solves
- Explain the proposed solution
- Provide examples or mockups
- Consider impact on existing features
- Discuss alternative approaches

## 🔍 Code Review Guidelines

### For Reviewers
- Be constructive and respectful
- Focus on code quality and maintainability
- Check for security issues
- Verify tests are included
- Test the changes locally if needed

### For Contributors
- Respond to feedback promptly
- Ask questions if unclear
- Make requested changes
- Re-request review after updates
- Be patient and respectful

## 📦 Module Dependencies

### Adding Dependencies
- Use exact versions in `package.json`
- Document why the dependency is needed
- Check for license compatibility
- Consider bundle size impact
- Update package.json in appropriate workspace

## 🔒 Security

### Reporting Vulnerabilities
- Do NOT open public issues for security vulnerabilities
- Email security@arnav-abacus.com with details
- Include reproduction steps
- Allow time for fix before disclosure

### Security Best Practices
- Never commit secrets or credentials
- Use environment variables
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries (Prisma handles this)
- Implement rate limiting
- Use HTTPS in production
- Keep dependencies updated

## 📖 Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Document complex logic
- Include examples in comments
- Update README for major changes

### API Documentation
- Use Swagger decorators
- Include request/response examples
- Document error responses
- Keep documentation in sync with code

## 🎨 UI/UX Guidelines

- Follow existing design patterns
- Maintain consistent spacing and colors
- Use icons from Lucide React
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test on mobile devices
- Add loading states
- Provide clear error messages
- Use toast notifications for feedback

## 🚫 What Not to Do

- Don't commit directly to `main`
- Don't include unrelated changes in PRs
- Don't ignore linting errors
- Don't skip writing tests
- Don't hardcode configuration values
- Don't use `any` type unnecessarily
- Don't commit large binary files
- Don't include console.log statements

## 📞 Getting Help

- Check existing issues and documentation
- Ask in PR comments
- Email: dev@arnav-abacus.com
- Be specific about your question
- Include relevant code and error messages

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Note:** This is a living document. Suggestions for improvements are welcome!
