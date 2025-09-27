package com.moviebooking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moviebooking.entity.Showtime;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(Long movieId);
    
    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId AND s.startTime >= :startDate AND s.startTime < :endDate")
    List<Showtime> findByMovieIdAndDateRange(@Param("movieId") Long movieId, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    List<Showtime> findByCityAndStartTimeAfter(String city, LocalDateTime startTime);
}
