package com.ams.backend.repository.firebase;

import com.ams.backend.entities.Student;
import com.ams.backend.repository.StudentRepository;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository("firebaseStudentRepository")
public class FirebaseStudentRepository implements StudentRepository {

    private static final String COLLECTION_NAME = "students";

    private Firestore getDb() {
        return FirestoreClient.getFirestore();
    }

    // Create
    @Override
    public void save(Student student) {
        getDb().collection(COLLECTION_NAME)
                .document(student.getStudentId())
                .set(student);
    }

    // Update
    @Override
    public void update(Student student) {
        getDb().collection(COLLECTION_NAME)
                .document(student.getStudentId())
                .set(student);
    }

    // Find by StudentId
    @Override
    public Student findByStudentId(String studentId) {
        try {
            DocumentSnapshot doc = getDb()
                    .collection(COLLECTION_NAME)
                    .document(studentId)
                    .get()
                    .get();

            return doc.exists() ? doc.toObject(Student.class) : null;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // Find by UID
    @Override
    public Student findByUid(String uid) {
        return findOneByField("uid", uid);
    }

    // Find by Email
    @Override
    public Student findByEmail(String email) {
        return findOneByField("email", email);
    }

    // Find by RollNo
    @Override
    public Student findByRollNo(String rollNo) {
        return findOneByField("rollNo", rollNo);
    }

    // Find All
    @Override
    public List<Student> findAll() {
        return findListByQuery(getDb().collection(COLLECTION_NAME));
    }

    // Find by Branch
    @Override
    public List<Student> findByBranch(String branch) {
        return findListByQuery(
                getDb().collection(COLLECTION_NAME)
                        .whereEqualTo("branch", branch)
        );
    }

    // Find by Semester
    @Override
    public List<Student> findBySemester(int semester) {
        return findListByQuery(
                getDb().collection(COLLECTION_NAME)
                        .whereEqualTo("semester", semester)
        );
    }

    // Find by Branch and Semester
    @Override
    public List<Student> findByBranchAndSemester(String branch, int semester) {
        return findListByQuery(
                getDb().collection(COLLECTION_NAME)
                        .whereEqualTo("branch", branch)
                        .whereEqualTo("semester", semester)
        );
    }

    // Delete by StudentId
    @Override
    public void delete(String studentId) {
        getDb().collection(COLLECTION_NAME)
                .document(studentId)
                .delete();
    }

    // Delete by UID
    @Override
    public void deleteByUid(String uid) {
        Student s = findByUid(uid);
        if (s != null) {
            delete(s.getStudentId());
        }
    }

    // Exists
    @Override
    public boolean exists(String studentId) {
        try {
            DocumentSnapshot doc = getDb()
                    .collection(COLLECTION_NAME)
                    .document(studentId)
                    .get()
                    .get();

            return doc.exists();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ---------------- HELPERS ----------------

    private Student findOneByField(String field, String value) {
        try {
            QuerySnapshot snapshot = getDb()
                    .collection(COLLECTION_NAME)
                    .whereEqualTo(field, value)
                    .get()
                    .get();

            if (snapshot.isEmpty()) return null;

            return snapshot.getDocuments().get(0).toObject(Student.class);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private List<Student> findListByQuery(Query query) {
        try {
            QuerySnapshot snapshot = query.get().get();
            List<Student> list = new ArrayList<>();

            for (DocumentSnapshot doc : snapshot.getDocuments()) {
                list.add(doc.toObject(Student.class));
            }

            return list;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
