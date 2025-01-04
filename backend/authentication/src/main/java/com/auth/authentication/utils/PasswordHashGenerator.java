package com.auth.authentication.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "haslo123";
        
        System.out.println("Generated hashes for password '" + password + "':");
        for (int i = 0; i < 3; i++) {
            String hash = encoder.encode(password);
            System.out.println(hash);
        }
    }
}
