# AssetFlow — Enterprise Asset & Resource Management System

AssetFlow is a state-of-the-art enterprise ERP dashboard for tracking, allocating, maintaining, and reserving corporate physical assets and workspaces.

---

## ⚡ Integration Status: Fully Integrated (Frontend + Backend)
The application has been fully integrated. Rather than relying on mock client-side static variables, the React frontend dynamically reads and mutates state from the backend Express server, which is backed by a local SQLite database using Prisma.

---

## 🛠️ Technology Stack
* **Frontend**: React (TypeScript), Vite, Tailwind CSS / custom CSS, React Router, Lucide Icons, Recharts, React Hook Form, Axios.
* **Backend**: Node.js, Express.js, Prisma ORM.
* **Database**: SQLite (configured for simple, zero-dependency local setup).

---

## 🚀 Key Functional Workflows & Rules

### 1. Double-Allocation Blocking & Transfer Request
* **Constraint**: You cannot directly allocate an asset that is already taken by another employee.
* **Conflict Warning**: When selecting an allocated asset, the UI automatically alerts you with a warning: `Warning: This asset is currently held by [Employee]`. 
* **Transfer Option**: Direct allocation is disabled, and the button changes to "Request Transfer". Submitting this creates a pending `TransferRequest` in the database.
* **Approval Flow**: Approving a transfer ends the existing allocation, creates a new allocation, and updates the asset's department/status.

### 2. Time-Slot Overlap Validation on Resource Bookings
* **Constraint**: Two bookings cannot overlap for the same resource.
* **Backend Validation**: The backend queries the database using interval checks: `newStartDate < existingEndDate` AND `newEndDate > existingStartDate`. Overlapping requests are blocked with a `400 Bad Request` code.

### 3. Auto-Generated Sequential Asset Tags
* **System Logic**: Instead of using random UUIDs for new assets, the backend counts the existing assets and auto-generates a sequential tag (e.g. `AST-016`), maintaining clean audit identifiers.

### 4. Structured Maintenance lifecycle
* **Workflow**: `Pending` ➔ `In Progress` ➔ `Completed`.
* **Asset Auto-Update**: Raising a ticket sets the request to `Pending` (no asset status change). Approving it sets the ticket to `In Progress` and changes the asset status to `Under Maintenance`. Resolving/completing the work reverts the asset back to `Available`.

---

## 🚀 Setup & Launch Instructions

### 1. Clone & Install Dependencies
First, install NPM modules for both environments:
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Setup SQLite Database
Initialize and seed the database using Prisma:
```bash
cd backend
npx prisma db push
npx prisma db seed
```
*(This creates the SQLite database file at `prisma/dev.db` and populates it with 15 initial assets, active allocations, maintenance logs, bookings, and notifications.)*

### 3. Run the Servers
Start both servers locally:
```bash
# Run backend (Runs on port 5000)
cd backend
npm start

# Run frontend (Runs on port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser to access the dashboard.
