@echo off
set PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\Git\bin

REM Rename files to lowercase (case-sensitive on Linux/Vercel)
REM Git tracks these renames for Vercel's Linux filesystem

git mv "public/images/LOGO-BITACORIA-IMPI-TRANSPARENTE-PNG-01.webp" "public/images/logo-bitacoria.webp"
git mv "public/images/CLIMA_LLUVIOSO.webp" "public/images/clima_lluvioso.webp"
git mv "public/images/COLADO_EJE3.webp" "public/images/colado_eje3.webp"
git mv "public/images/Camion_llegando.webp" "public/images/camion_llegando.webp"
git mv "public/images/PLANO_ANIMACION.webp" "public/images/plano_animacion.webp"

git add -A
git commit -m "fix(images): rename uppercase filenames to lowercase for Linux/Vercel case-sensitivity"
git push
del %~f0
