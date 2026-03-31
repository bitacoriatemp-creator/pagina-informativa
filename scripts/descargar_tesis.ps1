# ═══════════════════════════════════════════════════════════════
# BitacorIA - Descargador Masivo de Tesis UNAM (TESIUNAM)
# ═══════════════════════════════════════════════════════════════

$dest = "C:\BitacorIA_Data\Tesis_Bitacoras"
$h = @{"User-Agent"="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

$tesis = @(
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2024/ene_mar/0851882/0851882.pdf"; name="UNAM_2023_ResidenciaEscuela_SanchezAcuna.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2024/abr_jun/0854202/0854202.pdf"; name="UNAM_2023_ResidenciaQuintasSantiago_SotoCastro.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2023/marzo/0836532/0836532.pdf"; name="UNAM_2023_ResidenciaCuartelPolicia_VelazquezDavila.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2022/abril/0824653/0824653.pdf"; name="UNAM_2022_ResidenciaRestauracion_HernandezAguilar.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2022/octubre/0832193/0832193.pdf"; name="UNAM_2022_ResidenciaPenthouse_HernandezContreras.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2024/ene_mar/0851880/0851880.pdf"; name="UNAM_2019_ResidenciaIngAplicada_BaltazarSaucedo.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2014/mayo/0713328/0713328.pdf"; name="UNAM_2014_ResidenciaMetro_MoralesTrejo.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2010/abril/0656758/0656758.pdf"; name="UNAM_2010_ResidenciaObra_PerezTirado.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptb2010/junio/0659177/0659177.pdf"; name="UNAM_2010_ResidenciaOpcion_ReyneroGarcia.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/pd2007/0615817/0615817.pdf"; name="UNAM_2007_ResidenciaViviendaSocial_CidEspinosa.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/pmig2018/0024716/0024716.pdf"; name="UNAM_1984_OrganizacionResidencia_DuranCasas.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/pmig2019/0013072/0013072.pdf"; name="UNAM_1982_OrganizacionResidencia_OlavarietaTinoco.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2024/abr_jun/0854223/0854223.pdf"; name="UNAM_2024_SupervisionDrenaje_GalvanHernandez.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2022/junio/0826590/0826590.pdf"; name="UNAM_2022_SupervisionTienda_GarciaJaime.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2017/abril/0757742/0757742.pdf"; name="UNAM_2017_CertificacionSupervision_MunozGonzalez.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2013/mayo/0694910/0694910.pdf"; name="UNAM_2013_SupervisionConflictos_PorrasGodinez.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2013/Presenciales/0696229/0696229.pdf"; name="UNAM_2012_SupervisionUHabitacional_SanPedroAyala.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptb2011/junio/0670551/0670551.pdf"; name="UNAM_2011_ManualSupervision_AhumadaTrejo.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptb2011/septiembre/0673406/0673406.pdf"; name="UNAM_2011_SupervisionGlobal_GarciaSerrano.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/ptd2004/jul_sep/0321421/0321421.pdf"; name="UNAM_2003_BitacoraObraCFE_EnriquezPita.pdf"},
  @{url="https://tesiunamdocumentos.dgb.unam.mx/pmig2016/0203859/0203859.pdf"; name="UNAM_1994_BitacoraObra_SolisVargas.pdf"}
)

$ok = 0; $fail = 0
foreach ($t in $tesis) {
  $out = "$dest\$($t.name)"
  if (Test-Path $out) { Write-Host "SKIP: $($t.name) (ya existe)"; $ok++; continue }
  Write-Host "Descargando: $($t.name)..."
  try {
    Invoke-WebRequest -Uri $t.url -Headers $h -OutFile $out -TimeoutSec 60 -ErrorAction Stop
    $s = (Get-Item $out).Length/1KB
    if ($s -lt 10) { Write-Host "  WARN: Muy pequeno ($([math]::Round($s,1))KB) - posible error"; $fail++ }
    else { Write-Host "  OK: $([math]::Round($s,1)) KB"; $ok++ }
  } catch { Write-Host "  ERROR: $($_.Exception.Message)"; $fail++ }
  Start-Sleep -Seconds 4
}
Write-Host "`n=== RESUMEN: $ok exitosos, $fail fallidos ==="
Get-ChildItem $dest -Filter "*.pdf" | ForEach-Object { Write-Host "  $($_.Name) | $([math]::Round($_.Length/1KB,1))KB" }
