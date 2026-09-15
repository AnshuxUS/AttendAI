# AttendAI — AI Attendance Management Platform

> **"AttendAI — Smarter Attendance. Better Insights."**  
> **Team Name:** NEXT GEN  
> **Project:** AI ATTENDANCE SYSTEM  
> **Academic Context:** Bachelor of Computer Applications (BCA) Capstone Project  

---

## 🌟 Executive Overview
**AttendAI** is an enterprise-grade AI attendance management platform architected for modern colleges, universities, and educational institutions. Built with the aesthetic fidelity, performance, and functionality of top-tier EdTech SaaS platforms, AttendAI connects students, faculty, and administrators with real-time biometric verification, presence duration tracking, automated timetable management, factual AI queries, and an autonomous 9-Agent AI Software Development Team simulator.

---

## 🚀 Key Functional Capabilities

### 1. Privacy-Conscious WebRTC Camera Attendance Session
- **Explicit Teacher Trigger:** Camera hardware only activates when an authorized faculty member explicitly initiates a session for an enrolled cohort (e.g. BCA 1A DBMS).
- **Biometric HUD Overlay:** Live canvas reticles, scanline animations, landmark meshes, and face bounding boxes.
- **Confirmed Presence Duration Tracking:** Does not mark a student present permanently after one glance. Confirms presence at regular intervals (e.g. every 15 seconds) and calculates exact confirmed duration (e.g., 27 minutes out of 60 minutes = 45% = Partial).
- **Late Arrival Grace Period:** Students detected after the configured late threshold (default 15 minutes) are categorized as Late.
- **Missed Detection Tolerance:** Temporary occlusion or lighting change does not mark a student absent. After consecutive missed checks (default 3), the status gracefully transitions to **"Presence Uncertain"**, enabling manual faculty verification.
- **End Session Summary Ledger:** Automatic calculation of Present, Partial, Late, Absent, and Uncertain metrics, with one-click **CSV export** and **print-ready PDF** generation.

### 2. Live Factual AI Attendance Assistant
- Direct relational query engine against the institutional database.
- Answers queries on attendance shortages, weekly timetables, session records, and student profiles without hallucinating fake data.

### 3. AI Software Development Team (9 Agents)
- Dedicated engineering department showcasing 9 specialized AI agents:
  1. **AI Coordinator** (Master Orchestrator)
  2. **Product Manager** (Requirements & Scope)
  3. **UI/UX Designer** (Design System & Accessibility)
  4. **Software Architect** (System Components & Pipeline)
  5. **Developer** (Frontend & Business Logic)
  6. **Database Engineer** (PostgreSQL & Supabase RLS)
  7. **Security Engineer** (Auth & Data Privacy)
  8. **QA Tester** (Edge Cases & Workflows)
  9. **Code Reviewer** (Performance & Standards)
- Interactive 10-stage autonomous workflow runner (Idea -> Requirements -> Architecture -> Design -> Code -> DB -> Security -> QA -> Review -> Final Build) with live terminal logs.

### 4. Role-Based Access Control (RBAC)
- **Administrator:** Institution settings, user account provisioning, audit logs, class creation, correction approvals.
- **Teacher:** Start attendance sessions, live camera HUD, roster verification, correction submissions, timetable.
- **Student:** Personal attendance percentage, attendance history timeline, timetable, notifications, authorized files.
- **Developer:** Multi-agent pipeline inspection, system debugging, project source export.
- Seamless role-switcher included in the top header for instant demonstration and grading.

### 5. Institutional Repository & Document Manager
- Upload, preview, download, and delete curriculum documents, syllabi, and CSV exports.

### 6. Full Dark & Light Theme System
- Cohesive dark mode using Deep Navy Purple (`#1F1E3A`, `#29284F`) and Warm White light mode (`#F7F5F1`), persisted across reloads.

### 7. Supabase PostgreSQL Schema
- Complete SQL script (`supabase/schema.sql`) with 14 relational tables, foreign keys, constraints, and indexes, ready to deploy to any Supabase project.

---

## 🛠️ Quick Start Instructions

### Running Locally
1. Clone or open the project folder in your terminal:
   ```bash
   cd attendai
   ```
2. Start the dev server using Node.js:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

*(Alternatively, open `index.html` directly in any modern web browser like Google Chrome or Microsoft Edge!)*

---

## 📂 Project Architecture
```
attendai/
├── index.html                 # Main Single Page Application shell
├── server.js                  # Zero-dependency local dev server
├── package.json               # Modern ES6 module project configuration
├── README.md                  # System manual and BCA documentation
├── css/
│   ├── design-system.css      # Core brand tokens, colors, light/dark themes
│   ├── layout.css             # Responsive sidebar, header, role switcher
│   ├── components.css         # Cards, badges, modals, tables, forms, drawer
│   ├── camera.css             # Privacy-first Camera HUD, landmark scan overlay
│   └── ai-team.css            # 9-agent pipeline, terminal console
├── js/
│   ├── app.js                 # App router, overview dashboard, modal lifecycle
│   ├── auth.js                # Role-based auth (Admin, Teacher, Student, Developer)
│   ├── database.js            # Unified DB layer with Supabase + relational local fallback
│   ├── seedData.js            # Realistic BCA college seed dataset
│   ├── cameraSession.js       # WebRTC video feed, canvas face detection, presence duration tracker
│   ├── aiAssistant.js         # Real AI assistant querying live relational DB
│   ├── aiTeam.js              # 9 AI agents workflow simulator
│   ├── classesView.js         # Course classes, faculty assignment, roster
│   ├── studentsView.js        # Student directory and slide-over profile drawer
│   ├── attendanceView.js      # Sessions ledger, manual attendance, corrections
│   ├── timetableView.js       # Weekly period schedule
│   ├── reportsView.js         # Analytics, CSV & PDF export
│   ├── notificationsView.js   # Realtime notification center
│   ├── fileManagerView.js     # Secure institutional document repository
│   ├── userManagementView.js  # Administrator account provisioning
│   ├── auditLogsView.js       # Institutional immutable audit trail
│   ├── settingsView.js        # System parameters and cloud connection
│   └── projectExport.js       # Source code export utility
└── supabase/
    └── schema.sql             # 14 PostgreSQL tables with RLS and indexes
```

---

## 👥 Project Credits
- **Team Name:** NEXT GEN
- **Project:** AI ATTENDANCE SYSTEM
- **Course:** Bachelor of Computer Applications (BCA)
- **Year:** 2026-2027
