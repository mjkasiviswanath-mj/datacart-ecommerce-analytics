@echo off
title DataCart - Flask Backend
echo ========================================================
echo  Checking SQLite database...
echo ========================================================
python DataCart/init_db.py

echo ========================================================
echo  Starting DataCart Flask Server on http://127.0.0.1:5000
echo ========================================================
python DataCart/app.py
pause
