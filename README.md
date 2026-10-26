# Admission Enquiry Conversion Prediction & Follow-Up Prioritization System

A web app for an admissions office. It does two things:

1. **Predicts** how likely each admission enquiry is to turn into an admission (a machine learning model).
2. **Prioritizes** follow-ups: it ranks open enquiries so counsellors know who to call first.

| Part | Technology |
|------|------------|
| Frontend | React + TypeScript + Vite, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic |
| Database | PostgreSQL, SQLAlchemy, Alembic migrations |
| Machine learning | scikit-learn (logistic regression) |
| Hosting | Vercel (frontend), Render (backend + database), GitHub (code) |

> **Read this first.** This is a starter project. It has **no login system**: anyone who knows the API address can read or change data. Use demo data only until you add authentication. Section 9 lists what has and has not been tested.

---

## 1. Folder structure

```
admission-conversion/
├── .gitignore
├── README.md
├── backend/                         <- deployed to Render (Root Directory = backend)
│   ├── .env.example                 <- copy to .env (never commit .env)
│   ├── .python-version
│   ├── alembic.ini
│   ├── pytest.ini
│   ├── requirements.txt             <- production dependencies
│   ├── requirements-dev.txt         <- adds pytest for running tests
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/0001_create_enquiries_and_followups.py
│   ├── app/
│   │   ├── main.py                  <- FastAPI app (uvicorn app.main:app)
│   │   ├── config.py                <- reads environment variables
│   │   ├── database.py              <- SQLAlchemy engine/session
│   │   ├── models.py                <- database tables
│   │   ├── schemas.py               <- Pydantic validation
│   │   ├── constants.py
│   │   ├── routers/                 <- health, enquiries, predictions, dashboard, demo
│   │   ├── services/                <- prioritization, scoring, demo seed data
│   │   └── ml/                      <- features, synthetic data, model, train CLI
│   └── tests/
└── frontend/                        <- deployed to Vercel (Root Directory = frontend)
    ├── .env.example
    ├── package.json / package-lock.json
    ├── vercel.json
    ├── vite.config.ts, tsconfig*.json
    ├── tailwind.config.js, postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx, App.tsx, index.css
        ├── api/                     <- client.ts (API URL from env), types.ts, options.ts
        ├── components/              <- Layout, EnquiryDrawer, EnquiryForm, ui
        └── pages/                   <- DashboardPage, EnquiriesPage, PredictorPage
```

---

## 2. What you need installed

- **Python 3.12** (3.11 also works; avoid 3.13+ for now because some pinned ML packages have no ready-made builds for it)
- **Node.js 18.18 or newer** (includes npm)
- **PostgreSQL 14 or newer**
- **Git**, and a free **GitHub** account

---

## 3. Run it on your computer

### 3.1 Create the database

Open a terminal and start the PostgreSQL shell (`psql -U postgres`; on Windows you can use "SQL Shell (psql)"). Then run, choosing your own password:

```sql
CREATE USER admissions WITH PASSWORD 'choose_a_password';
CREATE DATABASE admissions_db OWNER admissions;
\q
```

### 3.2 Start the backend

```bash
cd backend

# create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # macOS / Linux
# .venv\Scripts\Activate.ps1       # Windows PowerShell

pip install -r requirements.txt

cp .env.example .env               # Windows: copy .env.example .env
```

Open `backend/.env` in an editor and put your real password into `DATABASE_URL`:

```
DATABASE_URL=postgresql://admissions:choose_a_password@localhost:5432/admissions_db
```

Create the tables, train the starter model, and start the server:

```bash
alembic upgrade head
python -m app.ml.train
uvicorn app.main:app --reload --port 8000
```

Check it works: open <http://localhost:8000/api/health>. You should see `"status":"ok"` and `"database":"connected"`. Interactive API documentation is at <http://localhost:8000/docs>.

### 3.3 Start the frontend (second terminal)

```bash
cd frontend
cp .env.example .env               # Windows: copy .env.example .env
npm install
npm run dev
```

Open <http://localhost:5173>. The sidebar should say **API connected**. On the first visit click **Load demo data** to fill the dashboard with 90 sample enquiries.

### 3.4 Optional: run the backend tests

The tests use a temporary SQLite file, so they do not touch your PostgreSQL data.

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest
```

### 3.5 Build the frontend for production (what Vercel runs)

```bash
cd frontend
npm run build        # output goes to frontend/dist
```

---

## 4. How the predictions and priorities work

**Conversion probability.** A logistic regression model looks at: course, enquiry source, fee affordability, academic score, number of follow-ups, how quickly the student replies, campus visit, and scholarship request. It outputs a probability from 0% to 100%.

**Starter data is synthetic.** On day one there is no admissions history, so the model is first trained on made-up data generated from simple rules (referrals and campus visits convert more, and so on). Its accuracy numbers describe that made-up data, **not your real college**. Treat early scores as illustrative.

**Retrain on real data.** Mark old enquiries as *Admitted* or *Lost*. Once you have at least 100 such enquiries (with at least 15 of each outcome), click **Retrain model** on the dashboard. The model then learns from your real history and re-scores every enquiry.

**Follow-up priority (0 to 100):**

```
priority = 100 x ( 0.60 x conversion probability
                 + 0.25 x overdue      (days since last contact / 10, max 1; a passed follow-up date counts as fully overdue)
                 + 0.15 x freshness )  (newer enquiries score higher: exp(-days since enquiry / 30))
```

High is 60 or more, Medium is 40 or more, Low is below 40. Admitted and lost enquiries are Closed. Priority is calculated each time you load a page, so it always reflects today's date. You can change the weights in `backend/app/services/prioritization.py`.

### API routes

All routes start with `/api`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check (also reports database status) |
| GET, POST | `/api/enquiries` | List (search, filter, sort, paginate) or create |
| GET, PUT, DELETE | `/api/enquiries/{id}` | Read, replace, delete one enquiry |
| PATCH | `/api/enquiries/{id}/status` | Change status |
| GET, POST | `/api/enquiries/{id}/followups` | List or log follow-ups |
| GET | `/api/followups/priority?limit=10` | Open enquiries, highest priority first |
| GET | `/api/dashboard/summary` | Dashboard figures |
| POST | `/api/predict` | What-if prediction (nothing saved) |
| GET | `/api/ml/model-info` | Model details and metrics |
| POST | `/api/ml/retrain` | Retrain and re-score |
| POST | `/api/demo/seed` | Load demo data (`?reset=true` replaces existing rows) |

### Database schema

Created by the Alembic migration `0001_create_enquiries_and_followups.py`.

- **enquiries**: id, student_name, email, phone, city, course_interest, source, previous_score, fee_affordability, enquiry_date, last_contact_date, next_followup_date, followup_count, response_time_hours, campus_visited, scholarship_requested, status, notes, conversion_probability, created_at, updated_at.
- **followups**: id, enquiry_id (links to enquiries, deleted together with it), channel, notes, next_followup_date, created_at.

---

## 5. Environment variables

### Backend (`backend/.env` locally, Render dashboard in production)

| Variable | Required | What to put |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string. Locally: `postgresql://admissions:YOUR_PASSWORD@localhost:5432/admissions_db`. On Render: the **Internal Database URL** of your Render PostgreSQL. Both `postgres://` and `postgresql://` forms work. |
| `CORS_ORIGINS` | **Yes in production** | The exact web address of your frontend, for example `https://your-app.vercel.app`. No trailing slash. Several addresses can be separated with commas. Default allows `http://localhost:5173` and `http://127.0.0.1:5173`. |
| `ENABLE_DEMO_ENDPOINTS` | No (default `true`) | `true` lets the **Load demo data** button work. Set `false` once you store real student data. |
| `PYTHON_VERSION` | **Yes on Render only** | `3.12.3` (see section 7). Not used locally. |

### Frontend (`frontend/.env` locally, Vercel dashboard in production)

| Variable | Required | What to put |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | **Yes in production** | Your Render backend address, for example `https://your-api.onrender.com`. No trailing slash and **do not add `/api`** (the code adds it). Locally: `http://localhost:8000`. |

Vite bakes this value into the build, so after changing it on Vercel you must **redeploy**.

Never put real passwords in `.env.example`, in the README, or in any file you commit. `.gitignore` already excludes `.env`.

---

## 6. Push the code to GitHub

1. On github.com click **New repository**. Name it, for example, `admission-conversion`. Leave "Add a README" **unticked**. Create it.
2. In your terminal, from the `admission-conversion` folder:

```bash
git init
git add .
git status          # check: no ".env" file and no "node_modules" or ".venv" in the list
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/admission-conversion.git
git push -u origin main
```

If `git status` shows a `.env` file, stop and do not commit. Check that `.gitignore` is in the project root.

---

## 7. Deploy

Do the steps in this order, because each one needs an address from the previous step.

### Step 1: Database on Render

1. Render dashboard, **New +**, **PostgreSQL**.
2. Name: `admissions-db`. Plan: Free (for trying out). Create.
3. When it is ready, open it and copy the **Internal Database URL**. You will paste it in step 2.

> **Free database limit:** a free Render PostgreSQL database expires 30 days after creation (with a 14-day grace period to upgrade before it is deleted). Fine for a demo; upgrade or move to another PostgreSQL host (for example Neon or Supabase, using their connection string as `DATABASE_URL`) before storing anything you need to keep.

### Step 2: Backend on Render

Render dashboard, **New +**, **Web Service**, connect your GitHub repository, then use **exactly** these settings:

| Setting | Value |
|---------|-------|
| Language / Runtime | **Python 3** |
| Branch | `main` |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt && python -m app.ml.train` |
| Start Command | `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path (under Advanced) | `/api/health` |
| Instance type | Free (for trying out) |

Environment variables (**Environment** section):

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.12.3` |
| `DATABASE_URL` | the Internal Database URL from step 1 |
| `CORS_ORIGINS` | leave a placeholder such as `http://localhost:5173` for now; you will set the real value in step 4 |
| `ENABLE_DEMO_ENDPOINTS` | `true` |

**Why `PYTHON_VERSION` matters:** Render's default Python is newer than the version these pinned packages were tested with, and the build can fail without it.

Create the service and wait for the deploy to finish. Then open `https://YOUR-SERVICE.onrender.com/api/health`. You should see `"status":"ok"` and `"database":"connected"`. Copy the service address; you need it for step 3.

What the commands do: the build command installs packages and trains the starter model. The start command first creates or updates the database tables (`alembic upgrade head`), then starts the API on the port Render provides.

### Step 3: Frontend on Vercel

Vercel dashboard, **Add New**, **Project**, import the GitHub repository, then use these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | **Vite** |
| Root Directory | `frontend` |
| Install Command | `npm install` (default) |
| Build Command | `npm run build` (default) |
| Output Directory | `dist` (default) |

Environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://YOUR-SERVICE.onrender.com` (the Render address from step 2, no trailing slash, no `/api`) |

Click **Deploy**. `frontend/vercel.json` makes page refreshes on routes such as `/enquiries` work.

### Step 4: Tell the backend about the frontend (CORS)

Browsers block the frontend from calling the backend unless the backend allows it.

1. Copy your Vercel production address, for example `https://admission-conversion.vercel.app`.
2. In Render, open the web service, **Environment**, set `CORS_ORIGINS` to that address (no trailing slash, exactly as shown in the browser). Save; Render redeploys.
3. Open the Vercel address. The sidebar should say **API connected**. Click **Load demo data**.

Vercel "preview" deployments have different addresses and will be blocked unless you add them to `CORS_ORIGINS` (comma-separated).

### Free-tier behaviour to expect

A free Render web service goes to sleep after about 15 minutes without traffic. The first request afterwards can take about a minute, during which the sidebar may show **API unreachable**. Refresh after a minute.

---

## 8. Troubleshooting

| Problem | Likely cause and fix |
|---------|----------------------|
| Sidebar says **API unreachable** | Backend not running or asleep; or `VITE_API_BASE_URL` is wrong. Open `<backend address>/api/health` in a browser to check. After editing a Vercel variable, redeploy. |
| Browser console shows a CORS error | `CORS_ORIGINS` does not exactly match the address in your browser (check `http` vs `https`, trailing slash, `localhost` vs `127.0.0.1`). |
| Health shows `"database":"unavailable"` | `DATABASE_URL` is wrong, or the database is not running or has expired. |
| `password authentication failed` | Password in `DATABASE_URL` does not match the one you created. If it contains symbols like `@` or `/`, URL-encode them or use a simpler password. |
| Render build fails while installing packages | `PYTHON_VERSION` is missing or not `3.12.3`. |
| `alembic: command not found` locally | The virtual environment is not activated. |
| Page refresh gives 404 on Vercel | Root Directory is not `frontend`, so `vercel.json` was not used. |

---

## 9. What has been tested

These checks were run on the code as delivered, in a Linux sandbox with Python 3.12.3, Node 22 and PostgreSQL 16:

- Backend packages installed from `requirements.txt` in a clean virtual environment.
- `alembic upgrade head` ran against real PostgreSQL, and `alembic check` confirmed the migration matches the models.
- Backend started with `uvicorn`; every API route was called against PostgreSQL (create, read, update, delete, follow-ups, predictions, dashboard, priority list, retrain, CORS).
- `python -m pytest`: 7 tests passed.
- `npm install` and `npm run build` (TypeScript strict check plus Vite build) succeeded.
- A real browser (Chromium via Playwright) drove the app against the live backend: empty state, loading demo data, opening an enquiry, logging a follow-up, searching, creating an enquiry, form validation error, the what-if predictor, and a phone-sized layout.

**Not tested:** the actual deployments to Render and Vercel (they need your accounts), Windows and macOS, Python versions other than 3.12, and any browser other than Chromium. Authentication does not exist. The model has only ever seen synthetic data.
