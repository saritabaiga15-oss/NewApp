package com.honouryourmentor.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {
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

