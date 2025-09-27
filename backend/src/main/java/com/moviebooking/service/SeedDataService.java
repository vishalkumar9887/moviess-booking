package com.moviebooking.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.moviebooking.entity.Movie;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.User;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.UserRepository;

@Service
public class SeedDataService implements CommandLineRunner {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (movieRepository.count() == 0) {
            seedMovies();
        }
        if (showtimeRepository.count() == 0) {
            seedShowtimes();
        }
        if (userRepository.count() == 0) {
            seedUsers();
        }
    }

    private void seedMovies() {
        Movie[] movies = {
            new Movie("Avatar: The Way of Water", 192, "Sci-Fi",
                     "avatar.png",
                     "Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family, the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure."),

            new Movie("Inception", 148, "Thriller",
                     "dune.png",
                     "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."),

            new Movie("Dune", 155, "Sci-Fi",
                     "avatar.png",
                     "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people."),

            new Movie("Spider-Man: No Way Home", 148, "Action",
                     "image.png",
                     "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man."),

            new Movie("Interstellar", 169, "Sci-Fi",
                     "inter.png",
                     "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.")
        };

        for (Movie movie : movies) {
            movieRepository.save(movie);
        }
    }

    private void seedShowtimes() {
        List<Movie> movies = movieRepository.findAll();
        for (Movie movie : movies) {
            // PVR Phoenix Pune
            createShowtime(movie, "PVR Phoenix Pune", "Pune",
                           LocalDateTime.now().plusDays(1).withHour(16).withMinute(0), 120);
            createShowtime(movie, "PVR Phoenix Pune", "Pune",
                           LocalDateTime.now().plusDays(1).withHour(19).withMinute(0), 120);
            createShowtime(movie, "PVR Phoenix Pune", "Pune",
                           LocalDateTime.now().plusDays(1).withHour(22).withMinute(0), 120);

            // INOX River
            createShowtime(movie, "INOX River", "Pune",
                           LocalDateTime.now().plusDays(2).withHour(15).withMinute(30), 100);
            createShowtime(movie, "INOX River", "Pune",
                           LocalDateTime.now().plusDays(2).withHour(18).withMinute(30), 100);
            createShowtime(movie, "INOX River", "Pune",
                           LocalDateTime.now().plusDays(2).withHour(21).withMinute(30), 100);

            // Today additional showtimes
            createShowtime(movie, "PVR Phoenix Pune", "Pune",
                           LocalDateTime.now().withHour(19).withMinute(0), 120);
            createShowtime(movie, "INOX River", "Pune",
                           LocalDateTime.now().withHour(21).withMinute(30), 100);
        }
    }

    // private void createShowtime(Movie movie, String theater, String city,
    //                             LocalDateTime startTime, int seatsTotal) {
    //     String seatMap = generateSeatMap(seatsTotal);
    //     Showtime showtime = new Showtime(movie, theater, city, startTime, seatsTotal, seatMap);
    //     showtimeRepository.save(showtime);
    // }
    private void createShowtime(Movie movie, String theater, String city, LocalDateTime startTime, int seatsTotal) {
    String seatMap = generateSeatMap(seatsTotal);
    Showtime showtime = new Showtime(movie, theater, city, startTime, seatsTotal, seatMap);
    showtimeRepository.save(showtime);
}


    private String generateSeatMap(int seatsTotal) {
        int seatsPerRow = 10;
        int rows = (int) Math.ceil((double) seatsTotal / seatsPerRow);
        StringBuilder seatMap = new StringBuilder();
        seatMap.append("[");

        int seatCount = 0;
        for (int row = 1; row <= rows; row++) {
            for (int seat = 1; seat <= seatsPerRow; seat++) {
                seatCount++;
                if (seatCount > seatsTotal) break;

                seatMap.append("{\"row\":").append(row)
                       .append(",\"seat\":").append(seat)
                       .append(",\"available\":true,\"type\":\"regular\"}");

                if (seatCount < seatsTotal) {
                    seatMap.append(",");
                }
            }
        }

        seatMap.append("]");
        return seatMap.toString();
    }

    private void seedUsers() {
        User demoUser = new User();
        demoUser.setName("Demo User");
        demoUser.setEmail("demo@movie.com");
        demoUser.setPasswordHash(passwordEncoder.encode("Password123"));
        userRepository.save(demoUser);
    }
}
