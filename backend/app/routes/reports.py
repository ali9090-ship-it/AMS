import csv
import io
from flask import Blueprint, make_response
from app.models.attendance import Attendance
from app.models.placement import PlacementApplication
from app.models.scholarship import ScholarshipApplication
from app.models.admission import Admission
from app.middleware.auth import token_required, role_required
from app.database import db

reports_bp = Blueprint('reports', __name__)

def make_csv_response(rows, headers, filename):
    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = f"attachment; filename={filename}"
    output.headers["Content-Type"] = "text/csv"
    return output

@reports_bp.route('/attendance', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def attendance_report(current_user):
    records = Attendance.query.all()
    rows = []
    for r in records:
        rows.append([
            r.student.name if r.student else '',
            r.student.roll_no if r.student else '',
            r.course.name if r.course else '',
            r.date.isoformat() if r.date else '',
            r.status
        ])
    return make_csv_response(rows, ['Student Name', 'Roll No', 'Course', 'Date', 'Status'], 'attendance_report.csv')

@reports_bp.route('/placement', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def placement_report(current_user):
    apps = PlacementApplication.query.all()
    rows = []
    for a in apps:
        rows.append([
            a.student.name if a.student else '',
            a.student.roll_no if a.student else '',
            a.job.company if a.job else '',
            a.job.role if a.job else '',
            a.job.package if a.job else '',
            a.status,
            a.applied_at.isoformat() if a.applied_at else ''
        ])
    return make_csv_response(rows, ['Student Name', 'Roll No', 'Company', 'Role', 'Package', 'Status', 'Applied Date'], 'placement_report.csv')

@reports_bp.route('/scholarships', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def scholarships_report(current_user):
    apps = ScholarshipApplication.query.all()
    rows = []
    for a in apps:
        rows.append([
            a.student.name if a.student else '',
            a.student.roll_no if a.student else '',
            a.scholarship.name if a.scholarship else '',
            float(a.scholarship.amount) if a.scholarship and a.scholarship.amount else '',
            a.status,
            a.applied_at.isoformat() if a.applied_at else ''
        ])
    return make_csv_response(rows, ['Student Name', 'Roll No', 'Scholarship Name', 'Amount', 'Status', 'Applied Date'], 'scholarships_report.csv')

@reports_bp.route('/admissions', methods=['GET'])
@token_required
@role_required(["ADMIN"])
def admissions_report(current_user):
    records = Admission.query.all()
    rows = []
    for r in records:
        sd = r.student_data or {}
        rows.append([
            sd.get('name', ''),
            sd.get('email', ''),
            sd.get('branch', ''),
            r.status,
            r.created_at.isoformat() if r.created_at else ''
        ])
    return make_csv_response(rows, ['Applicant Name', 'Email', 'Branch Applied', 'Status', 'Date'], 'admissions_report.csv')
