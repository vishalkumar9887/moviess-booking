package com.moviebooking.dto;

import jakarta.validation.constraints.NotBlank;

public class NLPRequest {
    @NotBlank
    private String text;
    
    public NLPRequest() {}
    
    public NLPRequest(String text) {
        this.text = text;
    }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
