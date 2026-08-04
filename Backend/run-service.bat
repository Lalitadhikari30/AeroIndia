@echo off
if "%~1"=="" (
    echo Usage: run-service [eureka ^| gateway ^| auth ^| flight ^| booking ^| payment ^| notification ^| genai]
    echo Example: run-service flight
    exit /b 1
)

set SERVICE=

if /i "%~1"=="eureka" set SERVICE=eureka-server
if /i "%~1"=="gateway" set SERVICE=api-gateway
if /i "%~1"=="auth" set SERVICE=auth-service
if /i "%~1"=="flight" set SERVICE=flight-service
if /i "%~1"=="booking" set SERVICE=booking-service
if /i "%~1"=="payment" set SERVICE=payment-service
if /i "%~1"=="notification" set SERVICE=notification-service
if /i "%~1"=="genai" set SERVICE=genai-service

if "%SERVICE%"=="" (
    echo Unknown service: %~1
    echo Valid options: eureka, gateway, auth, flight, booking, payment, notification, genai
    exit /b 1
)

set MAVEN_OPTS=-Xms64m -Xmx256m
echo Starting %SERVICE% in low-memory mode...
cd /d "%~dp0\%SERVICE%"
mvn spring-boot:run
