package com.moviebooking.dto;

import java.util.Map;

public class NLPResponse {
    private String intent;
    private Map<String, Object> slots;
    private String response;
    private boolean needsClarification;
    
    public NLPResponse() {}
    
    public NLPResponse(String intent, Map<String, Object> slots, String response, boolean needsClarification) {
        this.intent = intent;
        this.slots = slots;
        this.response = response;
        this.needsClarification = needsClarification;
    }
    
    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
    
    public Map<String, Object> getSlots() { return slots; }
    public void setSlots(Map<String, Object> slots) { this.slots = slots; }
    
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    
    public boolean isNeedsClarification() { return needsClarification; }
    public void setNeedsClarification(boolean needsClarification) { this.needsClarification = needsClarification; }
}
