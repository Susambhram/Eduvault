# EduVault — Flask + MySQL starter

This starter gives you a working foundation for the EduVault synopsis:
- Student registration and login (passwords are hashed)
- Role-aware dashboards
- Resource search and category filtering
- Teacher/admin resource upload and download
- Teacher/admin announcements
- MySQL tables for users, subjects, resources and announcements

It does **not** yet implement AI/RAG, mock tests, topic-wise performance analysis, recommendations, or a complete admin/staff-management workflow. Those should be added as later modules.

## 1. Requirements
- Python 3.10 or newer
- MySQL Server 8.x (or a compatible MySQL server)
- VS Code and its Python extension

## 2. Create the database
Open MySQL Workbench or the MySQL command line and run:

```sql
CREATE DATABASE eduvault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Create/use a MySQL account with permission to use this database. Put its credentials in `.env`.

## 3. Set up the project in VS Code
Open this folder in VS Code, then open a terminal in the project folder.

Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and set `DB_PASSWORD` to your own MySQL password. Change `SECRET_KEY` to a long random value. Do not share or commit `.env`.

If PowerShell blocks activation, use Command Prompt and run:
```bat
.venv\Scripts\activate.bat
```

## 4. Create tables and demo subjects

```powershell
flask --app app init-db
flask --app app seed-demo
```

## 5. Start the development server

```powershell
flask --app app run --debug
```

Open http://127.0.0.1:5000 in your browser. Stop the server with Ctrl+C.

## 6. Make a teacher account for local testing
Public registration intentionally only creates student accounts. After registering your own account, open MySQL Workbench and run this query, replacing the email:

```sql
UPDATE user SET role = 'teacher' WHERE email = 'your-email@example.com';
```

Log out and log back in. You should now see Upload and Announcement in the navigation. This manual role change is only for local development; build a protected admin workflow before deployment.

## Notes
- Uploaded documents are saved in `uploads/`; metadata is stored in MySQL.
- Only PDF, DOC, DOCX, PPT, PPTX and TXT are accepted, up to 20 MB.
- This is a learning prototype. Before production, add CSRF protection, stronger rate limiting, security review, backups, and controlled staff provisioning. Never run Flask's debug server as a public production server.
- Use only academic files you have permission to distribute.
