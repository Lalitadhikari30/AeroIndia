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
        if (airportRepository.count() == 0) {
            seedAirports();
            seedFlights();
        }
    }

    private void seedAirports() {
        List<Airport> airports = Arrays.asList(
            new Airport(null, "DEL", "Indira Gandhi International", "Delhi", "India", "IST"),
            new Airport(null, "BOM", "Chhatrapati Shivaji", "Mumbai", "India", "IST"),
            new Airport(null, "BLR", "Kempegowda International", "Bangalore", "India", "IST"),
            new Airport(null, "MAA", "Chennai International", "Chennai", "India", "IST"),
            new Airport(null, "CCU", "Netaji Subhas Chandra", "Kolkata", "India", "IST"),
            new Airport(null, "HYD", "Rajiv Gandhi International", "Hyderabad", "India", "IST"),
            new Airport(null, "GOI", "Dabolim", "Goa", "India", "IST"),
            new Airport(null, "COK", "Cochin International", "Kochi", "India", "IST"),
            new Airport(null, "AMD", "Sardar Vallabhbhai Patel", "Ahmedabad", "India", "IST"),
            new Airport(null, "JAI", "Jaipur International", "Jaipur", "India", "IST")
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
