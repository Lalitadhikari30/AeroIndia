package com.ticketing.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "flight-service", url = "${services.flight.url:}", path = "/api/flights")
public interface FlightServiceClient {

    @GetMapping("/{id}")
    Map<String, Object> getFlightById(@PathVariable("id") String id);

    @GetMapping("/{id}/seats")
    Map<String, Object> getSeatAvailability(@PathVariable("id") String id);

    @PutMapping("/{id}/seats")
    Map<String, Object> updateSeatAvailability(@PathVariable("id") String id, @RequestBody Map<String, Object> request);
}
