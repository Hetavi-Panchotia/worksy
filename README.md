# Worksy (FreelanceFlow) – Freelance Project & Client Management Platform

A modern full-stack web application designed for individual freelancers to manage multiple clients, projects, tasks, deadlines, and payments from a centralized dashboard.

Developed as a college evaluation project demonstrating proficiency with **Next.js App Router**, **React Components (JSX)**, **Next.js Route Handlers**, **MongoDB Atlas**, and **Mongoose CRUD Operations**.

---

## ✨ Features

- **Live Analytics Dashboard:** Real-time metrics calculated from database records (Total Clients, Total Projects, Active Projects, Completed Projects, Total Revenue Received, and Total Outstanding Balances). Includes recent projects, earliest deadlines, status distribution, and recent payments.
- **Client Management:** Complete CRUD module to add, view, update, delete, and search clients. Dedicated profile pages show client details and all associated project contracts.
- **Project Management:** Track projects with budgets, start dates, deadlines, statuses (Planning, In Progress, On Hold, Completed, Cancelled), and priorities (Low, Medium, High).
- **Task Management:** Break projects into actionable deliverables. Live progress formula updates dynamically as tasks are checked off.
- **Payment Tracking:** Record payments with methods (Cash, Bank Transfer, UPI, Other) and statuses (Completed, Pending, Failed). Automatically calculates project-level and platform-wide outstanding balances.
- **Clean Warm Theme:** Minimal, professional SaaS design using a warm neutral palette (beige, charcoal, white, muted olive accents), accessible badges, responsive collapsible sidebar, and clean modals.

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **Next.js (App Router)** | Full-stack React framework with server-side routing |
| **React 19 & JSX** | Reusable declarative UI components |
| **Next.js Route Handlers** | RESTful backend APIs (No external Express server needed) |
| **MongoDB Atlas** | Cloud NoSQL document database |
| **Mongoose** | Schema definition, validation, and relational population |
| **Custom CSS** | Clean warm design system with CSS custom properties |
| **Vercel** | Production hosting and automated CI/CD deployment |

---

## 📂 Project Structure

```text
worksy/
├── README.md
└── project/
    ├── .env.example
    ├── .env.local
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── globals.css                # Warm theme palette, typography, responsive utilities
        │   ├── layout.tsx                 # Root layout with metadata and responsive AppShell
        │   ├── page.jsx                   # Live Dashboard overview
        │   ├── clients/
        │   │   ├── page.jsx               # Client directory, search, and Add/Edit modals
        │   │   └── [id]/
        │   │       └── page.jsx           # Client profile & associated projects
        │   ├── projects/
        │   │   ├── page.jsx               # Projects list with status filters & create modal
        │   │   └── [id]/
        │   │       └── page.jsx           # Project detail page (tasks, payments & live progress)
        │   ├── tasks/
        │   │   └── page.jsx               # Central task management with status toggles
        │   ├── payments/
        │   │   └── page.jsx               # Payment tracking, revenue stats, and record modal
        │   └── api/
        │       ├── dashboard/
        │       │   └── route.js           # GET live aggregated statistics
        │       ├── clients/
        │       │   ├── route.js           # GET (list & search), POST (create)
        │       │   └── [id]/
        │       │       └── route.js       # GET, PUT, DELETE (with cascade cleanup)
        │       ├── projects/
        │       │   ├── route.js           # GET (filter & search), POST (create)
        │       │   └── [id]/
        │       │       └── route.js       # GET, PUT, DELETE (with cascade cleanup)
        │       ├── tasks/
        │       │   ├── route.js           # GET (filter by status/project), POST (create)
        │       │   └── [id]/
        │       │       └── route.js       # GET, PUT, DELETE
        │       └── payments/
        │           ├── route.js           # GET (summary & list), POST (record payment)
        │           └── [id]/
        │               └── route.js       # GET, PUT, DELETE
        ├── components/
        │   ├── AppShell.jsx               # Navigation shell with mobile drawer state
        │   ├── Sidebar.jsx                # Responsive sidebar with active indicator
        │   ├── Header.jsx                 # Page title, live search input, action button
        │   ├── StatCard.jsx               # Metric summary cards
        │   ├── ProjectCard.jsx            # Project overview card with progress bar
        │   ├── StatusBadge.jsx            # Color-coded badges for statuses & priorities
        │   ├── Modal.jsx                  # Reusable accessible dialog modal
        │   ├── EmptyState.jsx             # Clean placeholder when records are empty
        │   └── LoadingSpinner.jsx         # Minimalist loading state
        ├── lib/
        │   └── mongodb.js                 # Cached singleton Mongoose connection
        └── models/
            ├── Client.js                  # Client schema (name, email, company, phone, notes)
            ├── Project.js                 # Project schema (title, clientId, budget, deadline, status)
            ├── Task.js                    # Task schema (title, projectId, status, priority, dueDate)
            └── Payment.js                 # Payment schema (projectId, amount, method, status)
```

---

## 🗄️ Database Structure & Relationships

1. **Client Model (`Client.js`)**
   - Fields: `name`, `email`, `company`, `phone`, `notes`, `createdAt`
2. **Project Model (`Project.js`)**
   - Fields: `title`, `description`, `clientId` (ref: `Client`), `budget`, `startDate`, `deadline`, `status`, `priority`, `createdAt`
3. **Task Model (`Task.js`)**
   - Fields: `title`, `description`, `projectId` (ref: `Project`), `status`, `priority`, `dueDate`, `createdAt`
4. **Payment Model (`Payment.js`)**
   - Fields: `projectId` (ref: `Project`), `amount`, `paymentDate`, `paymentMethod`, `status`, `notes`, `createdAt`

**Relationships:**
- **One Client &rarr; Multiple Projects** (referenced via `clientId`)
- **One Project &rarr; Multiple Tasks** (referenced via `projectId`)
- **One Project &rarr; Multiple Payments** (referenced via `projectId`)

*When deleting a client or project, the system performs a cascading deletion to prevent orphaned tasks or payments.*

---

## 📊 Core Business Calculations

1. **Project Progress Percentage:**
   $$\text{Progress} = \begin{cases} 0\% & \text{if Total Tasks} = 0 \\ \left(\frac{\text{Completed Tasks}}{\text{Total Tasks}}\right) \times 100 & \text{otherwise} \end{cases}$$
   *Guards against division-by-zero errors when a project has zero tasks.*

2. **Total Received Revenue:**
   $$\text{Total Received} = \sum \text{Payment amounts where status} = \text{"Completed"}$$

3. **Outstanding Balance:**
   $$\text{Outstanding} = \max(0, \text{Project Budget} - \text{Total Completed Payments})$$
   *Clamped to zero so that client advances do not display as negative balances.*

---

## 🔗 Backend API Endpoints

All APIs use Next.js Route Handlers (`NextResponse.json`) and async/await with Mongoose:

| Resource | HTTP Method | Endpoint | Description |
|---|---|---|---|
| **Dashboard** | `GET` | `/api/dashboard` | Aggregated live metrics, status distribution, deadlines |
| **Clients** | `GET` | `/api/clients` | Retrieve all clients (with `?search=` filter) |
| | `POST` | `/api/clients` | Create a new client |
| | `GET` | `/api/clients/[id]` | Get client details + associated projects |
| | `PUT` | `/api/clients/[id]` | Update client details |
| | `DELETE` | `/api/clients/[id]` | Delete client + cascade delete projects, tasks, payments |
| **Projects** | `GET` | `/api/projects` | Retrieve all projects (with `?status=`, `?search=`, `?clientId=`) |
| | `POST` | `/api/projects` | Create a new project |
| | `GET` | `/api/projects/[id]` | Get project details + tasks + payments + progress |
| | `PUT` | `/api/projects/[id]` | Update project details |
| | `DELETE` | `/api/projects/[id]` | Delete project + cascade delete tasks & payments |
| **Tasks** | `GET` | `/api/tasks` | Retrieve all tasks (with `?status=`, `?projectId=`) |
| | `POST` | `/api/tasks` | Create task assigned to project |
| | `GET` | `/api/tasks/[id]` | Get single task |
| | `PUT` | `/api/tasks/[id]` | Update task or toggle status |
| | `DELETE` | `/api/tasks/[id]` | Delete task |
| **Payments** | `GET` | `/api/payments` | Retrieve payments (with `?status=`, `?projectId=`) + revenue totals |
| | `POST` | `/api/payments` | Record new payment transaction |
| | `GET` | `/api/payments/[id]` | Get single payment |
| | `PUT` | `/api/payments/[id]` | Update payment |
| | `DELETE` | `/api/payments/[id]` | Delete payment record |

---

## ⚙️ Getting Started

### 1. Navigate to the project directory
```bash
cd project
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update `MONGODB_URI` with your MongoDB connection string (e.g. MongoDB Atlas or local MongoDB instance):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/freelanceflow?retryWrites=true&w=majority
```

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎓 College Viva / Technical Evaluation Preparation

When explaining this project to an evaluator, highlight these architectural aspects:

1. **Why Next.js App Router instead of Express?**
   Next.js App Router allows full-stack development in a single unified codebase. Route Handlers (`app/api/.../route.js`) handle REST requests on the server using Node.js without the overhead of maintaining and deploying a separate Express server.
2. **Why Singleton Pattern for MongoDB (`lib/mongodb.js`)?**
   In development mode, Next.js clears the Node.js cache on hot-reload. Creating a database connection without caching would spawn a new connection on every code change, exhausting the MongoDB Atlas connection pool. Storing the promise on `global.mongoose` ensures only one reusable connection pool is maintained.
3. **Mongoose Model References & Population:**
   Projects reference Clients via `clientId: { type: Schema.Types.ObjectId, ref: 'Client' }`. Using `.populate('clientId')` joins related documents effortlessly in MongoDB queries.
4. **Cascading Deletions:**
   Deleting a client automatically cleans up their projects, tasks, and payments to avoid orphaned data in the database.
5. **No Hardcoded Data:**
   All dashboard cards, progress percentages, and outstanding balances are dynamically aggregated in real time directly from database documents.

---

## 👩‍💻 Author

**Hetavi Panchotia**  
College Project – FreelanceFlow (worksy) Client & Project Management Platform.
