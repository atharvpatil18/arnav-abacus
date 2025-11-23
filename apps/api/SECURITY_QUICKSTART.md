# Security Features - Quick Start Guide

## 🔒 Security Features Enabled

This API now includes comprehensive security features to protect against common vulnerabilities:

- ✅ **Helmet**: Security HTTP headers
- ✅ **Rate Limiting**: 100 requests/minute per IP
- ✅ **Strict CORS**: Controlled origin access
- ✅ **HttpOnly Cookies**: Secure JWT storage
- ✅ **CSRF Protection**: SameSite cookie policy

## ⚙️ Required Environment Variables

Before starting the application, ensure these environment variables are set:

### Critical (Application won't start without these):

```bash
# Frontend URL for CORS validation
FRONTEND_URL="http://localhost:3001"  # or your frontend URL

# JWT secret for token signing
JWT_SECRET="your-secure-random-secret-key"
```

### Optional but Recommended:

```bash
# Node environment (affects security settings)
NODE_ENV="production"  # Use "production" in production!
```

## 🚀 Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the required variables in `.env`:**
   - Set `FRONTEND_URL` to your frontend application URL
   - Generate a strong `JWT_SECRET` (use a password generator)
   - Set `NODE_ENV=production` for production deployments

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the application:**
   ```bash
   npm run dev      # Development
   npm run start    # Production
   ```

## 🔐 Authentication Changes

### Important: JWT Tokens Now Use HttpOnly Cookies

**Previous behavior**: JWT tokens were returned in the response body
**New behavior**: JWT tokens are set as secure httpOnly cookies

### For Frontend Developers:

#### ❌ Old Way (Don't do this anymore):
```javascript
// Storing token in localStorage (vulnerable to XSS)
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { token } = await response.json();
localStorage.setItem('token', token);
```

#### ✅ New Way (Use this):
```javascript
// Browser handles cookies automatically
const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',  // Important: Send cookies
  body: JSON.stringify({ email, password })
});

// Token is automatically stored in httpOnly cookie
// No need to handle token manually!
```

#### Making Authenticated Requests:
```javascript
// Just include credentials in all requests
fetch('/api/protected-endpoint', {
  credentials: 'include'  // Cookies sent automatically
});
```

#### Logging Out:
```javascript
fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
```

## 🔄 Migration & Backward Compatibility

The API still supports the old Authorization header method for backward compatibility:

```javascript
// This still works (but cookie method is preferred)
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🛡️ Security Headers Included

The API automatically sets these security headers on all responses:

- `Content-Security-Policy`: Prevents XSS attacks
- `X-Frame-Options: DENY`: Prevents clickjacking
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `Strict-Transport-Security`: Enforces HTTPS (in production)
- `X-DNS-Prefetch-Control`: Controls DNS prefetching

## 📊 Rate Limiting

All endpoints are protected by rate limiting:

- **Limit**: 100 requests per minute per IP address
- **Response when exceeded**: HTTP 429 (Too Many Requests)
- **Headers included**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Example Response:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## 🌐 CORS Configuration

CORS is strictly configured:

- Only the origin specified in `FRONTEND_URL` can access the API
- Credentials (cookies) are allowed for that origin
- Pre-flight requests are properly handled

### Common CORS Issues:

**Issue**: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution**: Ensure `FRONTEND_URL` matches your frontend's exact origin (including protocol and port)

**Issue**: Cookies not being sent
**Solution**: Ensure you're using `credentials: 'include'` in fetch requests

## 🧪 Testing the Security Features

### Test Rate Limiting:
```bash
# Send 101 requests quickly (should get throttled)
for i in {1..101}; do
  curl http://localhost:3000/api/health
done
```

### Test CORS:
```bash
# Should fail (wrong origin)
curl -H "Origin: http://malicious-site.com" http://localhost:3000/api/health

# Should succeed (correct origin)
curl -H "Origin: http://localhost:3001" http://localhost:3000/api/health
```

### Test HttpOnly Cookie:
```bash
# Login and check Set-Cookie header
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v | grep "Set-Cookie"

# Should see: Set-Cookie: jwt=...; HttpOnly; Secure; SameSite=Strict
```

## 📖 Full Documentation

For complete documentation, see: [SECURITY_IMPLEMENTATION.md](../../SECURITY_IMPLEMENTATION.md)

## ⚠️ Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, unique `JWT_SECRET`
- [ ] Set correct `FRONTEND_URL` (your production frontend URL)
- [ ] Enable HTTPS on your server
- [ ] Configure proper database credentials
- [ ] Review and test all security headers
- [ ] Test rate limiting behavior
- [ ] Verify CORS configuration
- [ ] Test authentication flow with httpOnly cookies

## 🆘 Troubleshooting

### Application won't start

**Error**: "FRONTEND_URL environment variable is required"
**Solution**: Add `FRONTEND_URL` to your `.env` file

### Authentication not working

**Problem**: Frontend can't authenticate
**Check**:
1. Are you using `credentials: 'include'` in fetch?
2. Is `FRONTEND_URL` set correctly?
3. Are you on the same domain (or is CORS configured properly)?
4. Is the cookie domain set correctly?

### Rate limit too restrictive

**Problem**: Getting throttled too quickly
**Solution**: The rate limit is set in `src/app.module.ts`. Adjust `ttl` and `limit` values as needed:

```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,    // Time window (milliseconds)
  limit: 100,    // Requests per window
}])
```

## 📞 Support

For questions or issues with the security implementation, please:
1. Check the [SECURITY_IMPLEMENTATION.md](../../SECURITY_IMPLEMENTATION.md) documentation
2. Review this Quick Start Guide
3. Check the `.env.example` file for configuration examples
4. Open an issue on GitHub with details about your problem

## 🔗 Useful Resources

- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HttpOnly Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
