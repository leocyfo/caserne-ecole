# Lance les quatre pages de test dans Chrome sans fenêtre et affiche les résultats.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LocalAppData\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw 'Google Chrome est introuvable.' }
node build-test.js; node build-ac.js; node build-lock.js
$url = 'file:///' + ($PSScriptRoot -replace '\\', '/')
$pages = @{ 'test.html' = 'out.html'; 'test-ac.html' = 'out-ac.html'; 'test-lock-s.html' = 'out-ls.html'; 'test-lock-t.html' = 'out-lt.html' }
foreach ($p in $pages.Keys) {
  $profil = Join-Path $env:TEMP ('calendrier-tests-' + [guid]::NewGuid())
  & $chrome --headless=new --disable-gpu --no-first-run "--user-data-dir=$profil" --window-size=1440,1000 --virtual-time-budget=60000 --dump-dom "$url/$p" | Out-File -Encoding utf8 $pages[$p]
  Remove-Item -Recurse -Force $profil -ErrorAction SilentlyContinue
  $res = node build-test.js $pages[$p]
  $ok = ($res | Select-String '^PASS').Count
  $ko = $res | Select-String '^(FAIL|ERROR)'
  Write-Output ("{0} : {1} réussis, {2} échoués" -f $p, $ok, @($ko).Count)
  $ko | ForEach-Object { Write-Output ('  ' + $_) }
}
