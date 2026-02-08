package com.ams.backend.controllers;

import com.ams.backend.services.AuthService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // frontend se idToken aayega
    @PostMapping("/login")
    public String login(@RequestParam String idToken) throws Exception {

        FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(idToken);

        String uid = decodedToken.getUid();

        String role = authService.getRoleByUid(uid);

        return "UID=" + uid + ", ROLE=" + role;
    }
}
