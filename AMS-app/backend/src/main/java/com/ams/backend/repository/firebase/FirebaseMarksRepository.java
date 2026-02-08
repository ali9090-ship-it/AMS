package com.ams.backend.repository.firebase;

import com.ams.backend.entities.Marks;
import com.ams.backend.repository.MarksRepository;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("firebaseMarksRepository")
public class FirebaseMarksRepository implements MarksRepository {

    private static final String COLLECTION = "marks";

    private Firestore db() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public void save(Marks marks) {
        try {
            db().collection(COLLECTION)
                    .document(marks.getMarksId())
                    .set(marks)
                    .get();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void update(Marks marks) {
        save(marks);
    }

    @Override
    public Marks findByMarksId(String marksId) {
        try {
            return db().collection(COLLECTION)
                    .document(marksId)
                    .get()
                    .get()
                    .toObject(Marks.class);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public Marks findByStudentAndSubject(String studentId, String subjectId) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("studentId", studentId)
                    .whereEqualTo("subjectId", subjectId)
                    .get()
                    .get()
                    .getDocuments()
                    .stream()
                    .findFirst()
                    .map(d -> d.toObject(Marks.class))
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<Marks> findByStudent(String studentId) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("studentId", studentId)
                    .get()
                    .get()
                    .toObjects(Marks.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public List<Marks> findBySubject(String subjectId) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("subjectId", subjectId)
                    .get()
                    .get()
                    .toObjects(Marks.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public List<Marks> findByGrade(String grade) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("grade", grade)
                    .get()
                    .get()
                    .toObjects(Marks.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public void delete(String marksId) {
        try {
            db().collection(COLLECTION)
                    .document(marksId)
                    .delete()
                    .get();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public boolean exists(String marksId) {
        try {
            return db().collection(COLLECTION)
                    .document(marksId)
                    .get()
                    .get()
                    .exists();
        } catch (Exception e) {
            return false;
        }
    }
}
