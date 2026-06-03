# 🏢 Employee Profile Management System - Complete Implementation

**Day 3 Advanced Task**

---

## 📋 Objective

After Login, students should be able to:
1. ✅ Login to Dashboard
2. ✅ Create Employee Profiles
3. ✅ Upload Multiple Images
4. ✅ Assign Departments
5. ✅ Assign Skills
6. ✅ View Employee List
7. ✅ Perform SQL JOIN Queries

---

## 🗄️ Database Design

### **Table 1: Users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user'
);
```

### **Table 2: Departments**
```sql
CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100)
);

-- Sample Data
INSERT INTO departments(department_name)
VALUES
('IT'),
('HR'),
('Finance'),
('Marketing');
```

### **Table 3: Employee Profile**
```sql
CREATE TABLE employee_profiles(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    department_id INT REFERENCES departments(id),
    phone VARCHAR(20),
    address TEXT,
    designation VARCHAR(100),
    salary NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Table 4: Employee Images** (One-to-Many)
```sql
CREATE TABLE employee_images(
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id),
    image_url TEXT
);
```

### **Table 5: Skills**
```sql
CREATE TABLE skills(
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100)
);

-- Sample Data
INSERT INTO skills(skill_name)
VALUES
('React'),
('NodeJS'),
('PostgreSQL'),
('Python'),
('Java');
```

### **Table 6: Employee Skills** (Many-to-Many)
```sql
CREATE TABLE employee_skills(
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id),
    skill_id INT REFERENCES skills(id)
);
```

---

## 🏗️ Relationship Diagram

```
Users (1) ──── (Many) Employee Profiles
              ↓
         Departments (1) ──── (Many) Employee Profiles
         
Employee Profiles (1) ──── (Many) Employee Images
Employee Profiles (1) ──── (Many) Employee Skills (Many) ──── (1) Skills
```

---

## 📡 Backend API Endpoints

### **Department APIs**
```
GET    /api/departments           - Get all departments
POST   /api/departments           - Create new department
PUT    /api/departments/:id       - Update department
DELETE /api/departments/:id       - Delete department
```

### **Skills APIs**
```
GET    /api/skills                - Get all skills
POST   /api/skills                - Create new skill
PUT    /api/skills/:id            - Update skill
DELETE /api/skills/:id            - Delete skill
```

### **Employee APIs**
```
POST   /api/employees             - Create employee profile
GET    /api/employees             - Get all employees
GET    /api/employees/:id         - Get employee by ID
PUT    /api/employees/:id         - Update employee
DELETE /api/employees/:id         - Delete employee
```

### **Image Upload API**
```
POST   /api/employees/upload      - Upload employee images
GET    /api/employees/:id/images  - Get employee images
DELETE /api/employees/images/:id  - Delete image
```

---

## 🖼️ Image Upload Setup

### **Install Multer**
```bash
npm install multer
```

### **Folder Structure**
```
backend/
├── uploads/
│   ├── employee_1.jpg
│   ├── employee_2.jpg
│   └── ...
└── routes/
    └── employeeRoutes.js
```

### **Multer Configuration**
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and PDFs Only!');
    }
  }
});

module.exports = upload;
```

### **Upload API Endpoint**
```javascript
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');

// Upload multiple images
router.post('/upload/:employeeId', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Insert images into database
    for (let file of req.files) {
      await pool.query(
        `INSERT INTO employee_images (employee_id, image_url) 
         VALUES ($1, $2)`,
        [employeeId, file.filename]
      );
    }

    res.json({
      message: `${req.files.length} images uploaded successfully`,
      files: req.files
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
```

---

## 📊 Dashboard Statistics API

```javascript
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const employees = await pool.query('SELECT COUNT(*) FROM employee_profiles');
    const departments = await pool.query('SELECT COUNT(*) FROM departments');
    const skills = await pool.query('SELECT COUNT(*) FROM skills');
    const images = await pool.query('SELECT COUNT(*) FROM employee_images');

    res.json({
      total_employees: employees.rows[0].count,
      total_departments: departments.rows[0].count,
      total_skills: skills.rows[0].count,
      total_images: images.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

---

## 🔗 SQL JOIN Queries

### **Join 1: Employee with Department and User**
```sql
SELECT
  u.name as employee_name,
  d.department_name,
  ep.designation,
  ep.salary

FROM employee_profiles ep

INNER JOIN users u
  ON ep.user_id = u.id

INNER JOIN departments d
  ON ep.department_id = d.id;
```

### **Join 2: Employee with Skills**
```sql
SELECT
  u.name as employee_name,
  s.skill_name,
  d.department_name

FROM employee_skills es

INNER JOIN employee_profiles ep
  ON es.employee_id = ep.id

INNER JOIN users u
  ON ep.user_id = u.id

INNER JOIN skills s
  ON es.skill_id = s.id

INNER JOIN departments d
  ON ep.department_id = d.id;
```

### **Join 3: Employee with Images Count**
```sql
SELECT
  u.name as employee_name,
  ep.designation,
  COUNT(ei.id) as total_images

FROM employee_profiles ep

INNER JOIN users u
  ON ep.user_id = u.id

LEFT JOIN employee_images ei
  ON ep.id = ei.employee_id

GROUP BY u.name, ep.designation;
```

---

## 🎨 Frontend Pages Required

1. **Login.js** - User authentication
2. **Signup.js** - User registration
3. **Dashboard.js** - Statistics & overview
4. **EmployeeList.js** - View all employees
5. **CreateEmployee.js** - Add new employee
6. **EditEmployee.js** - Update employee
7. **EmployeeDetail.js** - View employee details
8. **DepartmentMaster.js** - Manage departments
9. **SkillsMaster.js** - Manage skills
10. **ImageUpload.js** - Upload employee images

---

## 📱 Dashboard Cards

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Employees     │  │  Departments    │  │    Skills       │  │   Images        │
│      150        │  │       5         │  │       20        │  │      300        │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🚀 Create Employee Form

```javascript
// Frontend - CreateEmployee.js
import { useState } from 'react';
import axios from 'axios';

function CreateEmployee() {
  const [form, setForm] = useState({
    phone: '',
    address: '',
    designation: '',
    salary: '',
    department_id: '',
    skills: []
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSkillChange = (skillId) => {
    if (form.skills.includes(skillId)) {
      setForm({ ...form, skills: form.skills.filter(id => id !== skillId) });
    } else {
      setForm({ ...form, skills: [...form.skills, skillId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // Create employee profile
      const res = await axios.post(
        'http://localhost:5000/api/employees',
        form,
        { headers: { Authorization: token } }
      );

      const employeeId = res.data.employee_id;

      // Upload images
      const formData = new FormData();
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }

      await axios.post(
        `http://localhost:5000/api/employees/upload/${employeeId}`,
        formData,
        { 
          headers: { 
            Authorization: token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Employee created with images!');
      window.location.href = '/employees';
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating employee');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Employee Profile</h2>
      
      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        onChange={handleChange}
        required
      />
      
      <input
        type="text"
        name="address"
        placeholder="Address"
        onChange={handleChange}
        required
      />
      
      <input
        type="text"
        name="designation"
        placeholder="Designation"
        onChange={handleChange}
        required
      />
      
      <input
        type="number"
        name="salary"
        placeholder="Salary"
        onChange={handleChange}
        required
      />
      
      <select name="department_id" onChange={handleChange} required>
        <option>Select Department</option>
        <option value="1">IT</option>
        <option value="2">HR</option>
        <option value="3">Finance</option>
        <option value="4">Marketing</option>
      </select>
      
      <div>
        <h3>Select Skills</h3>
        <label>
          <input type="checkbox" onChange={() => handleSkillChange(1)} /> React
        </label>
        <label>
          <input type="checkbox" onChange={() => handleSkillChange(2)} /> NodeJS
        </label>
        <label>
          <input type="checkbox" onChange={() => handleSkillChange(3)} /> PostgreSQL
        </label>
        <label>
          <input type="checkbox" onChange={() => handleSkillChange(4)} /> Python
        </label>
        <label>
          <input type="checkbox" onChange={() => handleSkillChange(5)} /> Java
        </label>
      </div>
      
      <input
        type="file"
        multiple
        onChange={handleImageChange}
        accept="image/*, .pdf"
        required
      />
      
      <button type="submit">Create Employee</button>
    </form>
  );
}

export default CreateEmployee;
```

---

## 🔄 Employee List Component

```javascript
// Frontend - EmployeeList.js
import { useEffect, useState } from 'react';
import axios from 'axios';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    axios.get('http://localhost:5000/api/employees', {
      headers: { Authorization: token }
    })
      .then(res => {
        setEmployees(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Employee List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.department_name}</td>
              <td>{emp.designation}</td>
              <td>${emp.salary}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
                <button>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;
```

---

## 📊 Dashboard Component

```javascript
// Frontend - Dashboard.js
import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    axios.get('http://localhost:5000/api/dashboard/stats', {
      headers: { Authorization: token }
    })
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>
        <h3>Employees</h3>
        <h1>{stats?.total_employees || 0}</h1>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>
        <h3>Departments</h3>
        <h1>{stats?.total_departments || 0}</h1>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>
        <h3>Skills</h3>
        <h1>{stats?.total_skills || 0}</h1>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', textAlign: 'center' }}>
        <h3>Images</h3>
        <h1>{stats?.total_images || 0}</h1>
      </div>
    </div>
  );
}

export default Dashboard;
```

---

## 📋 Today's Deliverables

### **Backend**
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ CRUD APIs (Departments, Skills, Employees)
- ✅ Image Upload API (Multer)
- ✅ SQL JOIN Queries
- ✅ Dashboard Statistics API

### **Frontend**
- ✅ Dashboard with Statistics Cards
- ✅ Employee Form with Validation
- ✅ Multiple Image Upload
- ✅ Employee List with Pagination
- ✅ Department Dropdown
- ✅ Skills Multi-Select Checkboxes
- ✅ Protected Routes

---

## 🚀 Deployment Steps

### **Step 1: Push Code to GitHub**
```bash
git add .
git commit -m "Employee Management System Implementation"
git push origin main
```

### **Step 2: Backend Deployment on Render**

1. Go to https://render.com
2. Create New Web Service
3. Connect GitHub
4. Set Environment Variables:
   ```
   PORT=5000
   DATABASE_URL=postgresql://...
   JWT_SECRET=your_secret
   ```
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Deploy

### **Step 3: PostgreSQL Cloud Database**

1. Go to https://neon.tech
2. Create Project
3. Copy Connection String
4. Set DATABASE_URL in Render

### **Step 4: Frontend Deployment on Vercel**

1. Go to https://vercel.com
2. Import GitHub Repository
3. Select Frontend Folder
4. Framework: React
5. Environment: `REACT_APP_API_URL=https://your-backend.onrender.com`
6. Deploy

---

## ✅ Testing Checklist

- [ ] Create Employee Profile
- [ ] Upload 5 Images
- [ ] Select Department
- [ ] Select Multiple Skills
- [ ] View Employee List
- [ ] View Dashboard Statistics
- [ ] Run SQL JOINs
- [ ] Edit Employee
- [ ] Delete Employee
- [ ] Test Protected Routes

---

## 📚 What Students Learn

1. **Database Relationships**
   - One-to-Many (Employee → Images)
   - Many-to-Many (Employee ↔ Skills)

2. **SQL JOINs**
   - INNER JOIN
   - LEFT JOIN
   - Multiple JOINs

3. **File Upload**
   - Multer Configuration
   - File Validation
   - Storage Management

4. **Advanced APIs**
   - CRUD Operations
   - File Upload
   - Statistics Queries

5. **Frontend**
   - Form Validation
   - File Input Handling
   - Multi-Select Components
   - Table Display

---

## 🎯 Project Structure

```
LoginApp/
├── backend/
│   ├── routes/
│   │   ├── departmentRoutes.js
│   │   ├── skillRoutes.js
│   │   ├── employeeRoutes.js
│   │   └── imageRoutes.js
│   ├── middleware/
│   │   └── multer.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/pages/
│   │   ├── Dashboard.js
│   │   ├── EmployeeList.js
│   │   ├── CreateEmployee.js
│   │   ├── EditEmployee.js
│   │   ├── DepartmentMaster.js
│   │   └── SkillsMaster.js
│   └── package.json
```

---

**This is your complete Day 3 Advanced Implementation! 🎉**
