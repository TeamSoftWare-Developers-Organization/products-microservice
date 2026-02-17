$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$icsPath = "C:\Windows\System32\drivers\etc\hosts.ics"
$txtPath = "C:\Windows\System32\drivers\etc\hosts.txt"

Write-Host "🔍 Scaning for 'Spy' files..." -ForegroundColor Cyan

# 1. Delete the fake files
if (Test-Path $icsPath) {
    Remove-Item $icsPath -Force
    Write-Host "✅ Found and deleted hosts.ics (The Calendar Spy!)" -ForegroundColor Green
} else {
    Write-Host "defaults: hosts.ics not found (Good)." -ForegroundColor Gray
}

if (Test-Path $txtPath) {
    Remove-Item $txtPath -Force
    Write-Host "✅ Found and deleted hosts.txt" -ForegroundColor Green
}

# 2. Update the real file
try {
    $content = Get-Content $hostsPath -Raw -ErrorAction Stop
} catch {
    $content = ""
    Write-Host "⚠️ Could not read hosts file. Creating new one needed?" -ForegroundColor Yellow
}

if ($content -notmatch "app.microshop.local") {
    Write-Host "📝 Adding entries to the REAL hosts file..." -ForegroundColor Cyan
    try {
        Add-Content $hostsPath "`n127.0.0.1 app.microshop.local`n127.0.0.1 api.microshop.local" -ErrorAction Stop
        Write-Host "✅ Successfully added Microshop entries!" -ForegroundColor Green
    } catch {
        Write-Host "❌ FAILED to edit hosts file. Run this script as ADMINISTRATOR!" -ForegroundColor Red
        return
    }
} else {
    Write-Host "✅ Entries already exist in the real file." -ForegroundColor Green
}

# 3. Flush DNS
Write-Host "🔄 Flushing DNS Cache..." -ForegroundColor Cyan
ipconfig /flushdns

# 4. Verification
Write-Host "🚀 Testing Connection..." -ForegroundColor Cyan
$ping = Test-Connection -ComputerName app.microshop.local -Count 1 -ErrorAction SilentlyContinue

if ($ping) {
    Write-Host "🎉 SUCCESS! app.microshop.local is reachable at $($ping.IPV4Address)" -ForegroundColor Green
    Write-Host "Go to http://app.microshop.local now!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Ping failed. Ensure you ran as Admin and try restarting your browser." -ForegroundColor Red
}

Read-Host -Prompt "Press Enter to exit"
