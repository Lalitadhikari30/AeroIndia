package com.ticketing.booking.config;

import lombok.extern.slf4j.Slf4j;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@ConditionalOnProperty(name = "redisson.enabled", havingValue = "true")
@Slf4j
public class RedissonConfig {

    @Value("${redisson.address}")
    private String address;

    @Value("${redisson.password:}")
    private String password;

    @Bean
    public RedissonClient redissonClient() {
        try {
            Config config = new Config();
            String cleanAddress = address;
            String parsedPassword = password;
            String parsedUsername = null;

            if (address != null && address.contains("@")) {
                java.net.URI uri = java.net.URI.create(address);
                cleanAddress = uri.getScheme() + "://" + uri.getHost() + ":" + (uri.getPort() > 0 ? uri.getPort() : 6379);
                String userInfo = uri.getUserInfo();
                if (userInfo != null) {
                    if (userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        parsedUsername = parts[0];
                        parsedPassword = parts[1];
                    } else {
                        parsedPassword = userInfo;
                    }
                }
            }

            var singleServerConfig = config.useSingleServer()
                    .setAddress(cleanAddress)
                    .setConnectionPoolSize(5)
                    .setConnectionMinimumIdleSize(2)
                    .setConnectTimeout(10000)
                    .setTimeout(10000)
                    .setKeepAlive(true)
                    .setPingConnectionInterval(30000)
                    .setSslEnableEndpointIdentification(false)
                    .setSslProvider(org.redisson.config.SslProvider.JDK);

            if (StringUtils.hasText(parsedUsername) && !"default".equalsIgnoreCase(parsedUsername)) {
                singleServerConfig.setUsername(parsedUsername);
            }
            if (StringUtils.hasText(parsedPassword)) {
                singleServerConfig.setPassword(parsedPassword);
            }

            log.info("Connecting to Redis at {} (username: {})", cleanAddress, parsedUsername);
            return Redisson.create(config);
        } catch (Exception e) {
            log.error("Failed to connect to Redis. Distributed locking will be disabled.", e);
            return null;
        }
    }
}
