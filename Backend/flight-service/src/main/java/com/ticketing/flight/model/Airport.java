package com.ticketing.flight.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "airports")
public class Airport {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String iataCode;
    
    private String name;
    
    private String city;
    
    private String country;
    
    private String timezone;
}
