# Campus Care - Smart Campus Issue Management & Escalation System

Campus Care is a full-stack MERN application designed for colleges and universities to report, track, escalate, and resolve student complaints and campus facility issues transparently.

---live link:https://campus-care-ao1m.onrender.com/

## 🚀 Quick Start (Running Locally)

### 1. Requirements
- **Node.js**: v18+ or v20+
- **NPM**: v9+
- *(Optional)* MongoDB: If no native MongoDB is running, the backend automatically launches a local embedded MongoDB instance with data persistence at `backend/data/db`.

### 2. Install Dependencies
From the repository root:
```bash
npm run install:all
```
*(or run `npm install` inside both `/backend` and `/frontend`)*

### 3. Seed Demo Data
Populates Admin, Staff (IT & Facilities), Student accounts, sample tickets, timeline history, and student feedback:
```bash
npm run seed
```
*(or inside `/backend`: `npm run seed:demo`)*

### 4. Start the Application
Open two terminals:

**Terminal 1 (Backend API):**
```bash
npm run dev:backend
# Starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:frontend
# Starts at http://localhost:5173
```

---

## 👥 Demo Credentials

The login page at **`http://localhost:5173/login`** includes **1-Click Quick Login** buttons for easy testing. Alternatively, you can use:

| Role | Email | Password | Department / Access |
|---|---|---|---|
| **Admin** | `admin@campuscare.edu` | `AdminPassword123` | Full Campus Overview, Analytics, Complaints, Staff Mgmt, Feedback |
| **Staff (IT)** | `marcus.staff@campuscare.edu` | `StaffPassword123` | IT & Infrastructure Department Complaints |
| **Staff (Facility)** | `elena.staff@campuscare.edu` | `StaffPassword123` | Hostel & Facilities Complaints |
| **Student** | `alex.student@campuscare.edu` | `StudentPassword123` | Submit issues, track live status, rate resolved tickets |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 18 + Vite
  - React Router v6
  - Tailwind CSS + Custom Design System tokens
  - Recharts (Interactive Analytics Charts)
- **Backend**:
  - Node.js + Express
  - MongoDB + Mongoose (with embedded MongoDB memory server fallback)
  - JWT Authentication + Role-Based Access Control (RBAC)
  - Zod validation schemas
  - Multer file uploads for complaint attachments
  - Morgan logger & Helmet security headers

---

## 📋 Features

- **Multi-Role Authentication**: Dedicated portals for Students, Department Staff, and Campus Administrators.
- **Interactive Analytics**: Status breakdown, priority distribution, department metrics, and resolution timelines.
- **Issue Lifecycle & Timeline**: Track issues from `SUBMITTED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` / `REJECTED`.
- **Staff Assignment & Department Routing**: Admins can assign complaints to verified department staff.
- **Staff Management**: Admins can onboard new staff, activate/deactivate accounts, and view assigned workloads.
- **Feedback & Ratings**: Students can rate resolved tickets (1-5 stars) and submit detailed reviews.
- **Real-Time Discussions**: Comment threads with attachments on individual complaints.
- **Notifications**: Automated in-app notifications for status updates and staff assignments.
