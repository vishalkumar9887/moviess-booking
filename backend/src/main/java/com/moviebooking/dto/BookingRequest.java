package com.moviebooking.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class BookingRequest {
    @NotNull
    private Long showtimeId;
    
    @NotBlank
    private String seats; // JSON array
    
    @NotNull
    @Positive
    private BigDecimal amount;
    
    // Guest booking fields
    @Email
    private String guestEmail;
    
    private String guestName;
    
    public BookingRequest() {}
    
    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }
    
    public String getSeats() { return seats; }
    public void setSeats(String seats) { this.seats = seats; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
}
