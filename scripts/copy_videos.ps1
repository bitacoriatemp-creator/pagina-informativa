$sourceDir = "C:\Users\User\Downloads"
$destDir = "public\videos"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

$videos = Get-ChildItem -Path $sourceDir -Filter "*.mp4" | Sort-Object CreationTime -Descending | Select-Object -First 3

$i = 1
foreach ($video in $videos) {
    $destPath = Join-Path $destDir "hero_video_$i.mp4"
    Write-Host "Copiando $($video.Name) a $destPath"
    Copy-Item -Path $video.FullName -Destination $destPath -Force
    $i++
}
Write-Host "Copia completada."
