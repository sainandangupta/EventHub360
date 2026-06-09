# 🧪 Testing Checklist

Complete guide to test all features of your authentication app.

---

## ✅ Pre-Testing Setup

- [ ] PostgreSQL running
- [ ] Database `loginapp` created
- [ ] Tables created from `db_setup.sql`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend running on `http://localhost:5000` (`npm run dev`)
- [ ] Frontend running on `http://localhost:3000` (`npm start`)

---

## 🧪 Feature Tests

### 1. **Signup Feature** ✓
```
Steps:
1. Go to http://localhost:3000/signup
2. Enter:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
3. Click "Register"

Expected Results:
✓ Success message appears
✓ User created in database
✓ Can check: SELECT * FROM users;
✓ Password is hashed (not plain text)
```

### 2. **Login Feature** ✓
```
Steps:
1. Go to http://localhost:3000/
2. Enter email & password from signup
3. Click "Login"

Expected Results:
✓ "Login Success" message
✓ Redirected to /dashboard
✓ Token stored in localStorage
✓ Can check browser DevTools: localStorage.getItem("token")
```

### 3. **Dashboard Feature** ✓
```
Steps:
1. After login, you're on dashboard
2. Observe displayed information

Expected Results:
✓ Display: "Welcome, John Doe!"
✓ Show: Email (john@example.com)
✓ Show: Role (user)
✓ Show: Verified (false)
✓ Show: Last login time
✓ Show: Member since date
```

### 4. **Logout Feature** ✓
```
Steps:
1. On dashboard, click "Logout Session"

Expected Results:
✓ Redirected to login page
✓ Token removed from localStorage
✓ Accessing /dashboard redirects to login
```

### 5. **Protected Routes** ✓
```
Steps:
1. Logout (clear localStorage)
2. Try accessing: http://localhost:3000/dashboard
3. Try accessing: http://localhost:3000/admin

Expected Results:
✓ Both redirect to login
✓ Cannot access without token
✓ Token verification works
```

### 6. **Forgot Password Feature** ✓
```
Steps:
1. Go to http://localhost:3000/forgot-password
2. Enter email: "john@example.com"
3. Click "Send Reset Link"
4. Check backend console for reset link
5. Copy token from console
6. Enter new password: "newpassword123"
7. Confirm password: "newpassword123"
8. Click "Reset Password"

Expected Results:
✓ "Reset link sent" message
✓ Token appears in backend console
✓ "Password reset successfully" after submission
✓ Can login with new password
✓ Old password no longer works
```

### 7. **Email Verification** ✓
```
Steps:
1. Go to signup (create new user)
2. Enter details and register
3. Check backend console for verification link
4. Copy verification token
5. Go to: http://localhost:3000/verify-email/TOKEN_HERE
6. Replace TOKEN_HERE with actual token

Expected Results:
✓ Verification page loads
✓ Shows "Email verified successfully"
✓ In database: UPDATE users SET verified = true
✓ Query: SELECT verified FROM users WHERE email='new@email.com';
✓ Result: verified = true
```

### 8. **Admin Dashboard** ✓
```
Steps:
1. Make a user admin in database:
   UPDATE users SET role = 'admin' WHERE email = 'john@example.com';
2. Logout and login again
3. Go to: http://localhost:3000/admin

Expected Results:
✓ Admin dashboard loads
✓ Shows statistics (Total Users, Verified Users, Admins)
✓ Lists all users in table
✓ Can change user roles dropdown
✓ Can delete users
✓ Regular users cannot access (/admin)
```

### 9. **Role-Based Access** ✓
```
Steps:
1. Create 2 users:
   - user1@test.com (role: user)
   - admin1@test.com (role: admin)
2. Login as regular user
3. Try accessing /admin

Expected Results:
✓ Regular user: Access denied
✓ Admin user: Access granted
✓ Redirects based on role
✓ Middleware checks role correctly
```

### 10. **Password Hashing** ✓
```
Steps:
1. After signup, check database:
   SELECT email, password FROM users;
2. Password should look like: $2b$10$xxxxx...

Expected Results:
✓ Password is NOT plain text
✓ Password is bcrypt hash
✓ Hash format: $2b$10$salt$hash
✓ Each password is different hash (even same password)
```

### 11. **JWT Token** ✓
```
Steps:
1. Login to get token
2. Check localStorage:
   localStorage.getItem("token")
3. Token should be long string with dots (header.payload.signature)
4. Decode at: https://jwt.io/

Expected Results:
✓ Token exists in localStorage
✓ Token format: eyJXXX.eyJXXX.eyJXXX
✓ Contains user id, email, role
✓ Expires in 1 day
```

### 12. **API Endpoints** ✓
```
Test in Postman or curl:

Signup:
POST http://localhost:5000/api/auth/signup
Body: {"name":"Test","email":"test@test.com","password":"pass123"}
Expected: 201 Created

Login:
POST http://localhost:5000/api/auth/login
Body: {"email":"test@test.com","password":"pass123"}
Expected: 200 OK + token

Profile:
GET http://localhost:5000/api/user/profile
Header: Authorization: <token_from_login>
Expected: 200 OK + user data

Admin Stats:
GET http://localhost:5000/api/admin/stats
Header: Authorization: <admin_token>
Expected: 200 OK + stats
```

---

## 🔍 Error Handling Tests

### **Test: Wrong Password**
```
Steps:
1. Go to login
2. Enter correct email
3. Enter wrong password
4. Click Login

Expected: ⚠️ "Wrong Password" error message
```

### **Test: Email Already Exists**
```
Steps:
1. Go to signup
2. Use email that already exists
3. Click Register

Expected: ⚠️ "Email already exists" error message
```

### **Test: User Not Found**
```
Steps:
1. Go to login
2. Enter email that doesn't exist
3. Click Login

Expected: ⚠️ "User not found" error message
```

### **Test: Missing Fields**
```
Steps:
1. Go to signup
2. Leave name empty
3. Click Register

Expected: ⚠️ Form validation error or "Name required"
```

### **Test: Invalid Token**
```
Steps:
1. Go to /verify-email/invalid_token_here
Expected: ⚠️ "Invalid or expired verification token"

2. Go to admin with regular user token
Expected: ⚠️ "Forbidden" or redirect to login
```

---

## 📊 Database Integrity Tests

```sql
-- Check all users
SELECT * FROM users;

-- Check passwords are hashed
SELECT email, 
       CASE 
         WHEN password LIKE '$2b$%' THEN 'Hashed'
         ELSE 'NOT HASHED'
       END as password_status
FROM users;

-- Check password reset tokens
SELECT * FROM password_reset WHERE expires_at > NOW();

-- Check verified users
SELECT email, verified FROM users;

-- Check admin users
SELECT email, role FROM users WHERE role = 'admin';

-- Check last login
SELECT email, last_login FROM users ORDER BY last_login DESC;
```

---

## 🚀 Performance Tests

- [ ] Signup completes in < 2 seconds
- [ ] Login completes in < 1 second
- [ ] Dashboard loads in < 1 second
- [ ] Admin dashboard loads in < 2 seconds
- [ ] Password reset completes in < 2 seconds

---

## 🔐 Security Tests

- [ ] Passwords are hashed (not visible in DB)
- [ ] Tokens are not stored in plain text (localStorage is client-side)
- [ ] CORS works (frontend can call backend)
- [ ] Protected routes require token
- [ ] Invalid tokens are rejected
- [ ] Admin routes require admin role
- [ ] SQL injection attempt fails gracefully
- [ ] CSRF tokens present (if applicable)

---

## ✅ All Tests Passed Checklist

```
Features:
☐ Signup working
☐ Login working
☐ Dashboard showing real data
☐ Logout working
☐ Protected routes working
☐ Forgot password working
☐ Email verification working
☐ Admin dashboard working
☐ Role-based access working
☐ Password hashing verified
☐ JWT token working
☐ API endpoints working

Error Handling:
☐ Wrong password error
☐ Email exists error
☐ User not found error
☐ Missing fields error
☐ Invalid token error

Database:
☐ Users table created
☐ Password reset table created
☐ Refresh tokens table created
☐ Email verification table created
☐ Passwords are hashed
☐ Data integrity maintained

Security:
☐ CORS working
☐ Protected routes verified
☐ Role-based access verified
☐ Tokens verified
☐ No SQL injection
```

---

## 🎯 Final Verification

After all tests pass:

1. ✅ Restart backend: `npm run dev`
2. ✅ Restart frontend: `npm start`
3. ✅ Full signup → login → logout cycle
4. ✅ Test with fresh browser (incognito)
5. ✅ Clear localStorage and try again
6. ✅ Check database for data persistence

---

## 📝 Test Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Signup | ☐ Pass / ☐ Fail | |
| Login | ☐ Pass / ☐ Fail | |
| Dashboard | ☐ Pass / ☐ Fail | |
| Logout | ☐ Pass / ☐ Fail | |
| Protected Routes | ☐ Pass / ☐ Fail | |
| Forgot Password | ☐ Pass / ☐ Fail | |
| Email Verification | ☐ Pass / ☐ Fail | |
| Admin Dashboard | ☐ Pass / ☐ Fail | |
| RBAC | ☐ Pass / ☐ Fail | |
| API Endpoints | ☐ Pass / ☐ Fail | |

---

**When all tests pass, your app is production-ready! 🎉**
