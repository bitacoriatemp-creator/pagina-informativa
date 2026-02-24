@echo off
set PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\Git\bin
git rm --cached commit.bat
del commit.bat
git commit -m "chore: remove temporary commit.bat script"
git push
