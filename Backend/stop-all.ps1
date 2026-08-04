# ===================================================
# SkyPrime Backend Stopper — PowerShell Script
# Stops all Java processes running Spring Boot services
# ===================================================

Write-Host "Stopping all Spring Boot Java processes..." -ForegroundColor Yellow

$ports = @(8761, 8080, 8081, 8082, 8083, 8084, 8085)

foreach ($port in $ports) {
    $netstat = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($netstat) {
        foreach ($conn in $netstat) {
            $pidToKill = $conn.OwningProcess
            if ($pidToKill -gt 0) {
                Write-Host "Killing process PID $pidToKill listening on port $port..." -ForegroundColor Red
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Fallback: kill remaining java processes launched by maven
Get-Process -Name "java" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping Java process PID $($_.Id)..." -ForegroundColor Red
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ All backend services stopped." -ForegroundColor Green
