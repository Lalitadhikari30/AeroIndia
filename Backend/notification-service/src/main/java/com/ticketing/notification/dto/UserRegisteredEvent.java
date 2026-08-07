package com.ticketing.notification.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {
    @JsonAlias({"name", "user", "userName", "name"})
    private String passengerName;

    @JsonAlias({"email", "recipientEmail", "to", "userEmail"})
    private String passengerEmail;
}
