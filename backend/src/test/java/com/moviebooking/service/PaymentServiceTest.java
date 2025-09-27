package com.moviebooking.service;

import com.moviebooking.dto.PaymentRequest;
import com.moviebooking.entity.Booking;
import com.moviebooking.entity.Payment;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private PaymentService paymentService;

    private PaymentRequest paymentRequest;
    private Booking booking;

    @BeforeEach
    void setUp() {
        booking = new Booking();
        booking.setId(1L);
        booking.setStatus(Booking.BookingStatus.PENDING);

        paymentRequest = new PaymentRequest();
        paymentRequest.setBookingId(1L);
        paymentRequest.setCardNumber("1234567890123456");
        paymentRequest.setExpiryDate("12/25");
        paymentRequest.setCvv("123");
        paymentRequest.setCardholderName("John Doe");
        paymentRequest.setSimulateOTP(true);
    }

    @Test
    void initiatePayment_WithOTP_Success() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId(1L);
            payment.setOtpToken("test-otp-token");
            return payment;
        });

        // Act
        Map<String, Object> result = paymentService.initiatePayment(paymentRequest);

        // Assert
        assertNotNull(result);
        assertEquals("OTP_REQUIRED", result.get("status"));
        assertNotNull(result.get("otp_token"));
        assertEquals("OTP sent to your registered mobile number", result.get("message"));

        verify(bookingRepository).findById(1L);
        verify(paymentRepository).save(any(Payment.class));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void initiatePayment_WithoutOTP_Success() {
        // Arrange
        paymentRequest.setSimulateOTP(false);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId(1L);
            payment.setExternalTxnId("TXN_12345678");
            return payment;
        });
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        // Act
        Map<String, Object> result = paymentService.initiatePayment(paymentRequest);

        // Assert
        assertNotNull(result);
        assertEquals("SUCCESS", result.get("status"));
        assertNotNull(result.get("transaction_id"));
        assertEquals("Payment successful", result.get("message"));

        verify(bookingRepository).findById(1L);
        verify(paymentRepository).save(any(Payment.class));
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void initiatePayment_BookingNotFound() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.initiatePayment(paymentRequest);
        });

        assertEquals("Booking not found", exception.getMessage());
        verify(bookingRepository).findById(1L);
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void confirmOTPPayment_ValidOTP_Success() {
        // Arrange
        Payment payment = new Payment();
        payment.setOtpToken("test-otp-token");
        payment.setStatus(Payment.PaymentStatus.OTP_REQUIRED);
        payment.setBooking(booking);

        when(paymentRepository.findByOtpToken("test-otp-token")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        // Act
        Map<String, Object> result = paymentService.confirmOTPPayment("test-otp-token", "123456");

        // Assert
        assertNotNull(result);
        assertEquals("SUCCESS", result.get("status"));
        assertNotNull(result.get("transaction_id"));
        assertNotNull(result.get("booking_id"));
        assertEquals("Payment successful! Booking confirmed.", result.get("message"));

        verify(paymentRepository).findByOtpToken("test-otp-token");
        verify(paymentRepository).save(any(Payment.class));
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void confirmOTPPayment_InvalidOTP_Failure() {
        // Arrange
        Payment payment = new Payment();
        payment.setOtpToken("test-otp-token");
        payment.setStatus(Payment.PaymentStatus.OTP_REQUIRED);

        when(paymentRepository.findByOtpToken("test-otp-token")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        // Act
        Map<String, Object> result = paymentService.confirmOTPPayment("test-otp-token", "wrong-otp");

        // Assert
        assertNotNull(result);
        assertEquals("FAILED", result.get("status"));
        assertEquals("Invalid OTP", result.get("message"));

        verify(paymentRepository).findByOtpToken("test-otp-token");
        verify(paymentRepository).save(any(Payment.class));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void confirmOTPPayment_InvalidToken() {
        // Arrange
        when(paymentRepository.findByOtpToken("invalid-token")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            paymentService.confirmOTPPayment("invalid-token", "123456");
        });

        assertEquals("Invalid OTP token", exception.getMessage());
        verify(paymentRepository).findByOtpToken("invalid-token");
        verify(paymentRepository, never()).save(any(Payment.class));
    }
}
