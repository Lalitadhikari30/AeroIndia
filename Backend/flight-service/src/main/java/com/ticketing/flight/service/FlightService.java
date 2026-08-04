package com.ticketing.flight.service;

import com.ticketing.flight.dto.*;
import com.ticketing.flight.exception.FlightNotFoundException;
import com.ticketing.flight.model.*;
import com.ticketing.flight.repository.AirportRepository;
import com.ticketing.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;
    private final PricingService pricingService;

    public FlightSearchResponse searchFlights(FlightSearchRequest req) {
        LocalDateTime startOfDay = req.getDepartureDate().atStartOfDay();
        LocalDateTime endOfDay = req.getDepartureDate().atTime(LocalTime.MAX);

        List<Flight> directFlights = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureTimeBetween(
                req.getDepartureAirport(), req.getArrivalAirport(), startOfDay, endOfDay);

        List<FlightSummary> directSummaries = directFlights.stream()
                .filter(f -> f.getAvailableSeats() >= req.getPassengers())
                .map(f -> toFlightSummary(f, req.getSeatClass()))
                .collect(Collectors.toList());

        List<ConnectingFlight> connectingSummaries = findConnectingFlights(req, startOfDay, endOfDay);

        return FlightSearchResponse.builder()
                .flights(directSummaries)
                .connecting(connectingSummaries)
                .build();
    }

    private List<ConnectingFlight> findConnectingFlights(FlightSearchRequest req, LocalDateTime startOfDay, LocalDateTime endOfDay) {
        List<ConnectingFlight> connections = new ArrayList<>();
        List<Flight> firstLegs = flightRepository.findByDepartureAirportAndDepartureTimeBetween(
                req.getDepartureAirport(), startOfDay, endOfDay);

        for (Flight firstLeg : firstLegs) {
            if (firstLeg.getAvailableSeats() < req.getPassengers() || firstLeg.getArrivalAirport().equals(req.getArrivalAirport())) {
                continue;
            }

            LocalDateTime minDeparture = firstLeg.getArrivalTime().plusHours(1);
            LocalDateTime maxDeparture = firstLeg.getArrivalTime().plusHours(6);

            List<Flight> secondLegs = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureTimeBetween(
                    firstLeg.getArrivalAirport(), req.getArrivalAirport(), minDeparture, maxDeparture);

            for (Flight secondLeg : secondLegs) {
                if (secondLeg.getAvailableSeats() >= req.getPassengers()) {
                    FlightSummary leg1 = toFlightSummary(firstLeg, req.getSeatClass());
                    FlightSummary leg2 = toFlightSummary(secondLeg, req.getSeatClass());
                    
                    Duration layover = Duration.between(firstLeg.getArrivalTime(), secondLeg.getDepartureTime());
                    String layoverDuration = formatDuration(layover);
                    
                    Duration totalDur = Duration.between(firstLeg.getDepartureTime(), secondLeg.getArrivalTime());
                    
                    connections.add(ConnectingFlight.builder()
                            .legs(List.of(leg1, leg2))
                            .totalDuration(formatDuration(totalDur))
                            .totalPrice(leg1.getCurrentPrice().add(leg2.getCurrentPrice()))
                            .layoverAirport(firstLeg.getArrivalAirport())
                            .layoverDuration(layoverDuration)
                            .build());
                }
            }
        }
        return connections;
    }

    private FlightSummary toFlightSummary(Flight f, String preferredClass) {
        String seatClass = (preferredClass != null && !preferredClass.isEmpty()) ? preferredClass : "ECONOMY";
        BigDecimal price = pricingService.calculateDynamicPrice(f, seatClass);
        Duration duration = Duration.between(f.getDepartureTime(), f.getArrivalTime());
        
        List<String> classes = f.getSeatMap() != null && f.getSeatMap().getSeatClasses() != null 
            ? f.getSeatMap().getSeatClasses().stream()
                .map(SeatClass::getClassName)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList())
            : List.of("ECONOMY");

        return FlightSummary.builder()
                .id(f.getId())
                .flightNumber(f.getFlightNumber())
                .airline(f.getAirline())
                .departureAirport(f.getDepartureAirport())
                .arrivalAirport(f.getArrivalAirport())
                .departureTime(f.getDepartureTime())
                .arrivalTime(f.getArrivalTime())
                .duration(formatDuration(duration))
                .availableSeats(f.getAvailableSeats())
                .currentPrice(price)
                .seatClasses(classes)
                .build();
    }
    
    private String formatDuration(Duration duration) {
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        return hours + "h " + minutes + "m";
    }

    public Flight getFlightById(String id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException("Flight not found with id: " + id));
    }

    public SeatAvailabilityResponse getSeatAvailability(String flightId) {
        Flight flight = getFlightById(flightId);
        
        double occupancyPercent = flight.getTotalSeats() == 0 ? 0 : 
            (double) (flight.getTotalSeats() - flight.getAvailableSeats()) / flight.getTotalSeats();
            
        double currentMultiplier = pricingService.getPriceMultiplier(occupancyPercent);

        return SeatAvailabilityResponse.builder()
                .flightId(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .totalSeats(flight.getTotalSeats())
                .availableSeats(flight.getAvailableSeats())
                .occupancyPercent(occupancyPercent)
                .seatMap(flight.getSeatMap())
                .currentPriceMultiplier(currentMultiplier)
                .build();
    }

    public Flight createFlight(FlightCreateRequest req) {
        int totalSeats = req.getTotalRows() * req.getSeatsPerRow();
        
        List<SeatClass> mappedClasses = req.getSeatClasses() == null ? new ArrayList<>() : 
            req.getSeatClasses().stream().map(sc -> SeatClass.builder()
                .className(sc.getClassName())
                .fromRow(sc.getFromRow())
                .toRow(sc.getToRow())
                .priceMultiplier(sc.getPriceMultiplier())
                .build()).collect(Collectors.toList());

        List<Seat> seats = new ArrayList<>();
        String[] columns = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
        for (int r = 1; r <= req.getTotalRows(); r++) {
            String rowClass = "ECONOMY";
            double multiplier = 1.0;
            
            for (SeatClass sc : mappedClasses) {
                if (r >= sc.getFromRow() && r <= sc.getToRow()) {
                    rowClass = sc.getClassName();
                    multiplier = sc.getPriceMultiplier();
                    break;
                }
            }
            
            for (int c = 0; c < req.getSeatsPerRow(); c++) {
                String col = columns[c];
                BigDecimal seatPrice = req.getBasePrice().multiply(BigDecimal.valueOf(multiplier));
                seats.add(Seat.builder()
                        .seatNumber(r + col)
                        .row(r)
                        .column(col)
                        .seatClass(rowClass)
                        .available(true)
                        .price(seatPrice)
                        .build());
            }
        }

        SeatMap seatMap = SeatMap.builder()
                .totalRows(req.getTotalRows())
                .seatsPerRow(req.getSeatsPerRow())
                .seatClasses(mappedClasses)
                .seats(seats)
                .build();

        Flight flight = Flight.builder()
                .flightNumber(req.getFlightNumber())
                .airline(req.getAirline())
                .departureAirport(req.getDepartureAirport())
                .arrivalAirport(req.getArrivalAirport())
                .departureTime(req.getDepartureTime())
                .arrivalTime(req.getArrivalTime())
                .aircraftType(req.getAircraftType())
                .totalSeats(totalSeats)
                .availableSeats(totalSeats)
                .basePrice(req.getBasePrice())
                .currentPrice(req.getBasePrice())
                .status(FlightStatus.SCHEDULED)
                .seatMap(seatMap)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return flightRepository.save(flight);
    }

    public Flight updateSeatAvailability(String flightId, SeatUpdateRequest req) {
        Flight flight = getFlightById(flightId);
        
        boolean seatFound = false;
        if (flight.getSeatMap() != null && flight.getSeatMap().getSeats() != null) {
            for (Seat seat : flight.getSeatMap().getSeats()) {
                if (seat.getSeatNumber().equals(req.getSeatNumber())) {
                    if (seat.isAvailable() != req.isAvailable()) {
                        seat.setAvailable(req.isAvailable());
                        flight.setAvailableSeats(flight.getAvailableSeats() + (req.isAvailable() ? 1 : -1));
                    }
                    seatFound = true;
                    break;
                }
            }
        }
        
        if (!seatFound) {
            throw new IllegalArgumentException("Seat not found: " + req.getSeatNumber());
        }
        
        flight.setUpdatedAt(LocalDateTime.now());
        return flightRepository.save(flight);
    }

    public List<Airport> getAllAirports() {
        return airportRepository.findAll();
    }

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }
}
