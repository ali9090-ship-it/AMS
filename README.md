# <img width="64" height="64" alt="image" src="https://github.com/user-attachments/assets/fcf2ab25-3f12-4e64-a15e-680aedbe805e" /> AMS — Academic Management System
### M.H. Saboo Siddik College of Engineering, Mumbai

A full-stack Academic Management System built for MHSSCE to digitize and streamline student, teacher, and administrative workflows across the institution.

---

## 📌 Live Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@mhssce.ac.in` | `admin123` |
| Teacher | `teacher.cs@mhssce.ac.in` | `password123` |
| Student | `student.216001.cs@mhssce.ac.in` | `password123` |

> ⚠️ Admin must create and activate all accounts. Self-registration is disabled by design.  
> New accounts created via Admin or Bulk Import use the default password `default123` unless specified.

---

## 🚀 Features

### 👨‍🎓 Student Portal
- View enrolled courses, attendance records, and exam results
- Download study notes and materials uploaded by teachers
- Track placement applications and scholarship status
- Submit anonymous or named course feedback
- View exam timetables and announcements
- Upload and crop profile photo with built-in image editor

### 👩‍🏫 Teacher Portal
- Mark daily attendance for enrolled students
- Enter and update marks (Internal, Mid-Sem, End-Sem)
- Upload study notes and materials (PDF, DOCX, PPTX)
- View AI-powered student risk analysis
- Access course feedback analytics

### 🛠️ Admin Portal
- Create and manage all user accounts (students, teachers, admins)
- Bulk import users via CSV upload
- Build courses, assign teachers, enroll students
- Post placement drives and manage applications
- Create scholarships and approve applicants
- Publish announcements and exam schedules
- Export reports as CSV

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript (Vite) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Python 3.13 + Flask |
| Database | MySQL (via MAMP) |
| Auth | JWT (PyJWT + bcrypt) |
| File Storage | Local server (`uploads/` folder) |
| AI Features | Custom risk scoring + eligibility engine |

---

## 📂 Project Structure

```
ams_low/
├── backend/                        ← Python Flask backend
│   ├── app/
│   │   ├── __init__.py             ← App factory + route registration
│   │   ├── config.py               ← Environment config
│   │   ├── database.py             ← SQLAlchemy DB connection
│   │   ├── limiter.py              ← Rate limiting config
│   │   ├── models/                 ← Database models
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── attendance.py
│   │   │   ├── result.py
│   │   │   ├── note.py
│   │   │   ├── announcement.py
│   │   │   ├── exam_schedule.py
│   │   │   ├── placement.py
│   │   │   ├── scholarship.py
│   │   │   ├── feedback.py
│   │   │   ├── admission.py
│   │   │   └── setting.py
│   │   ├── routes/                 ← API endpoints (Flask Blueprints)
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── courses.py
│   │   │   ├── attendance.py
│   │   │   ├── results.py
│   │   │   ├── notes.py
│   │   │   ├── announcements.py
│   │   │   ├── exams.py
│   │   │   ├── placement.py
│   │   │   ├── scholarships.py
│   │   │   ├── feedback.py
│   │   │   ├── admissions.py
│   │   │   ├── reports.py
│   │   │   ├── settings.py
│   │   │   └── ai.py
│   │   ├── middleware/
│   │   │   └── auth.py             ← JWT @token_required + @role_required
│   │   └── utils/
│   │       ├── files.py            ← File upload/delete helpers
│   │       ├── responses.py        ← Standardized API response wrapper
│   │       └── risk.py             ← Risk score calculation utility
│   ├── uploads/                    ← Uploaded files (git-ignored)
│   │   ├── notes/
│   │   ├── resumes/
│   │   ├── brochures/
│   │   ├── admissions/
│   │   └── avatars/
│   ├── seed.py                     ← Database seeder
│   ├── run.py                      ← Flask entry point
│   ├── requirements.txt
│   └── .env                        ← Environment variables (git-ignored)
│
├── src/                            ← React frontend source
│   ├── components/                 ← Reusable UI components
│   │   ├── ImageCropper.tsx        ← Profile photo crop & adjust
│   │   ├── AttendanceCalculator.tsx
│   │   ├── RequireAuth.tsx         ← Route guards
│   │   ├── AppSidebar.tsx          ← Student sidebar
│   │   ├── TeacherSidebar.tsx      ← Teacher sidebar
│   │   ├── AdminSidebar.tsx        ← Admin sidebar
│   │   ├── animations/             ← Transition & animation wrappers
│   │   └── ui/                     ← shadcn/ui primitives
│   ├── contexts/
│   │   └── AuthContext.tsx         ← Auth state management
│   ├── lib/
│   │   ├── api.ts                  ← API fetch/upload utility with JWT
│   │   └── auth.ts                 ← Email validation + role detection
│   └── pages/
│       ├── LoginPage.tsx
│       ├── DashboardPage.tsx
│       ├── ProfilePage.tsx
│       ├── AttendancePage.tsx
│       ├── ResultsPage.tsx
│       ├── NotesPage.tsx
│       ├── NotificationsPage.tsx
│       ├── admin/                  ← Admin portal pages
│       │   ├── AdminDashboard.tsx
│       │   ├── AdminUsersPage.tsx
│       │   ├── AdminCoursesPage.tsx
│       │   ├── AdminPlacementPage.tsx
│       │   ├── AdminScholarshipsPage.tsx
│       │   ├── AdminFeedbackPage.tsx
│       │   ├── AdminAdmissionsPage.tsx
│       │   └── AdminSettingsPage.tsx
│       ├── teacher/                ← Teacher portal pages
│       │   ├── TeacherDashboard.tsx
│       │   ├── TeacherAttendancePage.tsx
│       │   ├── TeacherMarksPage.tsx
│       │   ├── TeacherClassesPage.tsx
│       │   ├── TeacherStudentsPage.tsx
│       │   ├── TeacherFeedbackPage.tsx
│       │   └── TeacherPlacementPage.tsx
│       └── student/                ← Student portal pages
│           ├── StudentPlacementPage.tsx
│           ├── StudentScholarshipsPage.tsx
│           ├── StudentFeedbackPage.tsx
│           └── StudentAdmissionsPage.tsx
│
├── public/
│   └── ams-logo.png                ← AMS favicon / logo
├── .env.local                      ← Frontend env (VITE_API_URL)
├── index.html
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL (via [MAMP](https://www.mamp.info/) recommended for Mac)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/AMS-MHSSCE.git
cd AMS-MHSSCE
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=mysql+pymysql://root:root@localhost:8889/ams_db
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE_DAYS=7
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE_MB=20
FLASK_ENV=development
FLASK_DEBUG=True
```

> **Note:** If using MAMP on Mac, MySQL runs on port `8889` by default (not `3306`).

Seed the database with test data:

```bash
python seed.py
```

Start the backend server:

```bash
flask run --port 5001
```

Backend running at: `http://localhost:5001`

---

### 3️⃣ Frontend Setup

Open a new terminal from the project root:

```bash
npm install
```

Create `.env.local` in the **project root** (not inside `src/`):

```env
VITE_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

Frontend running at: `http://localhost:8080`

---

### 4️⃣ Open in Browser

```
http://localhost:8080
```

Login with admin credentials and start creating courses, teachers, and students.

---

## 🔄 System Workflow

```
Admin creates users → Admin creates courses → Admin assigns teachers
    ↓
Admin enrolls students in courses
    ↓
Teacher marks attendance → Student sees attendance records
Teacher enters marks    → Student sees results + SGPA
Teacher uploads notes   → Student downloads files
    ↓
Admin posts announcements → All users see notifications
Admin posts drives        → Students apply for placement
Admin creates scholarships → AI checks eligibility → Students apply
    ↓
Students submit feedback → Teacher views analytics
AI calculates risk scores → Teacher identifies at-risk students
```
<img width="720" height="826" alt="image" src="https://github.com/user-attachments/assets/1a84d52d-dee0-4aff-be28-9ffaa05dab5f" />

---

## Features

| Feature | Description |
|---------|-------------|
| Success Guardian | Calculates risk score (0–100) per student based on attendance + marks |
| Scholarship Eligibility | Checks student SGPA against scholarship criteria automatically |

**Risk Score Formula:**
```
risk = 0
if attendance < 75%:  risk += 40
if attendance < 65%:  risk += 20  (additional)
if avg_marks < 40%:   risk += 40
if avg_marks < 30%:   risk += 20  (additional)
risk_score = min(risk, 100)

HIGH RISK   = 75–100  🔴
MEDIUM RISK = 50–74   🟡
LOW RISK    = 0–49    🟢
```

---

## 🔐 Authentication

- Only admin-created accounts can login
- New accounts start as `Pending` — admin must activate before login
- JWT tokens expire in 7 days
- Login is rate-limited to 5 attempts per minute per user
- Email format enforces role detection:
  - Student: `name.rollno.branch@mhssce.ac.in`
  - Teacher: `name.branch@mhssce.ac.in`
  - Admin: `admin@mhssce.ac.in`

---

## 📁 File Storage

All uploaded files are stored locally on the server:

| File Type | Folder | Allowed Formats |
|-----------|--------|-----------------|
| Study notes | `uploads/notes/` | PDF, DOCX, PPTX, XLSX, ZIP |
| Student resumes | `uploads/resumes/` | PDF, DOCX |
| Job brochures | `uploads/brochures/` | PDF, DOCX |
| Admission documents | `uploads/admissions/` | PDF, DOCX |
| Profile photos | `uploads/avatars/` | JPG, JPEG, PNG, WebP, GIF |

Files are served at: `http://localhost:5001/uploads/...`  
Maximum file size: **20 MB**

---

## 🧪 Running Tests

```bash
npm run test
```

---

## 📌 API Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login and get JWT |
| GET | `/api/auth/me` | All | Get current user profile |
| POST | `/api/auth/change-password` | All | Change password |
| GET | `/api/users` | Admin, Teacher | List users (filtered) |
| POST | `/api/users` | Admin | Create new user |
| POST | `/api/users/bulk` | Admin | Bulk create users |
| PUT | `/api/users/<id>` | Admin | Update user |
| DELETE | `/api/users/<id>` | Admin | Soft-delete user |
| POST | `/api/users/me/avatar` | All | Upload profile photo |
| PUT | `/api/users/me` | All | Update own profile |
| GET | `/api/courses` | All | Get courses (role-filtered) |
| POST | `/api/courses` | Admin | Create course |
| POST | `/api/attendance/mark` | Teacher | Mark attendance |
| GET | `/api/attendance/my` | Student | View own attendance |
| POST | `/api/results` | Teacher | Enter marks |
| GET | `/api/results/my` | Student | View own results |
| POST | `/api/notes` | Teacher | Upload study material |
| GET | `/api/notes` | All | List notes |
| GET | `/api/announcements` | All | List announcements |
| POST | `/api/announcements` | Admin | Create announcement |
| GET | `/api/exams` | All | List exam schedules |
| POST | `/api/exams` | Admin | Create exam schedule |
| GET | `/api/placement/jobs` | All | List placement drives |
| POST | `/api/placement/jobs` | Admin | Create placement drive |
| POST | `/api/placement/jobs/<id>/apply` | Student | Apply to placement |
| GET | `/api/scholarships` | All | List scholarships |
| POST | `/api/scholarships` | Admin | Create scholarship |
| POST | `/api/feedback` | Student | Submit course feedback |
| GET | `/api/feedback` | Teacher, Admin | View feedback analytics |
| GET | `/api/ai/risk-score/<id>` | Teacher, Admin | Get student risk score |
| GET | `/api/ai/at-risk-students` | Teacher, Admin | List at-risk students |
| GET | `/api/ai/scholarship-eligibility` | Student | Check AI eligibility |
| GET | `/api/reports/...` | Admin | Export CSV reports |

---

## 🚧 Future Improvements

- [ ] Real-time notifications (WebSocket)
- [ ] Cloud deployment (Render + MongoDB Atlas / Railway)
- [ ] Mobile app (React Native)
- [ ] Email notifications for attendance warnings
- [ ] Advanced analytics dashboard

---

## 📜 License

This project is for educational and demonstration purposes — M.H. Saboo Siddik College of Engineering.

---

## 👤 Authors

**Khan Mohammad Anas Raza Aslam** — Lead Developer(Backend & Database )  
**Ansari Mohammad Anas Peer Mohammad** — Frontend & UI  
**Ansari Mohd Ali Atiqueraheman** — Research & Documentation 
**Aquib Shaikh** —  

Supervised by **Dr. Irfan Landge & Prof. Waseem Shaikh** — Department of CSE-AIML, MHSSCE

---

*Built at M.H. Saboo Siddik College of Engineering, Mumbai*
