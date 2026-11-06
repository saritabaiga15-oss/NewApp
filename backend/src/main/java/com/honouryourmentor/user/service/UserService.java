package com.honouryourmentor.user.service;

import com.honouryourmentor.common.exception.BadRequestException;
import com.honouryourmentor.common.exception.ResourceNotFoundException;
import com.honouryourmentor.common.util.SanitizationUtil;
import com.honouryourmentor.user.dto.UpdateProfileRequest;
import com.honouryourmentor.user.dto.UpdateSettingsRequest;
import com.honouryourmentor.user.dto.UserProfileDto;
import com.honouryourmentor.user.dto.UserSummaryDto;
import com.honouryourmentor.user.entity.User;
import com.honouryourmentor.user.entity.UserProfile;
import com.honouryourmentor.user.repository.UserProfileRepository;
import com.honouryourmentor.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getProfileByUserId(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());

        return mapToDto(user, profile);
    }

    @Transactional
    public UserProfileDto updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if username taken by another user
        userRepository.findByUsername(request.getUsername())
                .filter(u -> !u.getId().equals(userId))
                .ifPresent(u -> {
                    throw new BadRequestException("Username is already taken");
                });

        // Check if email taken by another user
        userRepository.findByEmail(request.getEmail())
                .filter(u -> !u.getId().equals(userId))
                .ifPresent(u -> {
                    throw new BadRequestException("Email is already in use");
                });

        user.setName(request.getName().trim());
        user.setUsername(request.getUsername().trim().replace("@", ""));
        user.setEmail(request.getEmail().trim().toLowerCase());
        userRepository.save(user);

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().user(user).build());

        String phone = normalizePhone(request.getPhone());
        if (phone != null) {
            userProfileRepository.findByPhone(phone)
                    .filter(existing -> !existing.getUser().getId().equals(userId))
                    .ifPresent(existing -> {
                        throw new BadRequestException("Phone number is already in use");
                    });
        }

        profile.setBio(SanitizationUtil.sanitize(request.getBio()));
        profile.setAvatarUri(request.getAvatarUri());
        if (request.getCoverColor() != null && !request.getCoverColor().isBlank()) {
            profile.setCoverColor(request.getCoverColor());
        }
        profile.setPhone(phone);
        profile.setLocation(SanitizationUtil.sanitize(request.getLocation()));
        applySetupFields(profile, request);

        // Privacy and Notification settings updates if present
        if (request.getProfileVisibility() != null) profile.setProfileVisibility(request.getProfileVisibility());
        if (request.getDefaultTributePrivacy() != null) profile.setDefaultTributePrivacy(request.getDefaultTributePrivacy());
        if (request.getConnectionsVisibility() != null) profile.setConnectionsVisibility(request.getConnectionsVisibility());
        if (request.getActivityStatusEnabled() != null) profile.setActivityStatusEnabled(request.getActivityStatusEnabled());
        if (request.getNotifLikes() != null) profile.setNotifLikes(request.getNotifLikes());
        if (request.getNotifComments() != null) profile.setNotifComments(request.getNotifComments());
        if (request.getNotifFollowers() != null) profile.setNotifFollowers(request.getNotifFollowers());
        if (request.getNotifMentorConnections() != null) profile.setNotifMentorConnections(request.getNotifMentorConnections());
        if (request.getNotifMentions() != null) profile.setNotifMentions(request.getNotifMentions());
        if (request.getNotifMessages() != null) profile.setNotifMessages(request.getNotifMessages());

        userProfileRepository.save(profile);

        return mapToDto(user, profile);
    }

    /** Minimum age to hold an account (also enforced in the app). */
    private static final int MIN_AGE = 10;
    private static final Set<String> GENDERS = Set.of("female", "male");

    private void applySetupFields(UserProfile profile, UpdateProfileRequest request) {
        if (request.getBirthday() != null && !request.getBirthday().isBlank()) {
            LocalDate birthday;
            try {
                birthday = LocalDate.parse(request.getBirthday());
            } catch (DateTimeParseException e) {
                throw new BadRequestException("Birthday must be a valid date (YYYY-MM-DD)");
            }
            LocalDate today = LocalDate.now();
            if (birthday.isAfter(today)) {
                throw new BadRequestException("Birthday can't be in the future");
            }
            if (Period.between(birthday, today).getYears() < MIN_AGE) {
                throw new BadRequestException("You need to be at least " + MIN_AGE + " to use Honour Your Mentor");
            }
            profile.setBirthday(birthday);
        }

        if (request.getGender() != null) {
            String g = request.getGender().trim().toLowerCase();
            if (!g.isEmpty() && !GENDERS.contains(g)) {
                throw new BadRequestException("Gender must be 'female' or 'male'");
            }
            profile.setGender(g.isEmpty() ? null : g);
        }

        if (request.getHonouring() != null) {
            List<String> cleaned = request.getHonouring().stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(String::trim)
                    .map(SanitizationUtil::sanitize)
                    .filter(s -> !s.isEmpty())
                    .toList();
            profile.setHonouring(cleaned.isEmpty() ? null : String.join(",", cleaned));
        }

        if (request.getSetupComplete() != null) {
            profile.setSetupComplete(request.getSetupComplete());
        }
    }

    @Transactional
    public UserProfileDto updateSettings(String userId, UpdateSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> UserProfile.builder().user(user).build());

        if (request.getProfileVisibility() != null) profile.setProfileVisibility(request.getProfileVisibility());
        if (request.getDefaultTributePrivacy() != null) profile.setDefaultTributePrivacy(request.getDefaultTributePrivacy());
        if (request.getConnectionsVisibility() != null) profile.setConnectionsVisibility(request.getConnectionsVisibility());
        if (request.getActivityStatusEnabled() != null) profile.setActivityStatusEnabled(request.getActivityStatusEnabled());

        if (request.getNotifLikes() != null) profile.setNotifLikes(request.getNotifLikes());
        if (request.getNotifComments() != null) profile.setNotifComments(request.getNotifComments());
        if (request.getNotifFollowers() != null) profile.setNotifFollowers(request.getNotifFollowers());
        if (request.getNotifMentorConnections() != null) profile.setNotifMentorConnections(request.getNotifMentorConnections());
        if (request.getNotifMentions() != null) profile.setNotifMentions(request.getNotifMentions());
        if (request.getNotifMessages() != null) profile.setNotifMessages(request.getNotifMessages());

        userProfileRepository.save(profile);
        return mapToDto(user, profile);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        String normalized = phone.trim().replaceAll("[^0-9+]", "");
        if (!normalized.matches("^\\+?\\d{7,15}$")) {
            throw new BadRequestException("Phone number must include 7 to 15 digits and an optional country-code +");
        }
        return normalized;
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getUserSummary(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String avatar = userProfileRepository.findByUserId(userId)
                .map(UserProfile::getAvatarUri)
                .orElse("");

        return UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .avatarUri(avatar)
                .build();
    }

    private UserProfileDto mapToDto(User user, UserProfile profile) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(profile != null ? profile.getBio() : "")
                .avatarUri(profile != null ? profile.getAvatarUri() : "")
                .coverColor(profile != null ? profile.getCoverColor() : "#54000E")
                .phone(profile != null ? profile.getPhone() : "")
                .location(profile != null ? profile.getLocation() : "")
                .birthday(profile != null && profile.getBirthday() != null ? profile.getBirthday().toString() : null)
                .gender(profile != null ? profile.getGender() : null)
                .honouring(profile != null && profile.getHonouring() != null
                        ? Arrays.asList(profile.getHonouring().split(","))
                        : List.of())
                .setupComplete(profile != null && profile.isSetupComplete())
                .profileVisibility(profile != null && profile.getProfileVisibility() != null ? profile.getProfileVisibility() : "PUBLIC")
                .defaultTributePrivacy(profile != null && profile.getDefaultTributePrivacy() != null ? profile.getDefaultTributePrivacy() : "PUBLIC")
                .connectionsVisibility(profile != null && profile.getConnectionsVisibility() != null ? profile.getConnectionsVisibility() : "EVERYONE")
                .activityStatusEnabled(profile != null && profile.getActivityStatusEnabled() != null ? profile.getActivityStatusEnabled() : true)
                .notifLikes(profile != null && profile.getNotifLikes() != null ? profile.getNotifLikes() : true)
                .notifComments(profile != null && profile.getNotifComments() != null ? profile.getNotifComments() : true)
                .notifFollowers(profile != null && profile.getNotifFollowers() != null ? profile.getNotifFollowers() : true)
                .notifMentorConnections(profile != null && profile.getNotifMentorConnections() != null ? profile.getNotifMentorConnections() : true)
                .notifMentions(profile != null && profile.getNotifMentions() != null ? profile.getNotifMentions() : true)
                .notifMessages(profile != null && profile.getNotifMessages() != null ? profile.getNotifMessages() : true)
                .build();
    }
}
