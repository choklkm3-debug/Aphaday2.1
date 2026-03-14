# Script para iniciar Aphaday
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

Write-Host ""
Write-Host "Iniciando Aphaday..."
Write-Host ""

$port = 8080
$root = Get-Location

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Servidor rodando em: http://localhost:8080"
Write-Host "Abrindo navegador..."
Write-Host ""

Start-Process "http://localhost:8080"

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
}

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        
        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq '/') { $urlPath = '/index.html' }
        
        $filePath = Join-Path $root $urlPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentType = $contentType
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $res.OutputStream.Write($body, 0, $body.Length)
        }
        
        $res.OutputStream.Close()
    }
}
catch {
    Write-Host "Erro: $_"
}
finally {
    $listener.Close()
    Write-Host "Servidor encerrado."
}
