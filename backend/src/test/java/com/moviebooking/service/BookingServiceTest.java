package com.moviebooking.service;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.moviebooking.dto.BookingRequest;
import com.moviebooking.entity.Booking;
import com.moviebooking.entity.Showtime;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)  // Lenient mode
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private UserRepository userRepository;
    

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private BookingService bookingService;

    private BookingRequest bookingRequest;
    private Showtime showtime;

    @BeforeEach
    void setUp() {
        showtime = new Showtime();
        // showtime.setId(1L);
        showtime.setSeatsAvailable(10);
        // showtime.setSeatsTotal(20);

        bookingRequest = new BookingRequest();
        bookingRequest.setShowtimeId(1L);
        bookingRequest.setSeats("[{\"row\":1,\"seat\":1}]");
        bookingRequest.setAmount(BigDecimal.valueOf(250));

        SecurityContextHolder.setContext(securityContext);
        // Make stub lenient to avoid unnecessary stubbing exception
        Mockito.lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
    }

    @Test
    void createBooking_Success() {
        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(showtime));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(1L);
            return booking;
        });
        when(showtimeRepository.save(any(Showtime.class))).thenReturn(showtime);

        Booking result = bookingService.createBooking(bookingRequest);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(showtime, result.getShowtime());
        assertEquals(bookingRequest.getSeats(), result.getSeats());
        assertEquals(bookingRequest.getAmount(), result.getAmount());

        verify(showtimeRepository).findById(1L);
        verify(bookingRepository).save(any(Booking.class));
        verify(showtimeRepository).save(any(Showtime.class));
    }

    @Test
    void createBooking_ShowtimeNotFound() {
        when(showtimeRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(bookingRequest);
        });

        assertEquals("Showtime not found", exception.getMessage());
        verify(showtimeRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBooking_NoSeatsAvailable() {
        showtime.setSeatsAvailable(0);
        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(showtime));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(bookingRequest);
        });

        assertEquals("No seats available", exception.getMessage());
        verify(showtimeRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
 