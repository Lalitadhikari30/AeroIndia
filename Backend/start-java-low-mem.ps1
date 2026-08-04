# SkyPrime Low-Memory Java Backend Launcher
# Runs Java microservices in a single terminal with capped memory (-Xmx128m)

$BackendDir = $PSScriptRoot
$env:MAVEN_OPTS="-Xms32m -Xmx128m"

Write-Host "Starting Java Backend Services in low-memory mode (128MB max per service)..." -ForegroundColor Yellow

$services = @("eureka-server", "api-gateway", "auth-service", "flight-service", "booking-service", "payment-service")

foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Cyan
    Start-Job -Name $service -ScriptBlock {
        param($dir)
        Set-Location $dir
        mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xms32m -Xmx128m"
    } -ArgumentList "$BackendDir\$service"
    Start-Sleep -Seconds 5
}

Write-Host "✅ Background jobs running in single window. View with: Get-Job" -ForegroundColor Green
