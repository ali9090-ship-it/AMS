package com.ams.backend.repository.firebase;

import com.ams.backend.entities.Subject;
import com.ams.backend.repository.SubjectRepository;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("firebaseSubjectRepository")
public class FirebaseSubjectRepository implements SubjectRepository {

    private static final String COLLECTION = "subjects";

    private Firestore db() {
        return FirestoreClient.getFirestore();
    }

    @Override
    public void save(Subject subject) {
        try {
            db().collection(COLLECTION)
                    .document(subject.getSubjectId())
                    .set(subject)
                    .get();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void update(Subject subject) {
        save(subject);
    }

    @Override
    public Subject findBySubjectId(String subjectId) {
        try {
            return db().collection(COLLECTION)
                    .document(subjectId)
                    .get()
                    .get()
                    .toObject(Subject.class);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public Subject findByCode(String code) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("code", code)
                    .get()
                    .get()
                    .getDocuments()
                    .stream()
                    .findFirst()
                    .map(d -> d.toObject(Subject.class))
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<Subject> findAll() {
        try {
            return db().collection(COLLECTION)
                    .get()
                    .get()
                    .toObjects(Subject.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public List<Subject> findByBranch(String branch) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("branch", branch)
                    .get()
                    .get()
                    .toObjects(Subject.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public List<Subject> findByBranchAndSemester(String branch, int semester) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("branch", branch)
                    .whereEqualTo("semester", semester)
                    .get()
                    .get()
                    .toObjects(Subject.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public List<Subject> findByTeacher(String teacherId) {
        try {
            return db().collection(COLLECTION)
                    .whereEqualTo("teacherId", teacherId)
                    .get()
                    .get()
                    .toObjects(Subject.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public void delete(String subjectId) {
        try {
            db().collection(COLLECTION)
                    .document(subjectId)
                    .delete()
                    .get();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public boolean exists(String subjectId) {
        try {
            return db().collection(COLLECTION)
                    .document(subjectId)
                    .get()
                    .get()
                    .exists();
        } catch (Exception e) {
            return false;
        }
    }
}
