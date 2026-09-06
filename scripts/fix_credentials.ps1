$tok = (gh auth token).Trim()
$filePath = Join-Path $env:USERPROFILE '.git-credentials'
Set-Content -Path $filePath -Value "https://magrelone:$tok@github.com"
Write-Host "Credencial atualizada com sucesso para magrelone!"
