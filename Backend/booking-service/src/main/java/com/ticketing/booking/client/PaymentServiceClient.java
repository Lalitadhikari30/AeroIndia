package com.ticketing.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "payment-service", path = "/api/payments")
public interface PaymentServiceClient {

    @PostMapping("/")
    Map<String, Object> processPayment(@RequestBody Map<String, Object> request);

    @PostMapping("/{id}/refund")
    Map<String, Object> processRefund(@PathVariable("id") String id, @RequestBody Map<String, Object> request);
}
