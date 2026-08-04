package com.ticketing.auth.controller;

import com.ticketing.auth.dto.AuthResponse;
import com.ticketing.auth.dto.LoginRequest;
import com.ticketing.auth.dto.RegisterRequest;
import com.ticketing.auth.dto.TokenRefreshRequest;
import com.ticketing.auth.dto.UserProfileResponse;
import com.ticketing.auth.service.AuthService;
import com.ticketing.auth.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, and token validation")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login an existing user")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token and return user details")
    public ResponseEntity<Map<String, String>> validateToken(
            @RequestParam(required = false) String token,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        String actualToken = token;
        if (actualToken == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            actualToken = authHeader.substring(7);
        }
        
        if (actualToken == null || actualToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return ResponseEntity.ok(authService.validateToken(actualToken));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String token = authHeader.substring(7);
        String userId = jwtService.extractUserId(token);
        
        return ResponseEntity.ok(authService.getUserProfile(userId));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all registered users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<UserProfileResponse> updateUserRole(
            @PathVariable("id") String userId,
            @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ResponseEntity.ok(authService.updateUserRole(userId, role));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") String userId) {
        authService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
