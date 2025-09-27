package com.moviebooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moviebooking.entity.Booking;
import com.moviebooking.entity.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    Optional<Booking> findByIdAndUser(Long id, User user);
    List<Booking> findByGuestEmail(String guestEmail);
}
