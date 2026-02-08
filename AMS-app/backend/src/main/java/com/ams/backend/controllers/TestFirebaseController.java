package com.ams.backend.controllers;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestFirebaseController {

    @GetMapping("/test-firebase")
    public String testFirebase() throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        db.collection("test")
                .add(Map.of("message", "Hello from Spring Boot"));

        return "Data sent to Firebase";
    }
}
