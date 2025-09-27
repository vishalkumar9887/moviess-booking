package com.moviebooking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moviebooking.dto.NLPRequest;
import com.moviebooking.dto.NLPResponse;
import com.moviebooking.service.NLPService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/nlp")
@CrossOrigin(origins = "*")
public class NLPController {
    
    @Autowired
    private NLPService nlpService;
    
    @PostMapping("/parse")
    public ResponseEntity<NLPResponse> parseIntent(@Valid @RequestBody NLPRequest request) {
        NLPResponse response = nlpService.parseIntent(request);
        return ResponseEntity.ok(response);
    }
}
