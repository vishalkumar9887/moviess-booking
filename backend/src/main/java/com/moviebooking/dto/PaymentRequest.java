package com.moviebooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull
    private Long bookingId;
    
    @NotBlank
    private String cardNumber;
    
    @NotBlank
    private String expiryDate;
    
    @NotBlank
    private String cvv;
    
    @NotBlank
    private String cardholderName;
    
    private boolean simulateOTP = true;
    
    public PaymentRequest() {}
    
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    
    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }
    
    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
    
    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }
    
    public String getCardholderName() { return cardholderName; }
    public void setCardholderName(String cardholderName) { this.cardholderName = cardholderName; }
    
    public boolean isSimulateOTP() { return simulateOTP; }
    public void setSimulateOTP(boolean simulateOTP) { this.simulateOTP = simulateOTP; }
}
