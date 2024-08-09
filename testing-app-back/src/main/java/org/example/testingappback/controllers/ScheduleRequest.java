package org.example.testingappback.controllers;

import java.time.ZoneId;
import java.time.ZonedDateTime;

public class ScheduleRequest {
    private String scheduledTime;

    public String getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(String scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

}