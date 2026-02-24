@echo off
set PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\Git\bin
git add -A
git commit -m "fix(images): assetPath helper prepends basePath for Vercel production" -m "Root cause: unoptimized:true with basePath does NOT auto-prepend /plataforma to src." -m "Solution: assetPath() manually adds /plataforma in production, empty string in dev." -m "Updated: HeroHybrid, FooterSection, PlanesSection, BitacoraSection (13 image refs)." -m "Also fixed BitacoraSection refs to use lowercase filenames matching git rename."
git push
