package com.ticketing.flight.repository;

import com.ticketing.flight.model.Airport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AirportRepository extends MongoRepository<Airport, String> {
    Optional<Airport> findByIataCode(String iataCode);
}
