package com.moviebooking.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.moviebooking.dto.BookingRequest;
import com.moviebooking.entity.Booking;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.User;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.UserRepository;

@Service
@Transactional
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private ShowtimeRepository showtimeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Booking createBooking(BookingRequest request) {
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
        
        // Check if seats are available
        if (showtime.getSeatsAvailable() <= 0) {
            throw new RuntimeException("No seats available");
        }
        
        Booking booking = new Booking(showtime, request.getSeats(), request.getAmount());
        
        // Set user if authenticated
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            User user = userRepository.findByEmail(auth.getName())
                    .orElse(null);
            if (user != null) {
                booking.setUser(user);
            }
        }
        
        // Set guest info if provided
        if (request.getGuestEmail() != null) {
            booking.setGuestEmail(request.getGuestEmail());
            booking.setGuestName(request.getGuestName());
        }
        
        // Update available seats
        showtime.setSeatsAvailable(showtime.getSeatsAvailable() - 1);
        showtimeRepository.save(showtime);
        
        return bookingRepository.save(booking);
    }
    
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
    
    public List<Booking> getUserBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }
    
    public List<Booking> getGuestBookings(String email) {
        return bookingRepository.findByGuestEmail(email);
    }
    
    public Booking updateBookingStatus(Long bookingId, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
