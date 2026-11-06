package com.honouryourmentor.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email cannot be blank")
    private String email;

    private String bio;
    private String avatarUri;
    private String coverColor;

    @Pattern(regexp = "^$|^\\+?[0-9][0-9\\s().-]{5,28}[0-9]$", message = "Invalid phone number")
    private String phone;
    private String location;

    /** ISO date "YYYY-MM-DD". Only updated when present. */
    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Birthday must be YYYY-MM-DD")
    private String birthday;
    /** Only updated when present. */
    private String gender;
    /** Only updated when present. */
    private List<String> honouring;
    /** Only updated when present. */
    private Boolean setupComplete;

    // Privacy Settings
    private String profileVisibility;
    private String defaultTributePrivacy;
    private String connectionsVisibility;
    private Boolean activityStatusEnabled;

    // Notification Preferences
    private Boolean notifLikes;
    private Boolean notifComments;
    private Boolean notifFollowers;
    private Boolean notifMentorConnections;
    private Boolean notifMentions;
    private Boolean notifMessages;
}
