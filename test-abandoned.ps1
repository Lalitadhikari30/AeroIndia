$body = @{
    passengerName  = "Lalit Adhikari"
    passengerEmail = "adhikarilalit9968@gmail.com"
    pnr            = "AI-9912"
    flightRoute    = "DEL to BOM (Seat 14A)"
    amount         = 7249
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/notifications/abandoned-payment" -Method POST -ContentType "application/json" -Body $body
    Write-Host "=== ABANDONED PAYMENT NOTIFICATION SUCCESS ==="
    $response | ConvertTo-Json
} catch {
    Write-Host "=== ABANDONED PAYMENT NOTIFICATION FAILED ==="
    Write-Host "Error: $($_.Exception.Message)"
}
