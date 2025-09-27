package com.moviebooking.service;

import com.moviebooking.dto.PaymentRequest;
import com.moviebooking.entity.Booking;
import com.moviebooking.entity.Payment;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    public Map<String, Object> initiatePayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }
        
        Payment payment = new Payment(booking, Payment.PaymentMethod.CREDIT_CARD);
        
        if (request.isSimulateOTP()) {
            payment.setStatus(Payment.PaymentStatus.OTP_REQUIRED);
            String otpToken = UUID.randomUUID().toString();
            payment.setOtpToken(otpToken);
            paymentRepository.save(payment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "OTP_REQUIRED");
            response.put("otp_token", otpToken);
            response.put("message", "OTP sent to your registered mobile number");
            return response;
        } else {
            // Direct payment without OTP
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setExternalTxnId("TXN_" + UUID.randomUUID().toString().substring(0, 8));
            paymentRepository.save(payment);
            
            booking.setStatus(Booking.BookingStatus.PAID);
            bookingRepository.save(booking);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("transaction_id", payment.getExternalTxnId());
            response.put("message", "Payment successful");
            return response;
        }
    }
    
    public Map<String, Object> confirmOTPPayment(String otpToken, String otp) {
        Payment payment = paymentRepository.findByOtpToken(otpToken)
                .orElseThrow(() -> new RuntimeException("Invalid OTP token"));
        
        // Mock OTP validation - accept 123456 as valid OTP
        if (!"123456".equals(otp)) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "FAILED");
            response.put("message", "Invalid OTP");
            return response;
        }
        
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setExternalTxnId("TXN_" + UUID.randomUUID().toString().substring(0, 8));
        paymentRepository.save(payment);
        
        Booking booking = payment.getBooking();
        booking.setStatus(Booking.BookingStatus.PAID);
        bookingRepository.save(booking);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("transaction_id", payment.getExternalTxnId());
        response.put("booking_id", booking.getId());
        response.put("message", "Payment successful! Booking confirmed.");
        return response;
    }
    
    public Optional<Payment> getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findById(bookingId);
    }
}
