# 🎓 AMS — Academic Management System
### M.H. Saboo Siddik College of Engineering, Mumbai

A full-stack Academic Management System built for MHSSCE to digitize and streamline student, teacher, and administrative workflows across the institution.

---

## 📌 Live Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@mhssce.ac.in` | `admin123` |
| Teacher | `ashfaque.cs@mhssce.ac.in` | `teacher123` |
| Student | `anasraza.241723.cs@mhssce.ac.in` | `student123` |

> ⚠️ Admin must create and activate all accounts. Self-registration is disabled by design.

---

## 🚀 Features

### 👨‍🎓 Student Portal
- View enrolled courses, attendance records, and exam results
- Download study notes and materials uploaded by teachers
- Track placement applications and scholarship status
- Submit anonymous or named course feedback
- View exam timetables and announcements

### 👩‍🏫 Teacher Portal
- Mark daily attendance for enrolled students
- Enter and update marks (Internal, Mid-Sem, End-Sem)
- Upload study notes and materials (PDF, DOCX, PPTX)
- View AI-powered student risk analysis
- Access course feedback analytics

### 🛠️ Admin Portal
- Create and manage all user accounts (students, teachers, admins)
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
├── backend/                    ← Python Flask backend
│   ├── app/
│   │   ├── __init__.py         ← App factory + route registration
│   │   ├── config.py           ← Environment config
│   │   ├── database.py         ← SQLAlchemy DB connection
│   │   ├── models/             ← Database models
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── attendance.py
│   │   │   ├── result.py
│   │   │   ├── note.py
│   │   │   ├── placement.py
│   │   │   ├── scholarship.py
│   │   │   ├── feedback.py
│   │   │   └── admission.py
│   │   ├── routes/             ← API endpoints (Flask Blueprints)
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── courses.py
│   │   │   ├── attendance.py
│   │   │   ├── results.py
│   │   │   ├── notes.py
│   │   │   ├── placement.py
│   │   │   ├── scholarships.py
│   │   │   ├── feedback.py
│   │   │   ├── admissions.py
│   │   │   ├── announcements.py
│   │   │   ├── exams.py
│   │   │   └── ai.py
│   │   ├── middleware/
│   │   │   └── auth.py         ← JWT @token_required + @role_required
│   │   └── utils/
│   │       └── files.py        ← File upload/delete helpers
│   ├── uploads/                ← Uploaded files (git-ignored)
│   │   ├── notes/
│   │   ├── resumes/
│   │   ├── brochures/
│   │   ├── admissions/
│   │   └── avatars/
│   ├── seed.py                 ← Database seeder
│   ├── run.py                  ← Flask entry point
│   ├── requirements.txt
│   └── .env                    ← Environment variables (git-ignored)
│
├── src/                        ← React frontend source
│   ├── components/             ← Reusable UI components
│   ├── contexts/               ← Auth context
│   ├── lib/
│   │   ├── api.ts              ← API fetch utility with JWT
│   │   └── auth.ts             ← Email validation + role detection
│   └── pages/
│       ├── admin/              ← Admin portal pages
│       ├── teacher/            ← Teacher portal pages
│       └── student/            ← Student portal pages
│
├── public/
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

Open a new terminal:

```bash
# From project root
npm install
```

Create `src/.env.local`:

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
<img width="1282" height="1470" alt="image" src="https://github.com/user-attachments/assets/0411145f-f5c7-4a4f-af54-e0a9d6fab5bb" />

---

## 🤖 AI Features

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
- Email format enforces role detection:
  - Student: `name.rollno.branch@mhssce.ac.in`
  - Teacher: `name.branch@mhssce.ac.in`
  - Admin: `admin@mhssce.ac.in`

---

## 📁 File Storage

All uploaded files are stored locally on the server:

| File Type | Folder |
|-----------|--------|
| Study notes | `uploads/notes/` |
| Student resumes | `uploads/resumes/` |
| Job brochures | `uploads/brochures/` |
| Admission documents | `uploads/admissions/` |
| Profile photos | `uploads/avatars/` |

Files are served at: `http://localhost:5001/uploads/...`

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
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create new user |
| GET | `/api/courses` | All | Get courses (role-filtered) |
| POST | `/api/courses` | Admin | Create course |
| POST | `/api/attendance/mark` | Teacher | Mark attendance |
| GET | `/api/attendance/my` | Student | View own attendance |
| POST | `/api/results` | Teacher | Enter marks |
| GET | `/api/results/my` | Student | View own results |
| POST | `/api/notes` | Teacher | Upload study material |
| GET | `/api/notes` | All | List notes |
| GET | `/api/ai/risk-score/{id}` | Teacher | Get student risk score |
| GET | `/api/ai/scholarship-eligibility` | Student | Check AI eligibility |

---

## 🚧 Future Improvements

- [ ] Real-time notifications (WebSocket)
- [ ] Cloud deployment (Render + MongoDB Atlas / Railway)
- [ ] Mobile app (React Native)
- [ ] Email notifications for attendance warnings
- [ ] Bulk student enrollment via CSV upload
- [ ] Advanced analytics dashboard

---

## 📜 License

This project is for educational and demonstration purposes — M.H. Saboo Siddik College of Engineering.

---

## 👤 Authors

**Khan Mohammad Anas Raza Aslam** — Lead Developer  
**Ansari Mohd Ali Atiqueraheman** — Backend & Database  
**Ansari Mohammad Anas Peer Mohammad** — Frontend & UI  
**Aquib Shaikh** — Research & Documentation  

Supervised by **Dr. Irfan Landge** — Department of CSE-AIML, MHSSCE

---

*Built with ❤️ at M.H. Saboo Siddik College of Engineering, Mumbai*
