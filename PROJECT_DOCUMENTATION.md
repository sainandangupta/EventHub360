# 📋 Employee Management System — Project Documentation

**Project Name:** Employee Management System  
**Developer:** Sainandan Gupta  
**Repository:** [https://github.com/sainandangupta/EventHub360](https://github.com/sainandangupta/EventHub360)  
**Date:** June 2026

---

## 1. Project Overview

The **Employee Management System** is a full-stack web application designed to manage the entire employee lifecycle within an organization. It provides comprehensive tools for HR administrators, managers, and employees to handle day-to-day workforce operations.

### Purpose
To build a production-grade, deployable web application that demonstrates mastery of modern full-stack development including React, Node.js, PostgreSQL, REST APIs, authentication, and cloud deployment.

### Key Capabilities
- **Authentication:** Secure signup/login with JWT, email verification, password reset
- **Employee Management:** Complete CRUD with department and skill tracking
- **Leave Management:** Multi-level approval workflows with balance tracking
- **Asset Management:** Asset registration, allocation, and return tracking
- **Attendance:** Daily attendance with trend analytics
- **Salary & Payroll:** Salary structure, payroll generation, TDS/PF/ESIC compliance
- **Reports:** Enterprise analytics with Excel export
- **Audit Trail:** Full system activity logging

---

## 2. System Modules

### 2.1 Authentication Module
| Feature | Description |
|---------|-------------|
| Signup | User registration with bcrypt password hashing |
| Login | JWT token-based authentication |
| Email Verification | Token-based email confirmation |
| Forgot Password | Reset with 15-minute expiry token |
| Refresh Tokens | Access + refresh token rotation |
| RBAC | Admin, Manager, HR, User roles |

### 2.2 Employee Module
| Feature | Description |
|---------|-------------|
| Create Employee | Full profile with department, designation, salary, city, work mode |
| Employee List | Paginated list with search and filter |
| Employee Detail | Comprehensive profile view with skills and documents |
| Update Employee | Edit all employee fields |
| Delete Employee | Soft delete with confirmation |
| File Upload | Employee documents and photos (Multer) |

### 2.3 Leave Module
| Feature | Description |
|---------|-------------|
| Leave Types | Configurable types (Casual, Sick, Earned, etc.) |
| Apply Leave | Date range, type, reason |
| My Leaves | Personal leave history with status |
| Leave Balance | Real-time balance per type |
| Approvals | Manager/HR approval workflow |
| Reports | Department-wise, type-wise analytics |

### 2.4 Asset Module
| Feature | Description |
|---------|-------------|
| Asset Registry | Register laptops, phones, accessories |
| Allocate | Assign to employees with tracking |
| Return | Process asset returns |
| Reports | Allocated vs available analytics |

### 2.5 Attendance Module
| Feature | Description |
|---------|-------------|
| Check-in/Check-out | Daily attendance tracking |
| Dashboard | Present/absent counts |
| Trends | 7-day attendance trend charts |
| Reports | Attendance rate analytics |

### 2.6 Salary & Payroll Module
| Feature | Description |
|---------|-------------|
| Salary Structure | Base, HRA, DA, allowances configuration |
| Payroll Generation | Monthly payroll with deductions |
| TDS Reports | Annual tax deduction summary |
| PF/ESIC Reports | Monthly compliance reporting |

### 2.7 Administration Module
| Feature | Description |
|---------|-------------|
| User Management | View, edit roles, delete users |
| Audit Logs | Complete activity trail |
| Notifications | System-wide notification center |
| Dashboard Stats | Real-time KPI metrics |

---

## 3. Database Design

### 3.1 Entity Relationship Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      Users       │────→│  PasswordReset   │     │   RefreshToken   │
│                  │────→│                  │     │                  │
│ id (PK)          │     │ userId (FK)      │     │ userId (FK)      │
│ name             │     │ token            │     │ token            │
│ email (unique)   │     │ expiresAt        │     │ expiresAt        │
│ password         │     └──────────────────┘     └──────────────────┘
│ role             │
│ verified         │     ┌──────────────────┐
│ lastLogin        │────→│EmailVerification │
│ createdAt        │     │ userId (FK)      │
└──────────────────┘     │ token            │
                         │ expiresAt        │
                         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Employees      │────→│  Departments     │     │     Skills       │
│                  │     │                  │     │                  │
│ id (PK)          │     │ id (PK)          │     │ id (PK)          │
│ name             │     │ name             │     │ skill_name       │
│ email            │     └──────────────────┘     └──────────────────┘
│ phone            │                                       │
│ department_id    │     ┌──────────────────┐              │
│ designation      │     │ Employee_Skills  │◄─────────────┘
│ salary           │────→│ employee_id (FK) │
│ city             │     │ skill_id (FK)    │
│ work_mode        │     └──────────────────┘
│ address          │
└──────────────────┘
        │
        ├──→ Leave Applications ──→ Leave Approval Workflow
        ├──→ Asset Allocations
        ├──→ Attendance Records
        ├──→ Salary Structures ──→ Payroll Records
        └──→ Employee Images
```

### 3.2 Table Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Authentication accounts | id, name, email, password, role, verified |
| `employees` | Employee profiles | id, name, email, phone, department_id, designation, salary, city, work_mode |
| `departments` | Department master | id, name |
| `skills` | Skills master | id, skill_name |
| `employee_skills` | Employee-skill mapping | employee_id, skill_id |
| `leave_types` | Leave type configuration | id, name, max_days |
| `leave_balances` | Per-employee leave balances | employee_id, leave_type_id, balance, used |
| `leave_applications` | Leave requests | id, employee_id, leave_type_id, start_date, end_date, status |
| `leave_approval_workflow` | Approval history | id, leave_application_id, approver_id, action, remarks |
| `assets` | Asset registry | id, name, type, serial_number, status |
| `asset_allocations` | Asset-employee mapping | id, asset_id, employee_id, allocated_date |
| `attendance` | Daily attendance | id, employee_id, date, status, check_in, check_out |
| `salary_structures` | Salary components | id, employee_id, basic, hra, da, allowances |
| `payroll` | Monthly payroll | id, employee_id, month, year, gross, deductions, net |
| `notifications` | System notifications | id, user_id, message, read, created_at |
| `audit_logs` | Activity trail | id, user_id, action, entity, entity_id, timestamp |

---

## 4. API Endpoints

### 4.1 Authentication APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & get JWT |
| POST | `/api/password/forgot-password` | ❌ | Request reset email |
| POST | `/api/password/reset-password` | ❌ | Reset with token |
| POST | `/api/token/refresh-token` | ✅ | Refresh access token |
| POST | `/api/token/logout` | ✅ | Invalidate refresh token |

### 4.2 Employee APIs
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/employees` | ✅ | Any | List employees |
| POST | `/api/employees` | ✅ | Any | Create employee |
| GET | `/api/employees/:id` | ✅ | Any | Get employee |
| PUT | `/api/employees/:id` | ✅ | Any | Update employee |
| DELETE | `/api/employees/:id` | ✅ | Any | Delete employee |
| POST | `/api/employees/upload/:id` | ✅ | Any | Upload documents |
| GET | `/api/employees/stats/dashboard` | ✅ | Any | Dashboard stats |

### 4.3 Leave APIs
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/leave/types` | ✅ | Any | Leave types |
| POST | `/api/leave/apply` | ✅ | User/Manager | Apply leave |
| GET | `/api/leave/my-leaves` | ✅ | Any | My leave history |
| GET | `/api/leave/balance` | ✅ | Any | My balance |
| GET | `/api/leave/pending` | ✅ | Manager/HR | Pending approvals |
| PUT | `/api/leave/:id/approve` | ✅ | Manager/HR | Approve/reject |
| PUT | `/api/leave/:id/cancel` | ✅ | Any | Cancel leave |
| GET | `/api/leave/dashboard-stats` | ✅ | Any | Leave statistics |

### 4.4 Asset APIs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/assets` | ✅ | List assets |
| POST | `/api/assets` | ✅ | Create asset |
| GET | `/api/assets/:id` | ✅ | Asset detail |
| PUT | `/api/assets/:id/allocate` | ✅ | Allocate asset |
| PUT | `/api/assets/:id/return` | ✅ | Return asset |

### 4.5 Admin APIs
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/admin/users` | ✅ | Admin | All users |
| GET | `/api/admin/stats` | ✅ | Admin | System stats |
| PUT | `/api/admin/users/:id/role` | ✅ | Admin | Change role |
| DELETE | `/api/admin/users/:id` | ✅ | Admin | Delete user |

---

## 5. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└──────────────┬──────────────────────────┬────────────────────┘
               │                          │
    ┌──────────▼──────────┐    ┌──────────▼──────────┐
    │      Vercel          │    │      Render          │
    │  (React Frontend)    │───→│  (Node.js Backend)   │
    │                      │    │                      │
    │  • Static hosting    │    │  • Express.js API    │
    │  • CDN delivery      │    │  • JWT auth          │
    │  • Auto SSL          │    │  • Rate limiting     │
    │  • SPA routing       │    │  • Swagger docs      │
    └──────────────────────┘    └──────────┬───────────┘
                                           │
                                ┌──────────▼──────────┐
                                │   Neon PostgreSQL    │
                                │  (Cloud Database)    │
                                │                      │
                                │  • Auto-scaling      │
                                │  • SSL connections   │
                                │  • Daily backups     │
                                └──────────────────────┘
```

### Deployment URLs
| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | `https://your-app.vercel.app` |
| Backend API | Render | `https://your-api.onrender.com` |
| Database | Neon | `postgresql://...@neon.tech/neondb` |
| API Docs | Render | `https://your-api.onrender.com/api-docs` |
| Health Check | Render | `https://your-api.onrender.com/api/health` |

---

## 6. Screenshots

> **Note:** Screenshots should be captured after deployment and added to this section.

### Suggested Screenshots:
1. Login Page
2. Signup Page
3. Main Dashboard (with charts)
4. Employee List
5. Employee Detail/Edit
6. Leave Application Form
7. Leave Approvals
8. Asset Management
9. Attendance Dashboard
10. Salary & Payroll
11. Reports with Export
12. Admin Dashboard
13. Audit Logs

---

## 7. Future Enhancements

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Email Service Integration | High | Real SMTP setup for verification/reset emails |
| Employee Self-Service Portal | High | Allow employees to update their own profiles |
| Performance Reviews | Medium | Annual/quarterly review workflows |
| Training Management | Medium | Track employee training and certifications |
| Recruitment Module | Medium | Job postings, applications, interview scheduling |
| Mobile App | Low | React Native companion app |
| Real-time Notifications | Low | WebSocket-based push notifications |
| SSO Integration | Low | Google/Microsoft OAuth login |
| Multi-tenancy | Low | Support multiple organizations |
| AI-powered Analytics | Low | Predictive attrition, workload balancing |

---

## 8. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Hardcoded API URLs | Created centralized `api.js` with `REACT_APP_API_URL` env var |
| CORS in production | Dynamic CORS origin using `FRONTEND_URL` env var |
| Database schema evolution | Combined Prisma ORM with raw SQL for extended modules |
| Role-based UI rendering | Protected routes with `allowedRoles` prop |
| Complex approval workflows | Multi-step leave approval with status tracking |
| Large dataset handling | Server-side pagination with configurable limits |

---

## 9. Learning Outcomes

1. **Full-Stack Architecture** — Designed and built a complete 3-tier application
2. **REST API Design** — Created versioned, documented APIs with Swagger
3. **Database Design** — Normalized schema with foreign keys and constraints
4. **Authentication** — Implemented JWT with refresh tokens and RBAC
5. **State Management** — Used Redux Toolkit and React Context
6. **Cloud Deployment** — Deployed to Vercel, Render, and Neon PostgreSQL
7. **Security Best Practices** — Applied Helmet, rate limiting, input validation
8. **Code Organization** — Modular architecture with controllers, services, repositories

---

*Document prepared by Sainandan Gupta — June 2026*
