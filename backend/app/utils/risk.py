from app.models.attendance import Attendance
from app.models.result import Result
from app.database import db

def update_student_risk_score(student_id):
    """
    Calculates and updates the risk_level for a student.
    Task 38: Immediate risk recalculation on data change.
    """
    from app.models.user import User
    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return

    # Calculate Attendance Percentage
    total_att = Attendance.query.filter_by(student_id=student_id).count()
    if total_att == 0:
        att_perc = 100 # Default if no attendance recorded yet
    else:
        present_att = Attendance.query.filter_by(student_id=student_id, status='Present').count()
        att_perc = (present_att / total_att) * 100

    # Calculate Marks Percentage
    results = Result.query.filter_by(student_id=student_id).all()
    if not results:
        marks_perc = 100 # Default
    else:
        marks_perc = sum([(r.marks_obtained / r.total_marks * 100) for r in results]) / len(results)

    # Risk Logic (matching ai.py)
    new_risk = "Medium"
    if att_perc < 75 or marks_perc < 40:
        new_risk = "High"
    elif att_perc > 90 and marks_perc > 80:
        new_risk = "Low"

    student.risk_level = new_risk
    db.session.commit()
