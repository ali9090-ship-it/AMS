import pymysql
import bcrypt
import os
from datetime import datetime, timedelta
import random

# 1. Create ams_db if it does not exist
try:
    conn = pymysql.connect(host='localhost', port=8889, user='root', password='root')
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS ams_db")
    cursor.close()
    conn.close()
    print("Database ams_db checked/created successfully.")
except Exception as e:
    print("Failed to ensure ams_db exists (make sure MAMP is running on 8889 with root:root):", e)
    exit(1)

# Import app factory and models
from app import create_app
from app.database import db
from app.models.user import User
from app.models.course import Course, CourseEnrollment
from app.models.attendance import Attendance
from app.models.result import Result
from app.models.announcement import Announcement
from app.models.note import Note
from app.models.scholarship import Scholarship, ScholarshipApplication
from app.models.placement import PlacementJob, PlacementApplication
from app.models.feedback import Feedback
from app.models.admission import Admission

app = create_app()

with app.app_context():
    # 2. Create tables
    db.drop_all()  # Fresh start for seeding
    db.create_all()
    print("All tables created successfully.")

    # 3. Create Users
    def hash_pw(pw):
        return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # RULE 5 - Only Super Admin user
    a1 = User(name="Super Admin", email="admin@mhssce.ac.in", password=hash_pw("admin123"), role="admin", branch="ALL", status="Active")
    t1 = User(name="Test Teacher", email="teacher.cs@mhssce.ac.in", password=hash_pw("password123"), role="teacher", branch="CS", status="Active")
    t2 = User(name="Teacher 2", email="teacher.it@mhssce.ac.in", password=hash_pw("password123"), role="teacher", branch="IT", status="Active")
    s1 = User(name="Test Student", email="student.216001.cs@mhssce.ac.in", password=hash_pw("password123"), role="student", branch="CS", status="Active", roll_no="216001")
    s2 = User(name="Student 2", email="student.216002.cs@mhssce.ac.in", password=hash_pw("password123"), role="student", branch="CS", status="Active", roll_no="216002")
    s_del = User(name="Deletable Student", email="student.deleted.cs@mhssce.ac.in", password=hash_pw("password123"), role="student", branch="CS", status="Active", roll_no="216003")

    db.session.add_all([a1, t1, t2, s1, s2, s_del])
    db.session.commit()
    
    # Seed courses
    c1 = Course(name="Software Engineering", code="CS401", teacher_id=t1.id, branch="CS", semester=4, credits=4)
    c2 = Course(name="Data Structures", code="IT401", teacher_id=t2.id, branch="IT", semester=4, credits=4)
    db.session.add_all([c1, c2])
    db.session.commit()
    
    # Enroll student 1 in course 1
    db.session.add(CourseEnrollment(student_id=s1.id, course_id=c1.id))
    db.session.commit()

    # Seed a Job for file rollback test
    j1 = PlacementJob(company="Google", role="SDE", package="40 LPA", posted_by=a1.id)
    db.session.add(j1)
    db.session.commit()

    print("Users, Courses, and Jobs seeded for verification.")
    print("--- SEEDING COMPLETE ---")
