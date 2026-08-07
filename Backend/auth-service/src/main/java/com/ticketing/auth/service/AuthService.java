package com.ticketing.auth.service;

import com.ticketing.auth.dto.AuthResponse;
import com.ticketing.auth.dto.LoginRequest;
import com.ticketing.auth.dto.RegisterRequest;
import com.ticketing.auth.dto.TokenRefreshRequest;
import com.ticketing.auth.dto.UserProfileResponse;
import com.ticketing.auth.exception.DuplicateEmailException;
import com.ticketing.auth.exception.InvalidCredentialsException;
import com.ticketing.auth.exception.InvalidTokenException;
import com.ticketing.auth.model.User;
import com.ticketing.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;
import com.ticketing.auth.model.Role;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger LOG = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    @Value("${jwt.access-token-expiration}")
    private long jwtExpiration;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email is already in use");
        }

        // Validate accessCode for STAFF and ADMIN roles
        if (request.getRole() == Role.STAFF) {
            if (!"AERO_STAFF_2026".equals(request.getAccessCode())) {
                throw new InvalidCredentialsException("Invalid staff verification code.");
            }
        } else if (request.getRole() == Role.ADMIN) {
            if (!"AERO_ADMIN_2026".equals(request.getAccessCode())) {
                throw new InvalidCredentialsException("Invalid admin verification code.");
            }
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .build();

        userRepository.save(user);

        // Trigger welcome email via notification-service
        triggerWelcomeEmail(request);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String token = request.getRefreshToken();
        
        if (!jwtService.validateToken(token)) {
            throw new InvalidTokenException("Invalid or expired refresh token");
        }

        String userId = jwtService.extractUserId(token);
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new InvalidTokenException("User not found for the given token"));

        return buildAuthResponse(user);
    }

    public Map<String, String> validateToken(String token) {
        if (!jwtService.validateToken(token)) {
            throw new InvalidTokenException("Invalid or expired access token");
        }

        Map<String, String> userDetails = new HashMap<>();
        userDetails.put("userId", jwtService.extractUserId(token));
        userDetails.put("email", jwtService.extractEmail(token));
        userDetails.put("role", jwtService.extractRole(token));

        return userDetails;
    }

    public UserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new InvalidTokenException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Value("${services.notification.welcome-url:http://notification-service/api/notifications/welcome}")
    private String welcomeEmailUrl;

    private void triggerWelcomeEmail(RegisterRequest request) {
        try {
            String name = (request.getFirstName() != null ? request.getFirstName() : "") +
                    " " + (request.getLastName() != null ? request.getLastName() : "");
            Map<String, String> payload = new HashMap<>();
            payload.put("passengerName", name.trim());
            payload.put("passengerEmail", request.getEmail());

            restTemplate.postForEntity(welcomeEmailUrl, payload, Object.class);
            LOG.info("✅ Welcome email triggered for {}", request.getEmail());
        } catch (Exception e) {
            LOG.warn("⚠ Failed to trigger welcome email for {} (notification-service may be offline): {}",
                    request.getEmail(), e.getMessage());
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .userId(user.getId().toString())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserProfileResponse.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole().name())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public UserProfileResponse updateUserRole(String userId, String roleStr) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new InvalidTokenException("User not found"));
        user.setRole(Role.valueOf(roleStr.toUpperCase()));
        user = userRepository.save(user);
        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public void deleteUser(String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new InvalidTokenException("User not found"));
        userRepository.delete(user);
    }
}
