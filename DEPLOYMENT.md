# 🚀 Deployment Guide - Phase 10

Complete guide to deploy your full-stack authentication app to production.

---

## **Step 1: Deploy Backend to Render**

### Prerequisites
- GitHub account (push your code there)
- Render account (https://render.com)

### Steps

1. **Push backend to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to https://dashboard.render.com
   - Click "Create New" → "Web Service"
   - Connect your GitHub repository
   - Select backend folder
   - Set Environment Variables:
     ```
     PORT=5000
     DB_USER=your_db_user
     DB_HOST=your_db_host
     DB_NAME=your_db_name
     DB_PASSWORD=your_db_password
     DB_PORT=5432
     JWT_SECRET=your_jwt_secret
     DATABASE_URL=postgresql://...
     ```
   - Build Command: `npm install`
   - Start Command: `npm run dev`
   - Click "Create Web Service"

3. **Backend URL**: `https://your-backend.onrender.com`

---

## **Step 2: Deploy PostgreSQL Database to Neon**

### Steps

1. **Go to Neon** (https://neon.tech)
2. **Create Project**
   - Click "Create a project"
   - Give it a name
   - Select region closest to you
   - Click "Create project"

3. **Copy Connection String**
   - Look for "Connection string" in dashboard
   - Format: `postgresql://user:password@host/database`
   - Update your `.env` file with this

4. **Run Database Migrations** (on your machine)
   ```bash
   npm run prisma:migrate
   ```

---

## **Step 3: Deploy Frontend to Vercel**

### Prerequisites
- GitHub account with frontend code
- Vercel account (https://vercel.com)

### Steps

1. **Push frontend to GitHub**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   git push origin main
   ```

2. **Create Vercel Project**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Select "frontend" folder
   - Set Environment Variables:
     ```
     REACT_APP_API_URL=https://your-backend.onrender.com
     ```
   - Click "Deploy"

3. **Frontend URL**: `https://your-frontend.vercel.app`

---

## **Step 4: Update Frontend API Endpoint**

Replace all API calls from `http://localhost:5000` to your deployed backend:

**File: `frontend/src/pages/Login.js`**
```javascript
const res = await axios.post(
  "https://your-backend.onrender.com/api/auth/login",
  form
);
```

---

## **Step 5: Update CORS on Backend**

**File: `backend/server.js`**
```javascript
app.use(cors({
  origin: "https://your-frontend.vercel.app",
  credentials: true
}));
```

---

## **Step 6: Verify Deployment**

1. **Test Backend API**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

2. **Test Frontend**
   - Visit: `https://your-frontend.vercel.app`
   - Try signing up
   - Try logging in
   - Check dashboard

3. **Test Database Connection**
   - Backend should connect to Neon DB
   - Check Render logs for any errors

---

## **Step 7: Setup Email Service (Optional)**

For email verification and password reset:

### Using Brevo
1. Sign up at https://www.brevo.com
2. Get API key
3. Install:
   ```bash
   npm install nodemailer
   ```
4. Create `backend/services/emailService.js`:
   ```javascript
   const nodemailer = require("nodemailer");
   
   const transporter = nodemailer.createTransport({
     host: "smtp-relay.brevo.com",
     port: 587,
     auth: {
       user: process.env.BREVO_EMAIL,
       pass: process.env.BREVO_API_KEY
     }
   });
   
   exports.sendEmail = async (to, subject, html) => {
     return transporter.sendMail({
       from: "your-email@example.com",
       to,
       subject,
       html
     });
   };
   ```

---

## **Production Checklist**

- [ ] Backend deployed to Render
- [ ] Database migrated to Neon
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on all platforms
- [ ] CORS configured for production domain
- [ ] API endpoints updated in frontend
- [ ] SSL certificates active
- [ ] Database backups enabled
- [ ] Monitoring/logging enabled
- [ ] Email service configured (optional)

---

## **Common Issues & Fixes**

### **Issue: "Cannot connect to database"**
- Check DATABASE_URL in .env
- Verify Neon credentials
- Check firewall settings

### **Issue: "CORS error"**
- Update cors origin in backend/server.js
- Make sure frontend URL is correct

### **Issue: "Prisma client not found"**
- Run: `npm run prisma:generate`
- Commit `.prisma` folder

### **Issue: "JWT token invalid"**
- Make sure JWT_SECRET is same on all environments
- Check token expiry time

---

## **Monitoring & Maintenance**

1. **Set up error tracking**
   - Use Sentry for error monitoring
   - Setup email alerts for failures

2. **Database backups**
   - Enable automatic backups on Neon
   - Test restore periodically

3. **Performance monitoring**
   - Use New Relic or DataDog
   - Monitor API response times

4. **Security**
   - Enable rate limiting on backend
   - Use HTTPS everywhere
   - Keep dependencies updated

---

## **Next Steps**

1. Add email verification (Phase 5)
2. Setup refresh tokens (Phase 6)
3. Implement role-based access (Phase 7)
4. Add logging and monitoring
5. Setup automated testing in CI/CD

---

**All set! Your app is now live in production! 🎉**
