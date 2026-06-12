# 🏢 Employee Management System

> A comprehensive, full-stack Employee Management System with enterprise-grade modules for managing employees, leave, assets, attendance, salary, and more.

**Developer:** Sainandan Gupta  
**Repository:** [https://github.com/sainandangupta/EventHub360](https://github.com/sainandangupta/EventHub360)

---

## 🌐 Live Deployment URLs

| Service | URL |
|---------|-----|
| **Frontend** | *Deploy on Vercel — see [Deployment Guide](#-deployment)* |
| **Backend API** | *Deploy on Render — see [Deployment Guide](#-deployment)* |
| **API Health** | `GET /api/health` |
| **Swagger Docs** | `GET /api-docs` |

---

## ✨ Features

### Authentication & Security
- ✅ User Signup with bcrypt password hashing
- ✅ JWT-based Login with access + refresh tokens
- ✅ Email verification on signup
- ✅ Forgot/Reset password with 15-min token expiry
- ✅ Role-Based Access Control (Admin / Manager / HR / User)
- ✅ Rate limiting on auth endpoints
- ✅ Helmet security headers

### Employee Management
- ✅ Full CRUD (Create, Read, Update, Delete)
- ✅ Department & Skills master data
- ✅ Employee photo/document upload
- ✅ Advanced search, filter, and pagination
- ✅ City-wise & department-wise analytics

### Leave Management
- ✅ Configurable leave types & balances
- ✅ Apply, approve, reject, cancel workflows
- ✅ Multi-level approval (Manager → HR)
- ✅ Leave balance tracking & reports
- ✅ Dashboard statistics

### Asset Management
- ✅ Asset registration & allocation
- ✅ Track allocated vs available assets
- ✅ Asset return workflow

### Attendance & Salary
- ✅ Daily attendance tracking
- ✅ Attendance trends & analytics
- ✅ Salary structure management
- ✅ Monthly payroll generation
- ✅ TDS, PF, ESIC compliance reports

### Administration
- ✅ Admin dashboard with full user management
- ✅ Audit logs for all system actions
- ✅ Notifications system
- ✅ Enterprise reports with Excel export

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router v7, Redux Toolkit, Axios, Recharts |
| **Backend** | Node.js, Express.js v5, Prisma ORM |
| **Database** | PostgreSQL (Neon for production) |
| **Auth** | JWT (jsonwebtoken), bcrypt |
| **Security** | Helmet, CORS, Rate Limiting, Input Validation (Joi) |
| **File Upload** | Multer |
| **Logging** | Winston |
| **API Docs** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Deployment** | Vercel (Frontend), Render (Backend), Neon (Database) |

---

## 📦 Project Structure

```
LoginApp/
├── backend/
│   ├── config/              # Database & app configuration
│   ├── controllers/         # Request handlers
│   ├── middleware/           # Auth, error handling, logging
│   ├── routes/              # API route definitions
│   │   └── v1/              # Versioned API routes
│   ├── services/            # Business logic layer
│   ├── repositories/        # Data access layer
│   ├── validators/          # Input validation (Joi)
│   ├── utils/               # Logger, helpers
│   ├── jobs/                # Scheduled tasks (node-cron)
│   ├── prisma/              # Prisma schema
│   ├── sql/                 # SQL setup scripts
│   ├── server.js            # Express app entry point
│   └── swagger.js           # API documentation config
│
├── frontend/
│   ├── src/
│   │   ├── api.js           # Centralized Axios instance
│   │   ├── pages/           # All page components
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (Auth, Leave)
│   │   ├── hooks/           # Custom hooks (useEmployee)
│   │   ├── redux/           # Redux store & slices
│   │   └── styles/          # CSS stylesheets
│   └── public/
│
├── render.yaml              # Render deployment config
├── vercel.json              # Vercel deployment config
└── docker-compose.yml       # Docker development setup
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (local or cloud)
- npm

### Step 1: Clone Repository

```bash
git clone https://github.com/sainandangupta/EventHub360.git
cd EventHub360
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your database credentials

# Run Prisma migrations
npm run prisma:migrate

# Start dev server
npm run dev
```

Backend runs on: `http://localhost:5000`

### Step 3: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Default: REACT_APP_API_URL=http://localhost:5000

# Start dev server
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/password/forgot-password` | Request password reset |
| POST | `/api/password/reset-password` | Reset password with token |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| POST | `/api/email/send-verification` | Send verification email |
| POST | `/api/email/verify-email` | Verify email with token |

### Employee Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/:id` | Get employee details |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/stats/dashboard` | Dashboard statistics |

### Leave Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leave/types` | Get leave types |
| POST | `/api/leave/apply` | Apply for leave |
| GET | `/api/leave/my-leaves` | My leave history |
| GET | `/api/leave/balance` | Leave balance |
| GET | `/api/leave/pending` | Pending approvals |
| PUT | `/api/leave/:id/approve` | Approve/reject leave |

### Asset Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | List all assets |
| POST | `/api/assets` | Register asset |
| PUT | `/api/assets/:id/allocate` | Allocate asset |
| PUT | `/api/assets/:id/return` | Return asset |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/stats` | Admin statistics |
| PUT | `/api/admin/users/:userId/role` | Change user role |
| DELETE | `/api/admin/users/:userId` | Delete user |

### Health & Docs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api-docs` | Swagger API docs |

---

## 🔑 Environment Variables

### Backend (`.env`)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/loginapp
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📚 Database Schema

### Core Tables (Prisma)
- **User** — id, name, email, password, role, verified, lastLogin
- **PasswordReset** — userId, token, expiresAt
- **RefreshToken** — userId, token, expiresAt
- **EmailVerification** — userId, token, expiresAt

### Extended Tables (SQL)
- **employees** — Full employee profiles with department, designation, salary, city, work_mode
- **departments** — Department master data
- **skills** / **employee_skills** — Skills management
- **leave_types** / **leave_balances** / **leave_applications** / **leave_approval_workflow** — Complete leave system
- **assets** / **asset_allocations** — Asset tracking
- **attendance** — Daily attendance records
- **salary_structures** / **payroll** — Salary & payroll
- **notifications** — In-app notifications
- **audit_logs** — System audit trail

---

## 🚀 Deployment

### 1. Cloud Database (Neon PostgreSQL)
1. Create account at [neon.tech](https://neon.tech)
2. Create project: `employee-management-system`
3. Copy connection string for `DATABASE_URL`

### 2. Backend (Render)
1. Login at [render.com](https://render.com) with GitHub
2. New → Web Service → Select repository
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
4. Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - `JWT_SECRET` = Strong random string
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = Your Vercel URL
5. Deploy → Get backend URL

### 3. Frontend (Vercel)
1. Login at [vercel.com](https://vercel.com) with GitHub
2. Import project → Select repository
3. Settings:
   - **Root Directory:** (leave empty — uses root `vercel.json`)
   - **Framework:** Create React App
4. Environment Variables:
   - `REACT_APP_API_URL` = Your Render backend URL
5. Deploy → Get frontend URL

### 4. Post-Deployment
- Update `FRONTEND_URL` on Render with the Vercel URL
- Redeploy backend to enable CORS
- Test `GET /api/health` → `{ "status": "UP" }`

---

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with configurable expiry
- ✅ Refresh token rotation
- ✅ Role-based access control (Admin/Manager/HR/User)
- ✅ Email verification
- ✅ Password reset with 15-minute expiry
- ✅ CORS restricted to frontend domain
- ✅ Helmet security headers
- ✅ Rate limiting on auth endpoints
- ✅ Input validation with Joi
- ✅ SQL injection prevention (parameterized queries + Prisma)

---

## 📝 License

MIT License — feel free to use for personal and educational projects.

---

**Built with ❤️ by Sainandan Gupta**  
*React • Node.js • PostgreSQL • Express • Prisma*
