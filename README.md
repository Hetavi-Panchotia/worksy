# Worksy – Freelance Project & Client Management Platform

A full-stack web application that helps freelancers manage clients, projects, tasks, deadlines, and payments through a centralized dashboard.

## ✨ Features

- **Dashboard:** Overview of clients, projects, earnings, outstanding payments, and deadlines.
- **Client Management:** Create, view, update, delete, and search client records.
- **Project Management:** Manage projects, budgets, deadlines, priorities, and statuses.
- **Task Management:** Organize tasks, update statuses, and track project progress.
- **Payment Tracking:** Record payments, monitor payment statuses, and calculate outstanding balances.
- **Responsive UI:** Clean dashboard interface for desktop, tablet, and mobile.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack framework |
| React.js | UI development |
| JSX | Component structure |
| CSS | Styling |
| MongoDB Atlas | Database |
| Mongoose | Database management |
| Next.js Route Handlers | Backend APIs |
| Vercel | Deployment |

## 📂 Project Structure

### Final Project Structure
<!-- Add the final folder structure here -->

## 🗄️ Database Structure

The application uses four Mongoose models:

| Model | Description |
|---|---|
| Client | Client details |
| Project | Project information and client reference |
| Task | Tasks associated with projects |
| Payment | Payment records associated with projects |

**Relationships:**
- One client can have multiple projects.
- One project can have multiple tasks.
- One project can have multiple payments.

## 🔗 API Endpoints

All APIs are implemented using Next.js Route Handlers.

| Resource | Methods | Endpoint |
|---|---|---|
| Clients | GET, POST | `/api/clients` |
| Client | GET, PUT, DELETE | `/api/clients/[id]` |
| Projects | GET, POST | `/api/projects` |
| Project | GET, PUT, DELETE | `/api/projects/[id]` |
| Tasks | GET, POST | `/api/tasks` |
| Task | GET, PUT, DELETE | `/api/tasks/[id]` |
| Payments | GET, POST | `/api/payments` |
| Payment | GET, PUT, DELETE | `/api/payments/[id]` |

## 📊 Key Calculations

**Project Progress**

`(Completed Tasks / Total Tasks) × 100`

**Total Received**

Sum of completed payments.

**Outstanding Balance**

`Project Budget − Total Completed Payments`

Projects without tasks have 0% progress, and outstanding balances are not displayed as negative values.

## ⚙️ Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/worksy.git
cd worksy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Live Demo

<!-- Add deployed Vercel URL here -->

## 🚀 Deployment

The application is deployed using Vercel.

<!-- Add deployment details or live URL here -->

## 👩‍💻 Author

Hetavi Panchotia

College Project – Freelance Project & Client Management Platform.

## 📄 License

Developed for educational purposes.
