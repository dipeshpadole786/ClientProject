# School Fee Management System

School Fee Management System is a full-stack client project for managing student fee records, payments, and teacher login access. It includes a React frontend, an Express + MongoDB backend, and Google Sheets sync for keeping student payment data mirrored in a spreadsheet.

Made by Dipesh Padole.
This is my first client project.

## Project Overview

The application is built for a teacher/admin workflow:

- Secure login for the teacher account
- Student management with add, edit, view, and delete actions
- Payment tracking with automatic pending amount calculation
- Dashboard statistics for total students, total fees, received fees, and pending fees
- Google Sheets synchronization for student records
- Protected routes in the frontend so only authenticated users can access the dashboard

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs
- Google Sheets API via `googleapis`

Frontend:

- React 18
- Vite
- React Router
- Tailwind CSS
- React Icons

## Repository Structure

```text
Client/
|-- Backend/
|   |-- app.js
|   |-- src/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   `-- backend.log
|-- FrontendNew/
|   `-- school-fee-management/
|       `-- src/
|           |-- components/
|           |-- layouts/
|           |-- pages/
|           `-- services/
|-- Images/
`-- README.md
```

## Features

- Teacher login with JWT-based authentication
- Protected dashboard pages
- Student list with search and detail view
- Add and edit student records
- Payment entry and payment history
- Automatic calculation of pending fees
- Dashboard summary cards
- Google Sheets sync on student create/update
- API and Google Sheets logging for debugging and support

## Screenshots

### Dashboard

Overview cards for total students, total fees, amount received, and pending amount.

![Dashboard](Images/Screenshot%202026-07-11%20153514.png)

### Students

Student list with search, view, edit, and delete actions.

![Students](Images/Screenshot%202026-07-11%20153654.png)

### Add Student

Form used to register a new student and capture fee details.

![Add Student](Images/Screenshot%202026-07-11%20153711.png)

### Payments

Payment history screen with search and date filter.

![Payments](Images/Screenshot%202026-07-11%20153733.png)

### Add Payment

Payment entry modal used to record a new fee payment.

![Add Payment](Images/Screenshot%202026-07-11%20153756.png)

### Add Payment Dropdown

The student selector shown while choosing a student for a payment.

![Add Payment Dropdown](Images/Screenshot%20%28567%29.png)

### Settings

Teacher profile and school preference settings screen.

![Settings](Images/Screenshot%202026-07-11%20153810.png)

## Frontend Pages

- `/login`
- `/dashboard`
- `/students`
- `/students/add`
- `/students/:id`
- `/students/:id/edit`
- `/payments`
- `/settings`

## Backend API

Auth:

- `POST /api/auth/login`

Students:

- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

Payments:

- `GET /api/payments`
- `POST /api/payments`
- `GET /api/payments/dashboard`

Health check:

- `GET /health`

## Local Setup

### 1. Backend

```bash
cd Backend
npm install
npm start
```

### 2. Frontend

```bash
cd FrontendNew/school-fee-management
npm install
npm run dev
```

## Environment Variables

The backend expects these variables in `Backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DB_EMAIL=teacher@school.com
DB_PASSWORD=your_teacher_password
DB_NAME=Teacher Admin
DB_ROLE=teacher
GOOGLE_CLIENT_EMAIL=your_google_service_account_email
GOOGLE_PRIVATE_KEY=your_google_private_key
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SHEET_NAME=StudentData
```

Notes:

- `GOOGLE_PRIVATE_KEY` should preserve newline escapes if it comes from an environment file.
- The Google Sheet must be shared with the service account email.
- The sheet name must match `GOOGLE_SHEET_NAME` exactly.

## Frontend API Configuration

The current frontend is configured to use this backend URL:

```js
https://school-iemr.onrender.com/api
```

If you run the backend locally, update `FrontendNew/school-fee-management/src/services/api.js` to point to your local server.

## Data Model Summary

Student records store:

- Roll number
- Student name
- Class name
- Parent name
- Phone number
- Total fees
- Amount received
- Pending amount

Payment records store:

- Student ID
- Student name
- Roll number
- Amount
- Transaction ID
- Payment date
- Remarks

## Google Sheets Sync

Student create and update actions are synced to Google Sheets automatically. The backend:

- Verifies Google Sheets environment variables on startup
- Tests authentication with the service account
- Logs detailed sheet operations to `Backend/backend.log`
- Appends a row if the student does not exist in the sheet
- Updates the existing row if the roll number already exists

## Login Details

The login credentials come from the backend `.env` file:

- Email: `DB_EMAIL`
- Password: `DB_PASSWORD`

If those are not set, the backend falls back to:

- Email: `teacher@school.com`

## Author

Made by Dipesh Padole.
First client project.
