# 🚀 Full-Stack React + Node.js + PostgreSQL Authentication App

A complete production-ready authentication system with beginner to advanced features.

---

## 📋 Features

### ✅ Beginner Features
- User Signup with password hashing (bcrypt)
- User Login with JWT authentication
- Protected routes
- User dashboard
- Logout functionality

### ✅ Advanced Features
- **Phase 3**: User profile with real database data
- **Phase 4**: Forgot password with 15-minute token expiry
- **Phase 5**: Email verification on signup
- **Phase 6**: Refresh tokens (Access + Refresh token system)
- **Phase 7**: Role-Based Access Control (Admin/User/Manager)
- **Phase 8**: Prisma ORM for database operations
- **Phase 9**: Redux Toolkit for state management
- **Phase 10**: Production deployment guides

---

## 🛠️ Tech Stack

**Frontend:**
- React 19
- React Router v7
- Redux Toolkit
- Axios
- React DOM v19

**Backend:**
- Node.js
- Express.js v5
- PostgreSQL
- Prisma ORM
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- dotenv (environment variables)

**Database:**
- PostgreSQL (local or Neon for production)

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

---

## 📦 Project Structure

```
LoginApp/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── authorize.js         # Role-based authorization
│   ├── routes/
│   │   ├── auth.js              # Signup & Login
│   │   ├── userRoutes.js        # User profile
│   │   ├── forgotPassword.js    # Password reset
│   │   ├── emailVerification.js # Email verification
│   │   ├── tokenRoutes.js       # Refresh tokens
│   │   └── adminRoutes.js       # Admin operations
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ForgotPassword.js
│   │   │   ├── EmailVerification.js
│   │   │   └── AdminDashboard.js
│   │   ├── components/
│   │   │   └── ProtectedRoute.js
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       └── userSlice.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
└── DEPLOYMENT.md                 # Production deployment guide
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (running locally or on cloud)
- npm or yarn

### **Step 1: Setup PostgreSQL Database**

```bash
# Open PostgreSQL query tool
psql -U postgres

# Create database
CREATE DATABASE loginapp;

# Connect to database
\c loginapp

# Create tables (run SQL from backend/db_setup.sql)
```

Or use the provided `db_setup.sql` script.

### **Step 2: Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=loginapp
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key
DATABASE_URL="postgresql://postgres:password@localhost:5432/loginapp"

# Run Prisma migrations
npm run prisma:migrate

# Start backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### **Step 3: Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔐 Authentication Flow

### Signup Flow
```
1. User fills signup form (name, email, password)
2. Backend validates input
3. Password hashed with bcrypt
4. User stored in PostgreSQL
5. Verification email sent
6. User redirected to login
```

### Login Flow
```
1. User enters email & password
2. Backend finds user by email
3. Password verified against hash
4. JWT token generated
5. Token stored in localStorage
6. User redirected to dashboard
7. Token sent in Authorization header for protected routes
```

### Protected Routes
```
1. Frontend checks for token in localStorage
2. If no token → redirect to login
3. If token exists → render protected component
4. Backend verifies token on API calls
5. Invalid token → return 401 Unauthorized
```

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/signup         - Register new user
POST   /api/auth/login          - Login user
POST   /api/password/forgot-password  - Request password reset
POST   /api/password/reset-password   - Reset password with token
```

### User Management
```
GET    /api/user/profile        - Get current user profile
POST   /api/email/send-verification  - Send verification email
POST   /api/email/verify-email  - Verify email with token
GET    /api/email/is-verified/:userId - Check if email verified
```

### Token Management
```
POST   /api/token/refresh-token - Get new access token
POST   /api/token/logout        - Invalidate refresh token
```

### Admin Routes (Protected)
```
GET    /api/admin/users         - Get all users
GET    /api/admin/stats         - Get dashboard statistics
PUT    /api/admin/users/:userId/role - Change user role
DELETE /api/admin/users/:userId - Delete user
```

---

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=loginapp
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_secret_key_change_in_production
DATABASE_URL=postgresql://user:password@host:port/database
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

---

## 📚 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Reset Table
```sql
CREATE TABLE password_reset (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Email Verification Table
```sql
CREATE TABLE email_verification (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🧪 Testing the App

### Test Signup
1. Go to `/signup`
2. Enter: Name, Email, Password
3. Click "Register"
4. User created in database

### Test Login
1. Go to `/`
2. Enter email & password
3. Token stored in localStorage
4. Redirected to `/dashboard`

### Test Protected Routes
1. Try accessing `/dashboard` without login
2. Should redirect to `/login`
3. Token verification happens on backend

### Test Forgot Password
1. Go to `/forgot-password`
2. Enter email
3. Get reset token
4. Enter new password
5. Password updated in database

### Test Admin Routes
1. User must have `role = 'admin'`
2. Access `/admin` dashboard
3. View all users and statistics
4. Change user roles
5. Delete users

---

## 🚀 Deployment

See `DEPLOYMENT.md` for complete production deployment guide covering:
- Backend deployment to Render
- Frontend deployment to Vercel
- Database migration to Neon PostgreSQL
- Environment configuration
- Email service setup
- Common issues & fixes

---

## 🔄 Redux State Management

### Auth Slice
```javascript
{
  token: "jwt_token",
  isAuthenticated: true,
  user: { id, name, email, role },
  loading: false,
  error: null
}
```

### User Slice
```javascript
{
  profile: { id, name, email, role, verified, lastLogin },
  loading: false,
  error: null
}
```

---

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiry (1 day access token)
- ✅ Protected routes with token verification
- ✅ Role-based access control (RBAC)
- ✅ Email verification for new accounts
- ✅ Password reset tokens with 15-minute expiry
- ✅ CORS enabled for frontend
- ✅ Environment variables for sensitive data
- ✅ Input validation on backend
- ✅ SQL injection prevention with parameterized queries

---

## 📝 Best Practices

1. **Always use HTTPS in production**
2. **Keep JWT_SECRET in environment variables**
3. **Validate all inputs on backend**
4. **Use prepared statements for SQL queries**
5. **Enable CORS only for trusted domains**
6. **Keep token expiry time reasonable**
7. **Implement rate limiting on auth endpoints**
8. **Use refresh tokens for long sessions**
9. **Log all authentication attempts**
10. **Regularly update dependencies**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use for personal and commercial projects

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to database"
- Check PostgreSQL is running
- Verify connection string in .env
- Check username/password

### Issue: "Port 5000 already in use"
- Change PORT in .env
- Or kill process: `lsof -i :5000` and `kill -9 PID`

### Issue: "Token is invalid"
- Check JWT_SECRET is same everywhere
- Clear localStorage and login again

### Issue: "Email verification not working"
- Check email service is configured
- Check backend logs for errors

### Issue: "Redux not updating state"
- Ensure Redux store is provided in index.js
- Check actions are dispatched correctly
- Use Redux DevTools for debugging

---

## 📞 Support

For issues or questions:
1. Check the docs folder
2. Review DEPLOYMENT.md
3. Check GitHub issues
4. Create a new issue with details

---

**Happy coding! 🎉**

Built with ❤️ using React, Node.js, and PostgreSQL
