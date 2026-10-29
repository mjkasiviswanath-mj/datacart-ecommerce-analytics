@echo off
title DataCart - Full Stack Launcher
echo ========================================================
echo  Initializing DataCart Database...
echo ========================================================
python DataCart/init_db.py

echo ========================================================
echo  Launching Flask Backend in separate window...
echo ========================================================
start "DataCart Flask Backend (Port 5000)" cmd /k "python DataCart/app.py"

echo ========================================================
echo  Launching React Frontend on http://localhost:3000...
echo ========================================================
npm run dev
