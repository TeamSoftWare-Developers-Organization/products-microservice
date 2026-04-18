# Migrate Docker Desktop WSL Data to E: Drive
Write-Host "Stopping Docker Desktop..."
# Try to stop Docker Desktop gracefully
Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Shutting down WSL..."
wsl --shutdown

$targetDir = "E:\DockerData"
if (-Not (Test-Path -Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir
}

Write-Host "Exporting docker-desktop-data to $targetDir\docker-desktop-data.tar..."
wsl --export docker-desktop-data "$targetDir\docker-desktop-data.tar"

Write-Host "Unregistering old docker-desktop-data (Reclaiming C: space)..."
wsl --unregister docker-desktop-data

Write-Host "Importing docker-desktop-data to E: drive..."
wsl --import docker-desktop-data $targetDir "$targetDir\docker-desktop-data.tar" --version 2

Write-Host "Exporting docker-desktop to $targetDir\docker-desktop.tar..."
wsl --export docker-desktop "$targetDir\docker-desktop.tar"

Write-Host "Unregistering old docker-desktop..."
wsl --unregister docker-desktop

Write-Host "Importing docker-desktop to E: drive..."
wsl --import docker-desktop "$targetDir\docker-desktop" "$targetDir\docker-desktop.tar" --version 2

Write-Host "Cleaning up tar files..."
Remove-Item "$targetDir\docker-desktop-data.tar" -Force
Remove-Item "$targetDir\docker-desktop.tar" -Force

Write-Host "Migration complete! Please start Docker Desktop manually."
