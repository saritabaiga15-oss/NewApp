package com.honouryourmentor.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private String id;
    private String name;
    private String username;
    private String email;
    private String bio;
    private String avatarUri;
    private String coverColor;
    private String phone;
    private String location;

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
