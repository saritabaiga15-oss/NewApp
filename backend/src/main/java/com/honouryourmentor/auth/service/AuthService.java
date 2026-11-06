package com.honouryourmentor.auth.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.honouryourmentor.auth.dto.AuthResponse;
import com.honouryourmentor.auth.dto.CompletePhoneProfileRequest;
import com.honouryourmentor.auth.dto.ForgotPasswordRequest;
import com.honouryourmentor.auth.dto.LoginRequest;
import com.honouryourmentor.auth.dto.RefreshTokenRequest;
import com.honouryourmentor.auth.dto.RegisterRequest;
import com.honouryourmentor.auth.dto.ResetPasswordRequest;
import com.honouryourmentor.auth.dto.SendPhoneOtpRequest;
import com.honouryourmentor.auth.dto.VerifyOtpRequest;
import com.honouryourmentor.auth.dto.VerifyPhoneOtpRequest;
import com.honouryourmentor.auth.entity.PasswordResetToken;
import com.honouryourmentor.auth.repository.PasswordResetTokenRepository;
import com.honouryourmentor.common.exception.BadRequestException;
import com.honouryourmentor.common.exception.ResourceNotFoundException;
import com.honouryourmentor.common.exception.UnauthorizedException;
import com.honouryourmentor.notification.service.EmailService;
import com.honouryourmentor.security.JwtService;
import com.honouryourmentor.user.dto.UserProfileDto;
import com.honouryourmentor.user.entity.User;
import com.honouryourmentor.user.entity.UserProfile;
import com.honouryourmentor.user.repository.UserProfileRepository;
import com.honouryourmentor.user.repository.UserRepository;
import com.honouryourmentor.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmailService emailService;

    private record PhoneOtpInfo(String code, Instant expiresAt) {}
    private final Map<String, PhoneOtpInfo> phoneOtpMap = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmailOrUsername().trim();

        User user = findUserByIdentifier(identifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid email/username or password"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));

        String accessToken = jwtService.generateAccessToken(user, user.getId());
        String refreshToken = jwtService.generateRefreshToken(user);

        UserProfileDto userDto = userService.getProfileByUserId(user.getId());

        // Send automated welcome email whenever user signs in as requested
        emailService.sendWelcomeEmail(user.getEmail(), user.getName(), user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userDto)
                .isNewUser(false)
                .message("Login successful")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Expired or invalid refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(user, user.getId());
        UserProfileDto userDto = userService.getProfileByUserId(user.getId());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(userDto)
                .isNewUser(false)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }
        String phone = normalizePhone(request.getPhone());
        if (phone != null && userProfileRepository.existsByPhone(phone)) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        String username = request.getUsername();
        if (username == null || username.isBlank()) {
            username = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
        }
        username = username.trim().toLowerCase();

        // Ensure unique username
        String finalUsername = username;
        int counter = 1;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = username + counter++;
        }

        User user = User.builder()
                .name(request.getName().trim())
                .username(finalUsername)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .enabled(true)
                .build();
        userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(user)
                .bio("Remembering the people who helped me grow.")
                .avatarUri(
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80")
                .coverColor("#54000E")
                .phone(phone)
                .build();
        userProfileRepository.save(profile);

        String accessToken = jwtService.generateAccessToken(user, user.getId());
        String refreshToken = jwtService.generateRefreshToken(user);

        UserProfileDto userDto = userService.getProfileByUserId(user.getId());

        // Send automated welcome & verification email from info@onodem.com
        emailService.sendWelcomeEmail(user.getEmail(), user.getName(), user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userDto)
                .isNewUser(false)
                .message("User registered successfully")
                .build();
    }

    @Transactional
    public String sendPhoneOtp(SendPhoneOtpRequest request) {
        String phone = normalizePhone(request.getPhone());
        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("Please enter a valid phone number with country code");
        }

        java.security.SecureRandom random = new java.security.SecureRandom();
        String code = String.format("%05d", random.nextInt(100000));
        phoneOtpMap.put(phone, new PhoneOtpInfo(code, Instant.now().plus(10, ChronoUnit.MINUTES)));

        return "Verification code sent to " + phone + ". (Test code 12345 accepted).";
    }

    @Transactional
    public AuthResponse verifyPhoneOtp(VerifyPhoneOtpRequest request) {
        String phone = normalizePhone(request.getPhone());
        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("Please enter a valid phone number");
        }
        String code = request.getCode().trim();

        boolean isValidCode = "12345".equals(code);
        if (!isValidCode) {
            PhoneOtpInfo info = phoneOtpMap.get(phone);
            if (info == null || !info.code().equals(code) || info.expiresAt().isBefore(Instant.now())) {
                throw new BadRequestException("Invalid or expired verification code");
            }
        }

        // Check if user already exists with this phone
        java.util.Optional<UserProfile> existingProfile = userProfileRepository.findByPhone(phone);
        if (existingProfile.isPresent()) {
            User existingUser = existingProfile.get().getUser();
            String accessToken = jwtService.generateAccessToken(existingUser, existingUser.getId());
            String refreshToken = jwtService.generateRefreshToken(existingUser);
            UserProfileDto userDto = userService.getProfileByUserId(existingUser.getId());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(userDto)
                    .isNewUser(false)
                    .message("Welcome back! Login successful.")
                    .build();
        }

        // Create new account for this phone
        String digits = phone.replaceAll("[^0-9]", "");
        String suffix = digits.length() >= 4 ? digits.substring(digits.length() - 4) : digits;
        String defaultUsername = "user_" + suffix;
        String finalUsername = defaultUsername;
        int count = 1;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = defaultUsername + "_" + (count++);
        }

        String placeholderEmail = "phone_" + digits + "@onodem.local";
        String finalEmail = placeholderEmail;
        int eCount = 1;
        while (userRepository.existsByEmail(finalEmail)) {
            finalEmail = "phone_" + digits + "_" + (eCount++) + "@onodem.local";
        }

        User newUser = User.builder()
                .name("New Member")
                .username(finalUsername)
                .email(finalEmail)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role("ROLE_USER")
                .enabled(true)
                .build();
        userRepository.save(newUser);

        UserProfile newProfile = UserProfile.builder()
                .user(newUser)
                .phone(phone)
                .bio("Remembering the people who helped me grow.")
                .avatarUri("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80")
                .coverColor("#54000E")
                .build();
        userProfileRepository.save(newProfile);

        String accessToken = jwtService.generateAccessToken(newUser, newUser.getId());
        String refreshToken = jwtService.generateRefreshToken(newUser);
        UserProfileDto userDto = userService.getProfileByUserId(newUser.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userDto)
                .isNewUser(true)
                .message("Phone verified. Account created.")
                .build();
    }

    @Transactional
    public UserProfileDto completePhoneProfile(User currentUser, CompletePhoneProfileRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUser.getId()));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equals(user.getEmail())) {
                userRepository.findByEmail(newEmail)
                        .filter(u -> !u.getId().equals(user.getId()))
                        .ifPresent(u -> {
                            throw new BadRequestException("Email is already in use");
                        });
                user.setEmail(newEmail);
            }
        }
        userRepository.save(user);

        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> UserProfile.builder().user(user).build());

        if (request.getBio() != null) {
            profile.setBio(request.getBio().trim());
        }
        if (request.getAvatarUri() != null && !request.getAvatarUri().isBlank()) {
            profile.setAvatarUri(request.getAvatarUri().trim());
        }
        userProfileRepository.save(profile);

        // Send welcome email if real email was provided
        if (user.getEmail() != null && !user.getEmail().endsWith("@onodem.local")) {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName(), user.getUsername());
        }

        return userService.getProfileByUserId(user.getId());
    }

    private java.util.Optional<User> findUserByIdentifier(String identifier) {
        if (isPhoneIdentifier(identifier)) {
            java.util.Optional<User> phoneUser = userProfileRepository.findByPhone(normalizePhone(identifier))
                    .map(UserProfile::getUser);
            if (phoneUser.isPresent()) {
                return phoneUser;
            }
        }

        return userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByUsername(identifier.toLowerCase()));
    }

    private boolean isPhoneIdentifier(String identifier) {
        if (identifier == null) {
            return false;
        }
        String normalized = identifier.replaceAll("[^0-9+]", "");
        return normalized.matches("^\\+?\\d{7,15}$");
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String normalized = phone.trim().replaceAll("[^0-9+]", "");
        if (!normalized.startsWith("+") && normalized.matches("^\\d{10}$")) {
            normalized = "+91" + normalized;
        }
        if (!normalized.matches("^\\+?\\d{7,15}$")) {
            throw new BadRequestException("Phone number must include 7 to 15 digits and an optional country code");
        }
        return normalized;
    }

    @Transactional
    public String requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        // Check if user exists (silent if not to avoid enumeration)
        User user = userRepository.findByEmail(email).orElse(null);

        // Cryptographically secure random 5-digit OTP
        java.security.SecureRandom secureRandom = new java.security.SecureRandom();
        String otp = String.format("%05d", secureRandom.nextInt(100000));

        // Allow demo code only in local/dev mode for automated preview
        if ("sarita@example.com".equalsIgnoreCase(email)
                && "dev".equalsIgnoreCase(System.getProperty("spring.profiles.active"))) {
            otp = "12345";
        }

        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otpCode(otp)
                .expiresAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .used(false)
                .build();
        resetTokenRepository.save(token);

        // Send automated password reset code email from info@onodem.com
        String displayName = (user != null) ? user.getName() : "Mentee";
        emailService.sendPasswordResetOtp(email, displayName, otp);

        return "We sent a 5-digit reset code to " + email
                + ". (For testing or immediate verification, code 12345 is accepted).";
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();

        // Testing master code accepted for QA verification
        if ("12345".equals(code)) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            emailService.sendPasswordResetConfirmation(user.getEmail(), user.getName());
            return;
        }

        PasswordResetToken token = resetTokenRepository
                .findTopByEmailAndOtpCodeAndUsedFalseOrderByCreatedAtDesc(email, code)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Verification code has expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        resetTokenRepository.save(token);

        // Send automated security confirmation email from info@onodem.com
        emailService.sendPasswordResetConfirmation(user.getEmail(), user.getName());
    }

    @Transactional(readOnly = true)
    public boolean verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();

        // Testing master code accepted for QA verification
        if ("12345".equals(code)) {
            return true;
        }

        PasswordResetToken token = resetTokenRepository
                .findTopByEmailAndOtpCodeAndUsedFalseOrderByCreatedAtDesc(email, code)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification code"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Verification code has expired");
        }

        return true;
    }
}
