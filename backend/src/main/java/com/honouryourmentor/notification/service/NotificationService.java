package com.honouryourmentor.notification.service;

import com.honouryourmentor.common.exception.ResourceNotFoundException;
import com.honouryourmentor.notification.dto.NotificationDto;
import com.honouryourmentor.notification.entity.Notification;
import com.honouryourmentor.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public List<NotificationDto> getUserNotifications(String userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (list.isEmpty()) {
            seedDefaultNotifications(userId);
            list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return list.stream().map(this::mapToDto).toList();
    }

    @Transactional
    public void markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found: " + notificationId);
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (notification.getUserId().equals(userId)) {
            notificationRepository.delete(notification);
        }
    }

    @Transactional
    public NotificationDto createNotification(
            String userId,
            String title,
            String message,
            String type,
            String actorId,
            String actorName,
            String actorAvatar,
            String targetId,
            String targetType
    ) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type != null ? type : "GENERAL")
                .actorId(actorId)
                .actorName(actorName)
                .actorAvatar(actorAvatar)
                .targetId(targetId)
                .targetType(targetType)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    private void seedDefaultNotifications(String userId) {
        createNotification(
                userId,
                "New Like",
                "Alex liked your memory.",
                "LIKE",
                "act_alex",
                "Alex Turner",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
                "tribute-1",
                "MEMORY"
        );
        createNotification(
                userId,
                "New Comment",
                "Sarah commented on your appreciation.",
                "COMMENT",
                "act_sarah",
                "Sarah Jenkins",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
                "tribute-2",
                "COMMENT"
        );
        createNotification(
                userId,
                "New Follower",
                "Emma started following you.",
                "FOLLOWER",
                "act_emma",
                "Emma Watson",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
                "profile_emma",
                "PROFILE"
        );
        createNotification(
                userId,
                "New Reply",
                "David replied to your comment.",
                "REPLY",
                "act_david",
                "David Mitchell",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
                "comment-1",
                "COMMENT"
        );
        createNotification(
                userId,
                "Mentor Connection",
                "John accepted your mentor connection.",
                "MENTOR_CONNECTION",
                "act_john",
                "John Keating",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
                "mentor-1",
                "MENTOR"
        );
        createNotification(
                userId,
                "New Mention",
                "Sarah mentioned you in a memory.",
                "MENTION",
                "act_sarah",
                "Sarah Jenkins",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
                "tribute-3",
                "MEMORY"
        );
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .actorId(notification.getActorId())
                .actorName(notification.getActorName())
                .actorAvatar(notification.getActorAvatar())
                .targetId(notification.getTargetId())
                .targetType(notification.getTargetType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
