Add-Type -AssemblyName System.Drawing

$sizes = @(192, 512)

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    $bg = [System.Drawing.Color]::FromArgb(26, 26, 26)
    $bgBrush = New-Object System.Drawing.SolidBrush($bg)

    $r = [int]($size * 0.18)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $r*2, $r*2, 180, 90)
    $path.AddArc($size - $r*2, 0, $r*2, $r*2, 270, 90)
    $path.AddArc($size - $r*2, $size - $r*2, $r*2, $r*2, 0, 90)
    $path.AddArc(0, $size - $r*2, $r*2, $r*2, 90, 90)
    $path.CloseFigure()
    $g.FillPath($bgBrush, $path)

    $fontSize = [int]($size * 0.48)
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textColor = [System.Drawing.Color]::FromArgb(247, 247, 245)
    $textBrush = New-Object System.Drawing.SolidBrush($textColor)

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rectF = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $g.DrawString("d", $font, $textBrush, $rectF, $sf)
    $g.Dispose()

    $outPath = "C:\Users\santo\OneDrive\Documentos\verdent-projects\new-project\icons\icon-$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Criado: $outPath"
}
