# ===================================================
# SkyPrime Backend Launcher — PowerShell Script
# Starts Eureka Server first, then launches all microservices
# ===================================================

$BackendDir = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🚀 Starting SkyPrime Backend Microservices " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Start Eureka Server first
Write-Host "[1/8] Starting Eureka Discovery Server (Port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\eureka-server'; Write-Host '--- EUREKA SERVER ---' -ForegroundColor Cyan; mvn spring-boot:run"

Write-Host "Waiting 10 seconds for Eureka Server to register..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Step 2: Start API Gateway
Write-Host "[2/8] Starting API Gateway (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\api-gateway'; Write-Host '--- API GATEWAY ---' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Step 3: Start Auth Service
Write-Host "[3/8] Starting Auth Service (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\auth-service'; Write-Host '--- AUTH SERVICE ---' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Step 4: Start Flight Service
Write-Host "[4/8] Starting Flight Service (Port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\flight-service'; Write-Host '--- FLIGHT SERVICE ---' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Step 5: Start Booking Service
Write-Host "[5/8] Starting Booking Service (Port 8083)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\booking-service'; Write-Host '--- BOOKING SERVICE ---' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Step 6: Start Payment Service
Write-Host "[6/8] Starting Payment Service (Port 8084)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\payment-service'; Write-Host '--- PAYMENT SERVICE ---' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Step 7: Start Notification Service
Write-Host "[7/8] Starting Notification Service (Port 8085)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\notification-service'; Write-Host '--- NOTIFICATION SERVICE ---' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Sleep -Seconds 3

# Step 8: Start GenAI Service
Write-Host "[8/8] Starting GenAI Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir\genai-service'; Write-Host '--- GENAI SERVICE ---' -ForegroundColor Cyan; mvn spring-boot:run"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ✅ All 8 backend services launched in separate windows!" -ForegroundColor Green
Write-Host " Eureka Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host " API Gateway:      http://localhost:8080" -ForegroundColor Cyan
Write-Host " To stop all services, run .\stop-all.ps1" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green
