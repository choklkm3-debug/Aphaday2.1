$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$src = "C:\Users\santo\OneDrive\Documentos\verdent-projects\new-project\DiarioApp.cs"
$out = "C:\Users\santo\OneDrive\Documentos\verdent-projects\new-project\Aphaday.exe"

$refs = "System.dll,System.Windows.Forms.dll,System.Drawing.dll,System.Net.dll,System.Web.dll"

Write-Host "Compilando Diario.exe..."

$args = @(
    "/target:winexe",
    "/optimize+",
    "/out:`"$out`"",
    "/reference:$refs",
    "`"$src`""
)

$result = & $csc @args 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilado com sucesso: $out"
} else {
    Write-Host "Erro na compilacao:"
    $result | ForEach-Object { Write-Host $_ }
}
