package com.moviebooking.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.moviebooking.dto.PaymentRequest;
import com.moviebooking.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping("/mock")
    public ResponseEntity<?> initiateMockPayment(@Valid @RequestBody PaymentRequest request) {
        try {
            Map<String, Object> response = paymentService.initiatePayment(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/mock/confirm")
    public ResponseEntity<?> confirmOTPPayment(@RequestBody Map<String, String> request) {
        try {
            String otpToken = request.get("otp_token");
            String otp = request.get("otp");
            
            if (otpToken == null || otp == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "OTP token and OTP are required"));
            }
            
            Map<String, Object> response = paymentService.confirmOTPPayment(otpToken, otp);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
