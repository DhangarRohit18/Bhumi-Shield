# 🛡️ BHUMI-SHIELD — Team Workload & Software Architecture Division

> **Project**: BHUMI-SHIELD (National Land Acquisition Sentinel & Decision Support Platform)  
> **Target Event**: Smart India Hackathon (SIH 2026)  
> **Team Scope**: Software Systems (Web Portal + Mobile App + Firebase Cloud + AI Engine + GIS Engine)  
> *(Note: Hardware & IoT components excluded as requested)*

---

## 📊 1. Team Responsibility Matrix

| Team Member | Designated Role | Primary Tech Stack | Core Software Modules Owned |
| :--- | :--- | :--- | :--- |
| 🧑‍💻 **Rohit** | **Frontend Web Architect** | React 19 + TypeScript + Vite | Web Command Center, 12-Tab Digital Twin, Admin Security Hub |
| 👩‍💻 **Rashi** | **Mobile App Lead** | Flutter + Dart + Camera API | Field Officer Mobile App, QR Parcel Passport, 3D AR Viewport |
| 👩‍💻 **Srushti** | **Backend & Cloud Lead** | Firebase Firestore + Cloud Functions | Database Schema, Statutory RBAC, SHA-256 Ledger, Seed Pipelines |
| 🧑‍💻 **Vedant** | **AI & Intelligence Lead** | Graph Algorithms + Data Science | 7-Layer XAI Engine, DAG Critical Path Analyzer, What-If Simulator |
| 🧑‍💻 **Sarvesh** | **GIS & UI/UX Specialist** | Leaflet JS + Tailwind CSS | GIS Command Map, 5-Tier Geographic Drill-Down, Bhoomi Rashi Theme |

---

## 👤 2. Individual Member Workload Breakdown

### 🧑‍💻 Rohit — Frontend Web Architect & Enterprise Systems Lead
*Responsible for the core web portal architecture, state management, and multi-dashboard web navigation.*

- **Key Modules & Features Implemented**:
  - **National Command Center**: Built executive overview header, KPI metrics cards, critical projects panel, and priority interventions panel.
  - **Project Digital Twin Workspace**: Structured the 12-tab unified project workspace (Overview, Lifecycle, Parcels, Documents, Compensation, R&R, Legal, Field Evidence, Intelligence, Actions, Audit).
  - **Administration Workspace**: Implemented the master RBAC control hub, statutory SLA rules, and PII minimization (unmask/mask toggle).
  - **Role Clearance Navigation**: Wired seamless switching between 8 statutory government clearance roles.
- **Tech Stack**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **PPT Presentation Line**:
  > *"I built the multi-dashboard React web portal, integrating state management and 12-tab Digital Twin workspaces tailored for government decision-makers."*

---

### 👩‍💻 Rashi — Mobile App Lead (Flutter & Field Operations)
*Responsible for the field officer mobile experience, on-site verification tools, and offline field capability.*

- **Key Modules & Features Implemented**:
  - **Field Officer Workflow**: Built the Flutter app for Talathis & SDOs to receive field tasks, conduct surveys, and inspect Khasra plots.
  - **QR Code Scanner & Parcel Passport**: Integrated instant QR scanning to pull up the complete legal land passport (landowner, Section 19 status, Section 30 awards).
  - **AR Camera Viewport**: Developed the 3D Augmented Reality camera overlay to visually verify Section 19 gazette boundaries on-site.
  - **Offline Evidence Queue**: Built local evidence queuing with GPS auto-capture and geotagged photo submission.
- **Tech Stack**: Flutter, Dart, Camera API, Mobile Firebase SDK.
- **PPT Presentation Line**:
  > *"I developed the cross-platform Flutter mobile app, enabling field officers to scan QR boundary pillars, view 3D AR overlays, and capture geotagged evidence offline."*

---

### 👩‍💻 Srushti — Backend, Database & Cloud Security Lead
*Responsible for database architecture, statutory security protocols, and cloud backend functions.*

- **Key Modules & Features Implemented**:
  - **Cloud Firestore Schema**: Designed database models for Corridors, Parcels, Compensation Awards, Legal Objections, and Workflow Events.
  - **Statutory RBAC & PII Engine**: Enforced database security rules for 8 statutory roles (National Admin down to Citizen/PAF).
  - **Cryptographic Audit Ledger**: Created SHA-256 tamper-evident logging for every award modification and status change.
  - **Cloud Functions & Dataset Seeding**: Configured cloud functions, real-time listeners, and automated dataset seeding pipelines.
- **Tech Stack**: Firebase Firestore, TypeScript Cloud Functions, Firebase App Check, SHA-256 Hashing.
- **PPT Presentation Line**:
  > *"I architected the Firebase cloud backend, ensuring SHA-256 tamper-proof audit trails, granular statutory RBAC rules, and PII data privacy."*

---

### 🧑‍💻 Vedant — AI Engine & Operations Intelligence Lead
*Responsible for explainable AI root-cause analysis, graph algorithms, and policy scenario simulation.*

- **Key Modules & Features Implemented**:
  - **7-Layer XAI Diagnostic Engine**: Algorithmically triaged project bottlenecks into 7 diagnostic layers (Legal, Financial, Environmental, SIA, Land, Physical, Administrative).
  - **DAG Critical Path Analyzer**: Modeled project delays as Directed Acyclic Graphs (DAG) to pinpoint exact bottleneck dependencies stalling execution.
  - **Comparative What-If Simulator**: Built the interactive decision-support tool enabling officers to simulate policy levers (boosting survey squads, releasing provisional solatium) to predict time & cost savings.
- **Tech Stack**: TypeScript Data Science Utilities, Graph Algorithms (DAG), Predictive Heuristics, React Controls.
- **PPT Presentation Line**:
  > *"I developed the 7-layer Explainable AI (XAI) diagnostic engine and DAG graph algorithms to identify critical path bottlenecks and simulate policy decisions."*

---

### 🧑‍💻 Sarvesh — GIS Cartography & UI/UX Design Specialist
*Responsible for spatial mapping, geographic hierarchy, and the official government UI/UX theme.*

- **Key Modules & Features Implemented**:
  - **GIS Command Map**: Implemented interactive Leaflet mapping with multi-state corridor polylines, parcel circle markers, and status-based color coding.
  - **Geographic Drill-Down Engine**: Built the seamless 5-tier location filter bar (`National → State → District → Project → Village → Khasra`).
  - **Bhoomi Rashi UI Theme**: Designed the UI matching the official MoRTH Bhoomi Rashi portal (`#BF7834` Terracotta Saffron, `#1E293B` Dark Slate Navy, Light Blue utility header).
  - **Responsive Design & UX Integrity**: Ensured layout responsiveness and government portal design standards.
- **Tech Stack**: React-Leaflet, Leaflet JS, Tailwind CSS design system.
- **PPT Presentation Line**:
  > *"I designed the GIS mapping engine and multi-level geographic drill-down system while implementing the official MoRTH Bhoomi Rashi enterprise UI theme."*

---

## 📋 3. Copy-Paste Slide Summary for SIH Pitch Deck

```text
BHUMI-SHIELD TEAM RESPONSIBILITY MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Rohit    : Frontend Web Architect (React Portal, Digital Twin & Admin Workspace)
2. Rashi    : Mobile App Lead (Flutter Field App, AR Viewport & QR Passport)
3. Srushti  : Backend & Cloud Security Lead (Firebase, RBAC & SHA-256 Ledger)
4. Vedant   : AI & Intelligence Lead (7-Layer XAI Engine & What-If Simulator)
5. Sarvesh  : GIS & UI/UX Specialist (Leaflet Maps, Drill-Down & Bhoomi Rashi Theme)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
