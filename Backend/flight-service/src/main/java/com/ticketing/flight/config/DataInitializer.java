package com.ticketing.flight.config;

import com.ticketing.flight.dto.FlightCreateRequest;
import com.ticketing.flight.dto.SeatClassInput;
import com.ticketing.flight.model.Airport;
import com.ticketing.flight.repository.AirportRepository;
import com.ticketing.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AirportRepository airportRepository;
    private final FlightService flightService;

    @Override
    public void run(String... args) throws Exception {
        try {
            if (airportRepository.count() == 0) {
                seedAirports();
                seedFlights();
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(DataInitializer.class).warn("MongoDB is offline or unreachable. Skipping automatic airport/flight data seeding: {}", e.getMessage());
        }
    }

    private void seedAirports() {
        List<Airport> airports = Arrays.asList(
            new Airport(null, "VTZ", "Visakhapatnam International", "Visakhapatnam, Andhra Pradesh", "India", "IST"),
            new Airport(null, "VGA", "Vijayawada International", "Vijayawada, Andhra Pradesh", "India", "IST"),
            new Airport(null, "TIR", "Tirupati International", "Tirupati, Andhra Pradesh", "India", "IST"),
            new Airport(null, "HGI", "Donyi Polo Airport", "Itanagar, Arunachal Pradesh", "India", "IST"),
            new Airport(null, "GAU", "Lokpriya Gopinath Bordoloi Intl", "Guwahati, Assam", "India", "IST"),
            new Airport(null, "DIB", "Dibrugarh Airport", "Dibrugarh, Assam", "India", "IST"),
            new Airport(null, "PAT", "Jayprakash Narayan Intl", "Patna, Bihar", "India", "IST"),
            new Airport(null, "GAY", "Gaya International", "Gaya, Bihar", "India", "IST"),
            new Airport(null, "RPR", "Swami Vivekananda Airport", "Raipur, Chhattisgarh", "India", "IST"),
            new Airport(null, "DEL", "Indira Gandhi International", "New Delhi, Delhi", "India", "IST"),
            new Airport(null, "GOI", "Dabolim Airport", "Dabolim, Goa", "India", "IST"),
            new Airport(null, "GOX", "Manohar International", "Mopa, Goa", "India", "IST"),
            new Airport(null, "AMD", "Sardar Vallabhbhai Patel Intl", "Ahmedabad, Gujarat", "India", "IST"),
            new Airport(null, "STV", "Surat International", "Surat, Gujarat", "India", "IST"),
            new Airport(null, "IXC", "Shaheed Bhagat Singh Intl", "Chandigarh / Mohali", "India", "IST"),
            new Airport(null, "DHM", "Kangra Gaggal Airport", "Dharamshala, Himachal Pradesh", "India", "IST"),
            new Airport(null, "SXR", "Sheikh ul-Alam International", "Srinagar, Jammu & Kashmir", "India", "IST"),
            new Airport(null, "IXR", "Birsa Munda Airport", "Ranchi, Jharkhand", "India", "IST"),
            new Airport(null, "BLR", "Kempegowda International", "Bengaluru, Karnataka", "India", "IST"),
            new Airport(null, "IXE", "Mangaluru International", "Mangaluru, Karnataka", "India", "IST"),
            new Airport(null, "COK", "Cochin International", "Kochi, Kerala", "India", "IST"),
            new Airport(null, "TRV", "Trivandrum International", "Thiruvananthapuram, Kerala", "India", "IST"),
            new Airport(null, "IXL", "Kushok Bakula Rimpochee", "Leh, Ladakh", "India", "IST"),
            new Airport(null, "IDR", "Devi Ahilya Bai Holkar", "Indore, Madhya Pradesh", "India", "IST"),
            new Airport(null, "BHO", "Raja Bhoj Airport", "Bhopal, Madhya Pradesh", "India", "IST"),
            new Airport(null, "BOM", "Chhatrapati Shivaji Maharaj Intl", "Mumbai, Maharashtra", "India", "IST"),
            new Airport(null, "PNQ", "Pune International", "Pune, Maharashtra", "India", "IST"),
            new Airport(null, "NAG", "Dr. Babasaheb Ambedkar Intl", "Nagpur, Maharashtra", "India", "IST"),
            new Airport(null, "IMF", "Bir Tikendrajit International", "Imphal, Manipur", "India", "IST"),
            new Airport(null, "SHL", "Umroi Airport", "Shillong, Meghalaya", "India", "IST"),
            new Airport(null, "AJL", "Lengpui Airport", "Aizawl, Mizoram", "India", "IST"),
            new Airport(null, "DMU", "Dimapur Airport", "Dimapur, Nagaland", "India", "IST"),
            new Airport(null, "BBI", "Biju Patnaik International", "Bhubaneswar, Odisha", "India", "IST"),
            new Airport(null, "ATQ", "Sri Guru Ram Dass Jee Intl", "Amritsar, Punjab", "India", "IST"),
            new Airport(null, "JAI", "Jaipur International", "Jaipur, Rajasthan", "India", "IST"),
            new Airport(null, "UDR", "Maharana Pratap Airport", "Udaipur, Rajasthan", "India", "IST"),
            new Airport(null, "PYG", "Pakyong Airport", "Pakyong (Gangtok), Sikkim", "India", "IST"),
            new Airport(null, "MAA", "Chennai International", "Chennai, Tamil Nadu", "India", "IST"),
            new Airport(null, "CJB", "Coimbatore International", "Coimbatore, Tamil Nadu", "India", "IST"),
            new Airport(null, "HYD", "Rajiv Gandhi International", "Hyderabad, Telangana", "India", "IST"),
            new Airport(null, "IXA", "Maharaja Bir Bikram Airport", "Agartala, Tripura", "India", "IST"),
            new Airport(null, "LKO", "Chaudhary Charan Singh Intl", "Lucknow, Uttar Pradesh", "India", "IST"),
            new Airport(null, "VNS", "Lal Bahadur Shastri Intl", "Varanasi, Uttar Pradesh", "India", "IST"),
            new Airport(null, "AYJ", "Maharishi Valmiki International", "Ayodhya, Uttar Pradesh", "India", "IST"),
            new Airport(null, "DED", "Jolly Grant Airport", "Dehradun, Uttarakhand", "India", "IST"),
            new Airport(null, "CCU", "Netaji Subhash Chandra Bose Intl", "Kolkata, West Bengal", "India", "IST"),
            new Airport(null, "IXB", "Bagdogra Airport", "Bagdogra / Siliguri, West Bengal", "India", "IST"),
            new Airport(null, "IXZ", "Veer Savarkar Intl", "Port Blair, Andaman & Nicobar", "India", "IST"),
            new Airport(null, "AGX", "Agatti Airport", "Agatti Island, Lakshadweep", "India", "IST"),
            new Airport(null, "PNY", "Puducherry Airport", "Puducherry, Puducherry", "India", "IST")
        );
        airportRepository.saveAll(airports);
    }

    private void seedFlights() {
        List<Airport> airports = airportRepository.findAll();
        Random random = new Random();
        String[] airlines = {"Air India", "IndiGo", "SpiceJet", "Vistara"};
        
        List<SeatClassInput> seatClasses = Arrays.asList(
            new SeatClassInput("BUSINESS", 1, 5, 1.8),
            new SeatClassInput("PREMIUM_ECONOMY", 6, 10, 1.3),
            new SeatClassInput("ECONOMY", 11, 30, 1.0)
        );

        for (int i = 0; i < 15; i++) {
            Airport dep = airports.get(random.nextInt(airports.size()));
            Airport arr;
            do {
                arr = airports.get(random.nextInt(airports.size()));
            } while (dep.getIataCode().equals(arr.getIataCode()));

            int daysFromNow = random.nextInt(7);
            LocalDateTime depTime = LocalDateTime.now().plusDays(daysFromNow).withHour(random.nextInt(18) + 4).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime arrTime = depTime.plusHours(random.nextInt(3) + 1).plusMinutes(random.nextInt(60));

            BigDecimal basePrice = BigDecimal.valueOf(3000 + random.nextInt(12000));
            String airline = airlines[random.nextInt(airlines.length)];
            String flightNumber = airline.substring(0, 2).toUpperCase() + "-" + (100 + random.nextInt(900));

            FlightCreateRequest req = FlightCreateRequest.builder()
                .flightNumber(flightNumber)
                .airline(airline)
                .departureAirport(dep.getIataCode())
                .arrivalAirport(arr.getIataCode())
                .departureTime(depTime)
                .arrivalTime(arrTime)
                .aircraftType("A320")
                .totalRows(30)
                .seatsPerRow(6)
                .basePrice(basePrice)
                .seatClasses(seatClasses)
                .build();

            flightService.createFlight(req);
        }
    }
}
