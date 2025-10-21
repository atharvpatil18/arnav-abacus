# 🧪 Quick Login Test

## Test Steps:

1. Open browser: **http://localhost:3001/auth/login**

2. Clear browser localStorage first (F12 → Application → Local Storage → Clear)

3. Try logging in with:
   - Email: `admin@arnavabacus.com`
   - Password: `admin123`

4. Check browser console (F12) for any errors

5. After clicking "Sign in", you should:
   - See "Logged in successfully" toast
   - Token should be stored in localStorage
   - Be redirected to `/admin/dashboard`

## If Still Not Working:

### Check Browser Console for:
- Network errors (401, 404, etc.)
- JavaScript errors
- Token storage confirmation

### Check Network Tab:
1. POST `/auth/login` - Should return 200 with token
2. Token should be in response: `{ user: {...}, token: "..." }`
3. localStorage should have key `token` with JWT value

### Manual Test in Console:
```javascript
// Check if token is stored
console.log('Token:', localStorage.getItem('token'));

// Test login manually
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@arnavabacus.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  if(data.token) {
    localStorage.setItem('token', data.token);
    console.log('Token saved!');
    window.location.href = '/admin/dashboard';
  }
});
```

## Server Status:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:3001  
- ✅ All 31 modules loaded
- ✅ Auth endpoints working
