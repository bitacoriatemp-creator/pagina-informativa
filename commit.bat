@echo off
set PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\Git\bin
git add .
git commit -m "fix(images): migrate PlanesSection img to next/image for basePath compatibility" -m "- Raw <img> tags are not prefixed with basePath='/plataforma' by Next.js at build time" -m "- next/image <Image /> automatically prepends basePath in production (Vercel)" -m "- Wrapped plan artwork in relative div container with fill Image" -m "- Eliminates Vercel LCP warning and fixes broken images under /plataforma/ sub-path"
git push
