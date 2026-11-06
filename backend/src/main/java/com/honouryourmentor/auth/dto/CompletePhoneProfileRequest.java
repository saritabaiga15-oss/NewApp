package com.honouryourmentor.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletePhoneProfileRequest {
    @NotBlank(message = "Full name is required")
    private String name;

    private String email;
    private String avatarUri;
    private String bio;
}

