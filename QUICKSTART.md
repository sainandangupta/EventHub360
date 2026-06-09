# ⚡ Quick Start Guide

Get your full-stack auth app running in 5 minutes!

---

## **Step 1: Database Setup (2 minutes)**

```bash
# Open PostgreSQL
psql -U postgres

# Create and setup database
CREATE DATABASE loginapp;
\c loginapp

# Run setup script (copy content from backend/db_setup.sql)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset (
    id SERIAL PRIMARY KEY,
    user_id INT,
    token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT,
    token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE email_verification (
    id SERIAL PRIMARY KEY,
    user_id INT,
    token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## **Step 2: Start Backend (1 minute)**

```bash
cd backend

# Install packages
npm install

# Start server
npm run dev

# Should see: Server running on port 5000
```

✅ Backend ready at `http://localhost:5000`

---

## **Step 3: Start Frontend (1 minute)**

```bash
cd frontend

# Install packages
npm install

# Start app
npm start

# Browser opens at http://localhost:3000
```

✅ Frontend ready at `http://localhost:3000`

---

## **Step 4: Test It! (1 minute)**

### Signup
1. Go to `/signup`
2. Enter: Name, Email, Password
3. Click "Register"
4. ✅ User created!

### Login
1. Go to `/`
2. Enter email & password from signup
3. Click "Login"
4. ✅ Redirected to dashboard!

### Dashboard
- See your profile info
- Name, Email, Role, Verification status
- Last Login timestamp

### Logout
- Click "Logout Session" button
- Redirected to login page

---

## **Test Admin Features**

Make user an admin in database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

Then:
1. Logout
2. Login again
3. Go to `/admin` 
4. ✅ See admin dashboard!

---

## **Test Forgot Password**

1. Go to `/forgot-password`
2. Enter email
3. Get reset token (in backend console for now)
4. Paste token and new password
5. ✅ Password reset!

---

## **📝 Common Commands**

```bash
# Backend
cd backend
npm run dev           # Start in dev mode
npm run start        # Start in production

# Frontend
cd frontend
npm start            # Start dev server
npm run build        # Build for production
npm run test         # Run tests

# Database
npm run prisma:migrate   # Run migrations
npm run prisma:generate  # Generate Prisma client
```

---

## **🔗 Key URLs**

| Page | URL | Purpose |
|------|-----|---------|
| Login | `http://localhost:3000/` | User login |
| Signup | `http://localhost:3000/signup` | Create account |
| Dashboard | `http://localhost:3000/dashboard` | User profile |
| Forgot Password | `http://localhost:3000/forgot-password` | Reset password |
| Admin | `http://localhost:3000/admin` | Admin panel |

---

## **⚙️ Default .env**

**Backend** (`backend/.env`):
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=loginapp
DB_PASSWORD=your_password_here
DB_PORT=5432
JWT_SECRET=your_secret_key_here
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/loginapp
```

---

## **✅ What You Have**

✅ User authentication (Signup/Login)
✅ Password hashing with bcrypt
✅ JWT tokens
✅ Protected routes
✅ User dashboard
✅ Password reset
✅ Email verification (ready to integrate)
✅ Role-based access control
✅ Admin dashboard
✅ Redux state management
✅ Prisma ORM ready

---

## **🚀 Next Steps**

1. **Setup email service** → Enable email verification & password reset
2. **Deploy to cloud** → See DEPLOYMENT.md
3. **Add more features** → Refresh tokens, 2FA, OAuth
4. **Connect to real DB** → Migrate to Neon PostgreSQL
5. **Setup CI/CD** → GitHub Actions for automated testing

---

## **❌ Issues?**

```bash
# Port already in use?
lsof -i :5000
kill -9 <PID>

# Can't connect to database?
# Check PostgreSQL is running and credentials are correct

# Need to reset everything?
npm install  # Reinstall packages
npm run dev  # Restart server
```

---

**That's it! Your app is running! 🎉**

Full documentation: See `README.md`
Deployment guide: See `DEPLOYMENT.md`
