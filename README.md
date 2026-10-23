# 🎓 Admission Enquiry Conversion Prediction & Follow-Up Prioritization System
> **College Final Year Project — Frontend & UI/UX Intelligence Foundation**  
> **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React

---

## 📌 Project Overview (Academic Context)

College admission cells process thousands of candidate enquiries across website forms, educational expos, and walk-in campus tours. In traditional setups, counsellors dial enquiries sequentially without knowing student intent, resulting in high candidate drop-out rates and counsellor fatigue.

This system solves admission leakage by combining:
1. **Machine Learning Conversion Probability (0 to 100%):** Evaluates academic marks, campus visits, parent attendance, and lead source signals.
2. **Explainable AI (TreeSHAP Attributions):** Gives counsellors concrete reasons *why* a student is likely to enroll before dialing.
3. **Automated Follow-Up Prioritization:** Segmenting leads into **Urgent (callback < 4h)**, **High (24h)**, **Medium (48h)**, and **Low (drip nurture)** queues.

---

## 🚀 How to Run Frontend Locally (Simple Tanglish Guide)

Windows PowerShell-la script execution policy irunthaalum problem varaama iruka `npm.cmd` use panrom:

### 1. Development Server Start panna:
```powershell
npm.cmd run dev
```
Terminal-la `http://localhost:5173` link varum. Browser-la open panni project-ah view pannalaam!

### 2. Production Build Check panna:
```powershell
npm.cmd run build
```
TypeScript compilation check (`tsc -b`) & Vite bundle build pannum. Dist folder generate aagum.

### 3. Production Build Preview panna:
```powershell
npm.cmd run preview
```

---

## 🔑 Demo Login Personas (1-Click Switch)

Login screen-laye direct quick-switch buttons iruku:
- **Admin / Director View:** `admin@edupredict.edu` (Dr. S. Rangarajan — Admissions Dean)
- **Counsellor View:** `priya@edupredict.edu` (Priya Sundaram — Engineering Admissions)
- **Top Header:** Header-la irukira **"Switch View"** button click panni instant-ah Admin & Counsellor dashboards-ku switch pannalaam!

---

## 🖥️ Screen Directory & Implemented Modules

1. **Login Screen (`/login`)**: Split-screen design, college project pitch, 1-click test credentials.
2. **Director / Admin Dashboard (`/admin`)**: Macro admissions funnel, counsellor workload distribution, monthly velocity charts, high-priority lead closing queue.
3. **Counsellor Action Cockpit (`/counsellor`)**: Personalized call queue with dynamic AI pitch drivers, 1-click call disposition logger modal.
4. **Admission Enquiry Bank (`/enquiries`)**: Full table with multi-criteria filtering (program, priority tier, source, min conversion probability) and sorting.
5. **Register / Edit Lead (`/enquiries/new`)**: Lead registration form with **Live Real-time AI Lead Score Preview** right beside the form as you type!
6. **Student Dossier & AI Insights (`/enquiries/:id`)**: Comprehensive student profile, TreeSHAP positive/negative contribution bars, risk flags, and interaction history.
7. **Follow-Up Prioritization Board (`/follow-ups`)**: Categorized queues for *Today's Calls*, *Overdue Attention*, *Upcoming*, and *Completed Logs* with reschedule modal.
8. **Prediction Engine Details (`/prediction-insights`)**: Interactive lead inspector, priority tier rule matrix, and dataset-wide feature importances.
9. **Conversion Analytics (`/analytics`)**: Recharts admission funnel drop-off, course demand distribution, and acquisition channel yields.
10. **Staff & Counsellors (`/users`)**: Counsellor capacity, personal conversion win-rates, and staff provisioning.
11. **ML Model Benchmark (`/ml-evaluation`)**: Rigorous academic evaluation screen with **ROC-AUC (0.914)**, Confusion Matrix (TP, FP, FN, TN), Calibration Curve, and Model Comparisons (XGBoost vs LightGBM vs Random Forest vs Logistic Regression).

---

## 🛡️ Academic Project Disclaimer
All candidate records and contact numbers are synthetic demo fixtures generated for college project evaluation. No live production data or personal student information is stored.
