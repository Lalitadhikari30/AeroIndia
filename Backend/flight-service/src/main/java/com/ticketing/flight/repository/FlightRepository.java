package com.ticketing.flight.repository;

import com.ticketing.flight.model.Flight;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends MongoRepository<Flight, String> {
    
    List<Flight> findByDepartureAirportAndArrivalAirportAndDepartureTimeBetween(String departureAirport, String arrivalAirport, LocalDateTime start, LocalDateTime end);
    
    List<Flight> findByDepartureAirportAndDepartureTimeBetween(String departureAirport, LocalDateTime start, LocalDateTime end);
    
    Optional<Flight> findByFlightNumber(String flightNumber);
}
