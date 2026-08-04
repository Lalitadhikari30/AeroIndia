package com.ticketing.booking.service;

import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class SeatLockService {

    private final RedissonClient redissonClient;

    public SeatLockService(@Autowired(required = false) RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    public boolean acquireSeatLock(String flightId, String seatNumber, long waitTimeMs, long leaseTimeMs) {
        if (redissonClient == null) {
            log.warn("Redisson client not configured. Falling back to DB optimistic locking.");
            return true; // Bypass distributed lock if Redis is disabled
        }

        String lockKey = String.format("lock:flight:%s:seat:%s", flightId, seatNumber);
        RLock lock = redissonClient.getLock(lockKey);

        try {
            boolean acquired = lock.tryLock(waitTimeMs, leaseTimeMs, TimeUnit.MILLISECONDS);
            if (acquired) {
                log.info("Acquired seat lock for key: {}", lockKey);
            } else {
                log.warn("Failed to acquire seat lock for key: {}", lockKey);
            }
            return acquired;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Interrupted while trying to acquire lock for key: {}", lockKey, e);
            return false;
        }
    }

    public void releaseSeatLock(String flightId, String seatNumber) {
        if (redissonClient == null) {
            return;
        }

        String lockKey = String.format("lock:flight:%s:seat:%s", flightId, seatNumber);
        RLock lock = redissonClient.getLock(lockKey);

        try {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.info("Released seat lock for key: {}", lockKey);
            }
        } catch (IllegalMonitorStateException e) {
            log.warn("Attempted to release a lock that wasn't held by the current thread: {}", lockKey);
        } catch (Exception e) {
            log.error("Error releasing lock for key: {}", lockKey, e);
        }
    }
}
