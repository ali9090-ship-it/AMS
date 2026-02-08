package com.ams.backend.repository.firebase;

import com.ams.backend.entities.Teacher;
import com.ams.backend.repository.TeacherRepository;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository("firebaseTeacherRepository")
public class FirebaseTeacherRepository implements TeacherRepository {

    private static final String COLLECTION = "teachers";

    private Firestore db() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public void save(Teacher teacher) {
        db().collection(COLLECTION)
                .document(teacher.getTeacherId())
                .set(teacher);
    }

    @Override
    public void update(Teacher teacher) {
        save(teacher);
    }

    @Override
    public Teacher findByTeacherId(String teacherId) {
        try {
            DocumentSnapshot doc = db().collection(COLLECTION)
                    .document(teacherId)
                    .get().get();
            return doc.exists() ? doc.toObject(Teacher.class) : null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Teacher findByUid(String uid) {
        return findOneByField("uid", uid);
    }

    @Override
    public Teacher findByEmail(String email) {
        return findOneByField("email", email);
    }

    @Override
    public List<Teacher> findAll() {
        try {
            List<Teacher> list = new ArrayList<>();
            QuerySnapshot snap = db().collection(COLLECTION).get().get();
            for (DocumentSnapshot d : snap.getDocuments()) {
                list.add(d.toObject(Teacher.class));
            }
            return list;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void delete(String teacherId) {
        db().collection(COLLECTION).document(teacherId).delete();
    }

    @Override
    public boolean exists(String teacherId) {
        try {
            return db().collection(COLLECTION)
                    .document(teacherId)
                    .get().get().exists();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Teacher findOneByField(String field, String value) {
        try {
            QuerySnapshot snap = db().collection(COLLECTION)
                    .whereEqualTo(field, value)
                    .get().get();

            if (snap.isEmpty()) return null;
            return snap.getDocuments().get(0).toObject(Teacher.class);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
