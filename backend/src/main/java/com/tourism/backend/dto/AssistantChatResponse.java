package com.tourism.backend.dto;

public class AssistantChatResponse {

    private String reply;
    private String spotContext;
    private boolean grounded;
    private long timestamp;

    public AssistantChatResponse() {}

    public AssistantChatResponse(String reply, String spotContext, boolean grounded) {
        this.reply = reply;
        this.spotContext = spotContext;
        this.grounded = grounded;
        this.timestamp = System.currentTimeMillis();
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getSpotContext() {
        return spotContext;
    }

    public void setSpotContext(String spotContext) {
        this.spotContext = spotContext;
    }

    public boolean isGrounded() {
        return grounded;
    }

    public void setGrounded(boolean grounded) {
        this.grounded = grounded;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
