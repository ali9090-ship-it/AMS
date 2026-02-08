package com.ams.backend.repository.firebase;

import com.ams.backend.entities.Attendance;
import com.ams.backend.repository.AttendanceRepository;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository("firebaseAttendanceRepository")
public class FirebaseAttendanceRepository implements AttendanceRepository {

    private static final String COLLECTION = "attendance";

    private Firestore db() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public void save(Attendance attendance) {
        try {
            db().collection(COLLECTION)
                    .document(attendance.getAttendanceId())
                    .set(attendance)
                    .get();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void update(Attendance attendance) {
        save(attendance);
    }

    @Override
    public Attendance findByStudentIdAndSubjectId(String studentId, String subjectId) {
        try {
            String id = studentId + "_" + subjectId;
            DocumentSnapshot doc = db().collection(COLLECTION).document(id).get().get();
            return doc.exists() ? doc.toObject(Attendance.class) : null;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<Attendance> findByStudentId(String studentId) {
        List<Attendance> list = new ArrayList<>();
        try {
            QuerySnapshot snap = db().collection(COLLECTION)
                    .whereEqualTo("studentId", studentId)
                    .get().get();

            for (DocumentSnapshot d : snap.getDocuments())
                list.add(d.toObject(Attendance.class));

        } catch (Exception e) { }
        return list;
    }

    @Override
    public List<Attendance> findBySubjectId(String subjectId) {
        List<Attendance> list = new ArrayList<>();
        try {
            QuerySnapshot snap = db().collection(COLLECTION)
                    .whereEqualTo("subjectId", subjectId)
                    .get().get();

            for (DocumentSnapshot d : snap.getDocuments())
                list.add(d.toObject(Attendance.class));

        } catch (Exception e) { }
        return list;
    }
}
