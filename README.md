# Educational Telemetry & Proctoring Metrics System (edu-metrics-system)

An automated web-based platform designed for non-invasive passive proctoring and academic integrity evaluation during online examinations. The system captures client-side behavior anomalies using standard web APIs, processes metrics via a mathematical risk model, and provides educators with an analytical dashboard for session auditing.

## Architecture Overview

The project is structured as a decoupled monorepository containing two separate Node.js applications:

* **client/**: Frontend single-page application (SPA) built with React, TypeScript, and Vite. Handles test delivery, captures real-time telemetry events via window/document listeners, and renders dashboards using Chart.js.
* **server/**: Backend REST API built with Node.js, Express, and Mongoose. Handles data persistence, stores examination metadata, user attempts, and structured anomaly logs.

## Core Features & Proctoring Logic

1. **Passive Telemetry Module**: Tracks user behavior without intrusive access to cameras or local hardware. Captures:
   * Tab switches and window blurring (`tab-switch`).
   * Clipboard interactions (`copy-paste`).
   * Context menu invocations (`context-menu`) with differentiated detection of active text selection.
   * Temporal anomalies (`time-anomaly`), flagging answers submitted unreasonably fast based on baseline limits.
2. **Mathematical Risk Model**: Evaluates student behavior on a normalized scale from 0.0 to 10.0 ($K_{anomaly}$). Operational weights are aggregated dynamically:
   * Tab switch: +2.0 K
   * Copy-paste: +3.5 K
   * Context menu with active text selection: +1.0 K
   * Passive context menu invocation: +0.5 K
   * Rapid response anomaly: +0.5 K
3. **Educator Analytical Dashboard**: Aggregates exam results, distributes students into risk categories (Low, Moderate, Critical), and provides a precise console-like Audit Trail linked to question numbers for validation.

## Prerequisites

Ensure you have the following environments installed locally:
* Node.js (version 16.x or higher)
* npm (version 8.x or higher)
* MongoDB (local instance running on port 27017, or a remote MongoDB Atlas URI)

## Installation & Local Deployment

Follow these steps to initialize and run the ecosystem locally.

### 1. Repository Setup
Clone the repository and navigate to the project root:
```bash
git clone [https://github.com/YOUR_USERNAME/edu-metrics-system.git](https://github.com/YOUR_USERNAME/edu-metrics-system.git)
cd edu-metrics-system
```
### 2. Backend Configuration & Launch
Navigate to the server directory, install dependencies, and start the REST service:

```bash
cd server
npm install
```
Create a .env file inside the server/ directory if you need to override defaults:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/proctoring_db
JWT_SECRET=your_secure_jwt_secret_token
```

To seed the database with initialization tests and user scopes, run:

```bash
npm run seed
```

Start the server:

```bash
npm start
```

The backend will operate on http://localhost:5000.

### 3. Frontend Configuration & Launch
Open a new terminal window, navigate to the client directory, install dependencies, and initialize Vite:

```bash
cd client
npm install
npm run dev
```

The frontend application will compile and become accessible at http://localhost:5173.

### Telemetry Event Structure
Captured logs are stored inside the database under the following data scheme:

eventType: Type of anomaly intercepted.

details: Text specification detailing context (e.g., question boundaries, cropped text fragments).

timestamp: Precise system execution time.