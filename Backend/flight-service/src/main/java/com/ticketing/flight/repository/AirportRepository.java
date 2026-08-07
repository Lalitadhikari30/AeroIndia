package com.ticketing.flight.repository;

import com.ticketing.flight.model.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AirportRepository extends JpaRepository<Airport, String> {
    Optional<Airport> findByIataCode(String iataCode);
}
