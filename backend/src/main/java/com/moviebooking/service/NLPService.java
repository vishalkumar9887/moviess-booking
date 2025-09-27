package com.moviebooking.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import com.moviebooking.dto.NLPRequest;
import com.moviebooking.dto.NLPResponse;
import com.moviebooking.entity.Movie;
import com.moviebooking.entity.Showtime;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.ShowtimeRepository;

@Service
@SessionScope
public class NLPService {

    // ✅ Global slots session ke liye
    private Map<String, Object> slots = new HashMap<>();

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    private static final Map<String, String> HINDI_MONTHS = Map.ofEntries(
        Map.entry("जनवरी", "01"), Map.entry("फरवरी", "02"), Map.entry("मार्च", "03"),
        Map.entry("अप्रैल", "04"), Map.entry("मई", "05"), Map.entry("जून", "06"),
        Map.entry("जुलाई", "07"), Map.entry("अगस्त", "08"), Map.entry("सितंबर", "09"),
        Map.entry("अक्टूबर", "10"), Map.entry("नवंबर", "11"), Map.entry("दिसंबर", "12")
    );

    private static final Map<String, Integer> HINDI_NUMBERS = Map.of(
        "एक", 1, "दो", 2, "तीन", 3, "चार", 4, "पांच", 5,
        "छह", 6, "सात", 7, "आठ", 8, "नौ", 9, "दस", 10
    );

    // 🔹 Main intent parser
    public NLPResponse parseIntent(NLPRequest request) {
        String text = request.getText().toLowerCase();
        String intent = detectIntent(text);

        switch (intent) {
            case "book_ticket":
                return parseBookingIntent(text);
            case "ask_showtimes":
                return parseShowtimesIntent(text);
            case "greet":
                return new NLPResponse("greet", slots,
                        "Namaste 🙏! Ticket book karna hai ya showtime dekhna?", false);
            case "payment_confirm":
                return parsePaymentConfirm();
            default:
                return new NLPResponse("unknown", slots,
                        "Maaf 😅, samajh nahi paaya. Dobara koshish karein.", true);
        }
    }

    // 🔹 Intent detect
    private String detectIntent(String text) {
        text = text.toLowerCase();
        String movieName = extractMovieName(text);

        if (text.contains("ticket") || text.contains("बुक") || text.contains("टिकट") || (movieName != null && text.contains("बुक")))
            return "book_ticket";

        if (text.contains("showtime") || text.contains("शो") || text.contains("समय"))
            return "ask_showtimes";

        if (text.contains("hello") || text.contains("नमस्ते"))
            return "greet";

        if (text.contains("payment") || text.contains("कंफर्म") || text.contains("confirm"))
            return "payment_confirm";

        if (movieName != null)
            return "book_ticket";

        return "unknown";
    }

    // 🔹 Showtimes extraction
    private NLPResponse parseShowtimesIntent(String text) {
        String movieName = extractMovieName(text);
        if (movieName == null)
            return new NLPResponse("ask_showtimes", slots, "Kaunsa movie? Available: " + listAllMovies(), true);

        slots.put("movie_name", movieName);
        Movie movie = movieRepository.findAll().stream()
                .filter(m -> m.getTitle().equalsIgnoreCase(movieName)).findFirst().orElse(null);
        if (movie == null)
            return new NLPResponse("ask_showtimes", slots, "Movie nahi mili 😅", true);

        List<Showtime> showtimes = showtimeRepository.findByMovieId(movie.getId());
        if (showtimes.isEmpty())
            return new NLPResponse("ask_showtimes", slots, "Maaf, showtime available nahi hai.", true);

        StringBuilder response = new StringBuilder(movieName + " ke showtimes:\n");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM, HH:mm");
        for (Showtime s : showtimes) {
            response.append(s.getStartTime().format(formatter))
                    .append(" @ ").append(s.getTheater())
                    .append(" (").append(s.getSeatsAvailable()).append(" seat bachi)\n");
        }
        return new NLPResponse("ask_showtimes", slots, response.toString(), false);
    }

    // 🔹 Booking flow
    private NLPResponse parseBookingIntent(String text) {
        int seats = extractNumberOfSeats(text);
        slots.put("num_seats", seats);

        String movieName = extractMovieName(text);
        if (movieName == null)
            return new NLPResponse("book_ticket", slots, "Kaunsa movie?", true);
        slots.put("movie_name", movieName);

        LocalDate date = extractDate(text);
        if (date == null) date = LocalDate.now();
        slots.put("date", date.toString());

        String time = extractTime(text);
        if (time == null) time = "19:00";
        slots.put("time", time);

        // Seat availability
        Movie movie = movieRepository.findAll().stream()
                .filter(m -> m.getTitle().equalsIgnoreCase(movieName)).findFirst().orElse(null);
        if (movie != null) {
            List<Showtime> showtimes = showtimeRepository.findByMovieId(movie.getId());
            if (!showtimes.isEmpty()) {
                Showtime s = showtimes.get(0); // first showtime
                int seatsAvailable = s.getSeatsAvailable();
                if (seats > seatsAvailable) {
                    return new NLPResponse("book_ticket", slots,
                            "Maaf, sirf " + seatsAvailable + " seat bachi hai.", true);
                }
                s.setSeatsAvailable(seatsAvailable - seats);
                showtimeRepository.save(s);
            }
        }

        return new NLPResponse("book_ticket", slots,
                "Booking summary: " + seats + " seat(s) for " + movieName + " on " + date + " at " + time +
                "\nAap ab 'पेमेंट कंफर्म करें' bolke booking finalize kar sakte hain.", false);
    }

    // 🔹 Payment confirm (mock, no card/PIN)
    private NLPResponse parsePaymentConfirm() {
        if (!slots.containsKey("movie_name") || !slots.containsKey("num_seats")) {
            return new NLPResponse("payment_confirm", slots,
                    "Koi booking detect nahi hui 😅. Pehle movie aur seats select karein.", true);
        }

        return new NLPResponse("payment_confirm", slots,
                "Payment confirm ho gaya ✅. Aapki " + slots.get("num_seats") +
                " seat(s) " + slots.get("movie_name") + " ke liye " +
                slots.get("date") + " at " + slots.get("time") + " book ho gayi hain. Enjoy! 🍿", false);
    }

    // 🔹 Helper: number of seats
    private int extractNumberOfSeats(String text) {
        for (String key : HINDI_NUMBERS.keySet()) {
            if (text.contains(key)) return HINDI_NUMBERS.get(key);
        }

        Pattern p = Pattern.compile("(\\d+)\\s*(ticket|seat|seats?)");
        Matcher m = p.matcher(text);
        return m.find() ? Integer.parseInt(m.group(1)) : 1;
    }

    // 🔹 Helper: movie name
    private String extractMovieName(String text) {
        final String txt = text.toLowerCase();
        Map<String, String> movieMap = Map.of(
                "अवतार", "Avatar: The Way of Water",
                "इनसेप्शन", "Inception",
                "दूने", "Dune",
                "स्पाइडर-मैन", "Spider-Man: No Way Home",
                "इंटरस्टेलर", "Interstellar"
        );

        for (String key : movieMap.keySet()) {
            if (txt.contains(key)) return movieMap.get(key);
        }

        return movieRepository.findAll().stream()
                .map(Movie::getTitle)
                .filter(title -> txt.contains(title.toLowerCase()))
                .findFirst()
                .orElse(null);
    }

    // 🔹 Helper: list movies
    private String listAllMovies() {
        StringBuilder sb = new StringBuilder();
        movieRepository.findAll().forEach(m -> sb.append(m.getTitle()).append(", "));
        return sb.length() > 2 ? sb.substring(0, sb.length() - 2) : "";
    }

    // 🔹 Helper: date extract
    private LocalDate extractDate(String text) {
        text = text.toLowerCase();
        if (text.contains("aaj") || text.contains("today")) return LocalDate.now();
        if (text.contains("kal") || text.contains("tomorrow")) return LocalDate.now().plusDays(1);

        Pattern p = Pattern.compile("(\\d{1,2})\\s+(जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)");
        Matcher m = p.matcher(text);
        if (m.find()) {
            int day = Integer.parseInt(m.group(1));
            String monthStr = HINDI_MONTHS.get(m.group(2));
            String dateStr = LocalDate.now().getYear() + "-" + monthStr + "-" + String.format("%02d", day);
            try { return LocalDate.parse(dateStr); } 
            catch (DateTimeParseException e) { return null; }
        }
        return null;
    }

    // 🔹 Helper: time extract
    private String extractTime(String text) {
        Pattern p = Pattern.compile("(\\d{1,2})[:.](\\d{2})");
        Matcher m = p.matcher(text);
        if (m.find()) return String.format("%02d:%02d", Integer.parseInt(m.group(1)), Integer.parseInt(m.group(2)));

        Pattern hourPattern = Pattern.compile("(\\d{1,2})\\s*(बजे|am|pm)?");
        Matcher mh = hourPattern.matcher(text);
        if (mh.find()) {
            int hour = Integer.parseInt(mh.group(1));
            String period = mh.group(2);
            if ("pm".equalsIgnoreCase(period) && hour < 12) hour += 12;
            if ("am".equalsIgnoreCase(period) && hour == 12) hour = 0;
            return String.format("%02d:00", hour);
        }
        return "19:00";
    }
}
