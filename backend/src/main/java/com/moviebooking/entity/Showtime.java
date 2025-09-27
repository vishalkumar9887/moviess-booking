package com.moviebooking.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "showtimes")
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    @JsonBackReference
    private Movie movie;

    @NotNull
    private LocalDateTime startTime;

    private String theater;

    private String city; // added field

    private int seatsAvailable;

    private int seatsTotal;

    @Column(columnDefinition = "TEXT")
    private String seatMap; // JSON string representing seat layout

    public Showtime() {}

    // Parameterized constructor
    public Showtime(Movie movie, String theater, String city, LocalDateTime startTime, int seatsTotal, String seatMap) {
        this.movie = movie;
        this.theater = theater;
        this.city = city;
        this.startTime = startTime;
        this.seatsTotal = seatsTotal;
        this.seatsAvailable = seatsTotal; // all seats initially available
        this.seatMap = seatMap;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public String getTheater() { return theater; }
    public void setTheater(String theater) { this.theater = theater; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public int getSeatsAvailable() { return seatsAvailable; }
    public void setSeatsAvailable(int seatsAvailable) { this.seatsAvailable = seatsAvailable; }

    public int getSeatsTotal() { return seatsTotal; }
    public void setSeatsTotal(int seatsTotal) { this.seatsTotal = seatsTotal; }

    public String getSeatMap() { return seatMap; }
    public void setSeatMap(String seatMap) { this.seatMap = seatMap; }
}
