@echo off
set PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\Git\bin
git rm --cached g.bat cleanup.bat 2>nul
del g.bat cleanup.bat 2>nul
git add -A
git commit -m "chore: remove temp scripts"
git push
