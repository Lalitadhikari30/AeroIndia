package com.ticketing.genai.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "flight-service", url = "${services.flight.url:}", path = "/api/flights")
public interface FlightServiceClient {
    @GetMapping("/search")
    List<Map<String, Object>> searchFlights(@RequestParam("from") String from,
                                            @RequestParam("to") String to,
                                            @RequestParam("date") String date);
}
