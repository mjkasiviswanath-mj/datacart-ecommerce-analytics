# DataCart – E-Commerce Sales & Data Analytics Platform
> College Data Science Programming Subject Project

This repository contains two fully runnable versions of the **DataCart** platform:
1. **React + Vite Frontend** (`src/`): Interactive TypeScript/React application with built-in client analytics, live cart, orders, and ML recommendation simulation.
2. **Python Flask + SQLite Backend** (`DataCart/`): Full-stack Flask web application backed by SQLite (`database.db`), Pandas & NumPy statistical analysis, and Scikit-learn TF-IDF recommendations.

---

## ⚡ Quick Start in VS Code (Recommended)

This project is pre-configured with complete VS Code Run & Debug configurations and tasks.

### Option 1: Press `F5` in VS Code (1-Click Run & Debug)
1. Open this folder in VS Code (`File > Open Folder...`).
2. Open the **Run and Debug** view (`Ctrl + Shift + D` or `Cmd + Shift + D`).
3. Select your desired launch target from the dropdown:
   - **`⚡ Run Full Stack (React + Flask)`**: Simultaneously launches both React on port `3000` and Flask on port `5000`.
   - **`🚀 1. Run React Frontend (Vite)`**: Launches the React/Vite development server at `http://localhost:3000`.
   - **`🐍 2. Run Flask Backend (DataCart)`**: Launches the Flask application at `http://127.0.0.1:5000`.
   - **`🗄️ 3. Initialize SQLite Database (init_db.py)`**: Creates and seeds the SQLite database.
4. Press **`F5`** or click the green **Play** button.

---

### Option 2: Run via VS Code Tasks (`Ctrl + Shift + B`)
Press `Ctrl + Shift + B` (or `Cmd + Shift + B` on Mac) to run:
- **`npm: dev (Start React Frontend)`**
- Or press `Ctrl + Shift + P` -> `Tasks: Run Task` -> choose **`🚀 Start Full Stack (React + Flask)`**.

---

### Option 3: Double-Click Runner Scripts (Windows)
In the root directory, double-click any of the helper batch files:
- **`run_fullstack.bat`**: Initializes the database and starts both servers.
- **`run_frontend.bat`**: Starts the React Vite frontend at `http://localhost:3000`.
- **`run_backend.bat`**: Checks the SQLite database and starts Flask at `http://127.0.0.1:5000`.

---

### Option 4: Run in VS Code Terminal

#### 1. React Frontend (Port 3000)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 2. Python Flask Backend (Port 5000)
```bash
# 1. Initialize SQLite database & seed data
python DataCart/init_db.py

# 2. Start Flask server
python DataCart/app.py
```
Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## 🔐 Default Login Credentials
- **Admin**: `admin@datacart.com` / `admin123`
- **Customer**: `kasi@example.com` / `password123`

---

## 📁 VS Code Configuration Summary
- [`.vscode/launch.json`](.vscode/launch.json): 5 Run/Debug targets + Compound launcher.
- [`.vscode/tasks.json`](.vscode/tasks.json): Build, dev server, database initialization, and full-stack tasks.
- [`.vscode/settings.json`](.vscode/settings.json): Python interpreter and TypeScript paths.
- [`.vscode/extensions.json`](.vscode/extensions.json): Recommended Python, React, ESLint, and Tailwind extensions.
