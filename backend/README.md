# 🚀 Admission Intelligence Backend API
> **FastAPI + SQLAlchemy + PostgreSQL / SQLite + Pydantic v2 + Alembic + JWT RBAC**

Production-grade, asynchronous backend API for the **Admission Enquiry Conversion Prediction & Follow-Up Prioritization System**. Enforces server-side role-based authorization (RBAC) ensuring counsellors only access their assigned leads, while admission directors enjoy macro-level institutional visibility.

---

## 🏗️ Tech Stack & Security Architecture

- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/) (0.115+) with automatic OpenAPI / Swagger interactive documentation (`/docs`).
- **ORM & Database:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/) supporting PostgreSQL (`postgresql+psycopg2://`) with SQLite fallback for instant local tests.
- **Data Validation:** [Pydantic v2](https://docs.pydantic.dev/) schemas with strict input sanitization.
- **Database Migrations:** [Alembic](https://alembic.sqlalchemy.org/) for schema versioning.
- **Password Security:** `bcrypt` with automatic 12-round salting.
- **Authorization:** JSON Web Tokens (PyJWT) with cryptographic HS256 signatures, user IDs, and role claims.
- **Access Control (RBAC):** Server-side dependency guard (`verify_enquiry_access`) verifying permissions on every single protected lead interaction.

---

## 🗄️ Database Tables (7 Core Entities)

1. **`users`**: Staff & Director accounts (`admin` or `counsellor`), hashed passwords, department, active status.
2. **`students`**: Candidate academic records (12th / UG score, maths & physics cutoff, entrance percentile, budget category, hostel needs).
3. **`enquiries`**: Lead lifecycle status (`New`, `Contacted`, `In Discussion`, `Campus Visit Scheduled`, `Application Submitted`, `Converted`, `Lost`), channel attribution, engagement telemetry.
4. **`interactions`**: Chronological conversation history (Phone Call, WhatsApp, Campus Visit, Email).
5. **`followups`**: Scheduled callback board with urgency priorities (`Urgent`, `High`, `Medium`, `Low`) and call dispositions.
6. **`predictions`**: Explainable AI inference log storing conversion probability (0-100%), confidence score, and TreeSHAP positive/negative factor weights.
7. **`admissions`**: Converted seat enrollment registry with fee payment and scholarship tracking.

---

## ⚡ Quick Setup & Run (Tanglish Guide)

### 1. Virtual Environment Activate panna:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
```
*(PowerShell execution restriction irundha direct-ah `.\.venv\Scripts\python.exe` use pannalaam)*

### 2. Dependencies Install panna:
```powershell
.\.venv\Scripts\pip.exe install -r requirements.txt
```

### 3. Fictional Demo Data Seed panna:
Frontend-la irukra same synthetic college candidates-ah database-la seed panna indha script run pannunga:
```powershell
.\.venv\Scripts\python.exe -m app.seeder.seed_data
```
> **Output:** Admin (`admin@edupredict.edu` / `Admin@123`) and Counsellor (`priya@edupredict.edu` / `Priya@123`) accounts and candidate leads auto-seed aagidum!

### 4. Backend Server Start panna:
```powershell
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```
Terminal-la server start aagidum:
- 🌐 **Interactive Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🌐 **ReDoc Technical Specs:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Automated Tests Run Panna:

All 21 unit and permission security tests run panna:
```powershell
.\.venv\Scripts\pytest.exe tests -v
```
**Test Results:**
- ✅ 21 / 21 tests passing
- Authentication, Token Expiry, Permission Guards (Counsellor lead isolation), Enquiry CRUD, and ML Scoring fully verified.

---

## 🔒 Server-Side Permission Verification Rules

| Protected Action | Admin / Director | Assigned Counsellor | Unassigned Counsellor |
| :--- | :---: | :---: | :---: |
| View Lead Dossier | ✅ Allowed | ✅ Allowed | ❌ **403 Forbidden** |
| Update Lead & Stage | ✅ Allowed | ✅ Allowed | ❌ **403 Forbidden** |
| Log Call Interaction | ✅ Allowed | ✅ Allowed | ❌ **403 Forbidden** |
| Reschedule Follow-up | ✅ Allowed | ✅ Allowed | ❌ **403 Forbidden** |
| Staff Management (`/users`) | ✅ Allowed | ❌ **403 Forbidden** | ❌ **403 Forbidden** |
| Delete Enquiry | ✅ Allowed | ❌ **403 Forbidden** | ❌ **403 Forbidden** |
