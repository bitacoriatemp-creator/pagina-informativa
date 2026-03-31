# ═══════════════════════════════════════════════════════════════
# BitacorIA - Descargador de Catálogos de Obra Pública
# Portal: Compras MX (upcp-compranet.buengobierno.gob.mx)
# ═══════════════════════════════════════════════════════════════

$OutputDir = "C:\BitacorIA_Data\Catalogos_Crudos"
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

$BaseAPI = "https://upcp-cnetservicios.buengobierno.gob.mx/whitney/sitiopublico"

# Expedientes conocidos con archivos Excel confirmados
$Expedientes = @(
    @{ Id = "2d3571b9fa6840df919b1dbdd9aa3e36"; Nombre = "SICT_Carreteras_Chapopote" },
    @{ Id = "eece595e8cfd441a95a1370fec1cde6c"; Nombre = "INDESALUD_Hospital_Campeche" }
)

# Headers mínimos para simular navegador
$Headers = @{
    "Accept"          = "application/json, text/plain, */*"
    "Accept-Language" = "es-MX,es;q=0.9"
    "User-Agent"      = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Referer"         = "https://comprasmx.buengobierno.gob.mx/"
    "Origin"          = "https://comprasmx.buengobierno.gob.mx"
}

$LogEntries = @()
$DownloadCount = 0

foreach ($exp in $Expedientes) {
    Write-Host "`n═══ Procesando: $($exp.Nombre) ═══" -ForegroundColor Cyan

    # 1. Intentar obtener listado de anexos
    $AnexosUrl = "$BaseAPI/expedientes/$($exp.Id)/anexos?id_proceso=procedimiento&rows=100&page=1"
    Write-Host "  → Consultando anexos: $AnexosUrl"

    try {
        $response = Invoke-RestMethod -Uri $AnexosUrl -Method Get -Headers $Headers -ErrorAction Stop
        Write-Host "  ✓ Respuesta recibida" -ForegroundColor Green

        # Extraer archivos del response
        $archivos = @()
        if ($response.datos) {
            foreach ($dato in $response.datos) {
                if ($dato.archivos) {
                    $archivos += $dato.archivos
                }
                if ($dato.nombre_archivo) {
                    $archivos += $dato
                }
            }
        }
        if ($response.archivos) { $archivos += $response.archivos }

        # Filtrar solo Excel
        $excelFiles = $archivos | Where-Object {
            $_.nombre_archivo -match '\.(xlsx|xls)$' -or
            $_.nombreArchivo -match '\.(xlsx|xls)$' -or
            $_.nombre -match '\.(xlsx|xls)$'
        }

        Write-Host "  → Archivos Excel encontrados: $($excelFiles.Count)"

        foreach ($file in $excelFiles) {
            $fileName = if ($file.nombre_archivo) { $file.nombre_archivo } elseif ($file.nombreArchivo) { $file.nombreArchivo } else { $file.nombre }
            $fileId = if ($file.id_archivo) { $file.id_archivo } elseif ($file.idArchivo) { $file.idArchivo } else { $file.id }

            if (-not $fileName -or -not $fileId) { continue }

            $downloadUrl = "$BaseAPI/archivo/descargar?id=$fileId&id_procedimiento=$($exp.Id)"
            $safeName = "$($exp.Nombre)_$fileName" -replace '[\\/:*?"<>|]', '_'
            $outputPath = Join-Path $OutputDir $safeName

            Write-Host "  ↓ Descargando: $fileName → $safeName"
            try {
                Invoke-WebRequest -Uri $downloadUrl -Headers $Headers -OutFile $outputPath -ErrorAction Stop
                $DownloadCount++
                Write-Host "    ✓ Guardado ($([math]::Round((Get-Item $outputPath).Length/1KB, 1)) KB)" -ForegroundColor Green
                $LogEntries += [PSCustomObject]@{
                    Obra        = $exp.Nombre
                    Archivo     = $fileName
                    ArchivoLocal = $safeName
                    URL         = $downloadUrl
                    Estado      = "OK"
                }
            }
            catch {
                Write-Host "    ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
                $LogEntries += [PSCustomObject]@{
                    Obra        = $exp.Nombre
                    Archivo     = $fileName
                    ArchivoLocal = ""
                    URL         = $downloadUrl
                    Estado      = "ERROR: $($_.Exception.Message)"
                }
            }
        }
    }
    catch {
        Write-Host "  ✗ Error consultando API: $($_.Exception.Message)" -ForegroundColor Red

        # Fallback: intentar descargar directamente con IDs conocidos
        Write-Host "  → Intentando acceso directo al expediente..." -ForegroundColor Yellow
        $directUrl = "$BaseAPI/expedientes/$($exp.Id)/reqeconomicos?id_proceso=procedimiento&rows=50&page=1"
        try {
            $directResp = Invoke-RestMethod -Uri $directUrl -Method Get -Headers $Headers -ErrorAction Stop
            Write-Host "  ✓ Endpoint reqeconomicos accesible" -ForegroundColor Green
            Write-Host "  → Datos: $($directResp | ConvertTo-Json -Depth 2 | Select-Object -First 500)"
        }
        catch {
            Write-Host "  ✗ También falló: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Generar log
if ($LogEntries.Count -gt 0) {
    $logPath = Join-Path $OutputDir "log_descargas.csv"
    $LogEntries | Export-Csv -Path $logPath -NoTypeInformation -Encoding UTF8
    Write-Host "`n═══ Log guardado en: $logPath ═══" -ForegroundColor Green
}

Write-Host "`n═══ RESUMEN: $DownloadCount archivos descargados en $OutputDir ═══" -ForegroundColor Cyan
Write-Host "Archivos en carpeta:"
Get-ChildItem $OutputDir -Filter "*.xls*" | ForEach-Object { Write-Host "  • $($_.Name) ($([math]::Round($_.Length/1KB,1)) KB)" }
