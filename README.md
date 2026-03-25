# 🏥 MediCore HMS — Node.js + Express + MySQL Backend

A full REST API backend for the MediCore Hospital Management System.

---

## 📁 Project Structure

```
medicore-backend/
├── server.js                         # App entry point
├── .env                              # Environment variables
├── package.json
└── src/
    ├── config/
    │   └── db.js                     # MySQL connection pool
    ├── db/
    │   ├── schema.sql                # All CREATE TABLE statements
    │   └── setup.js                  # One-time DB setup script
    ├── middleware/
    │   └── auth.js                   # JWT authentication
    ├── controllers/
    │   ├── authController.js
    │   ├── dashboardController.js
    │   ├── patientController.js
    │   ├── doctorController.js
    │   ├── staffController.js
    │   ├── appointmentController.js
    │   ├── prescriptionController.js
    │   └── billingController.js
    └── routes/
        ├── auth.js
        ├── dashboard.js
        ├── patients.js
        ├── doctors.js
        ├── staff.js
        ├── appointments.js
        ├── prescriptions.js
        └── billing.js
```

---

## ⚙️ Setup Instructions

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medicore_hms
JWT_SECRET=your_secret_key
```

### 3. Create Database & Tables
```bash
node src/db/setup.js
```
This will:
- Create the `medicore_hms` database
- Create all 9 tables
- Insert a default admin user

### 4. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```
Server runs on: **http://localhost:5000**

---

## 🗄️ MySQL Tables

| Table                    | Description                        |
|--------------------------|------------------------------------|
| `users`                  | Login accounts (admin/doctor/staff)|
| `patients`               | Patient records                    |
| `doctors`                | Doctor directory                   |
| `staff`                  | Nurses & support staff             |
| `appointments`           | Scheduled appointments             |
| `prescriptions`          | Prescription headers               |
| `prescription_medicines` | Medicine line items per Rx         |
| `invoices`               | Billing invoice headers            |
| `invoice_items`          | Services & medicines per invoice   |

---

## 🔐 Authentication

All API routes (except login/register) require a **Bearer token**.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@medicore.in",
  "password": "admin123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "Admin User", "role": "admin" }
}
```

Use the token in all subsequent requests:
```http
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/login    | Login              |
| POST   | /api/auth/register | Register new user  |
| GET    | /api/auth/me       | Get current user   |

### Dashboard
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | /api/dashboard  | Stats, charts, recent Rx |

### Patients
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/patients         | List all (search/filter) |
| GET    | /api/patients/:id     | Single patient           |
| POST   | /api/patients         | Add patient              |
| PUT    | /api/patients/:id     | Update patient           |
| DELETE | /api/patients/:id     | Delete patient           |

**Query params:** `?search=rahul` · `?filter=today` · `?filter=this_week`

### Doctors
| Method | Endpoint           | Description   |
|--------|--------------------|---------------|
| GET    | /api/doctors       | List all      |
| GET    | /api/doctors/:id   | Single doctor |
| POST   | /api/doctors       | Add doctor    |
| PUT    | /api/doctors/:id   | Update        |
| DELETE | /api/doctors/:id   | Delete        |

### Staff
| Method | Endpoint         | Description |
|--------|------------------|-------------|
| GET    | /api/staff       | List all    |
| GET    | /api/staff/:id   | Single      |
| POST   | /api/staff       | Add staff   |
| PUT    | /api/staff/:id   | Update      |
| DELETE | /api/staff/:id   | Delete      |

### Appointments
| Method | Endpoint                  | Description        |
|--------|---------------------------|--------------------|
| GET    | /api/appointments         | List (with filter) |
| GET    | /api/appointments/:id     | Single             |
| POST   | /api/appointments         | Book appointment   |
| PUT    | /api/appointments/:id     | Update             |
| DELETE | /api/appointments/:id     | Delete             |

**Query params:** `?filter=today` · `?filter=yesterday` · `?filter=next_day` · `?filter=this_week`

### Prescriptions
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/prescriptions          | List (?patient_id=2)     |
| GET    | /api/prescriptions/:id      | Single with medicines    |
| POST   | /api/prescriptions          | Save prescription + meds |
| DELETE | /api/prescriptions/:id      | Delete                   |

**POST body example:**
```json
{
  "patient_id": 1,
  "doctor_id": 1,
  "disease": "Fever",
  "medicines": [
    { "medicine_name": "Paracetamol", "morning": 1, "afternoon": 0, "night": 1, "timing": "After Food", "duration_days": 5 },
    { "medicine_name": "Dolo 650",    "morning": 0, "afternoon": 1, "night": 1, "timing": "Before Food", "duration_days": 3 }
  ]
}
```

### Billing
| Method | Endpoint                   | Description           |
|--------|----------------------------|-----------------------|
| GET    | /api/billing               | List (?patient_id=2)  |
| GET    | /api/billing/:id           | Single with items     |
| POST   | /api/billing               | Generate invoice      |
| PATCH  | /api/billing/:id/status    | Update payment status |
| DELETE | /api/billing/:id           | Delete invoice        |

**POST body example:**
```json
{
  "patient_id": 1,
  "patient_name": "Rahul Sharma",
  "contact": "9876543210",
  "items": [
    { "item_type": "service",  "item_name": "Consultation", "quantity": 1, "unit_price": 500,  "total_price": 500  },
    { "item_type": "medicine", "item_name": "Paracetamol",  "quantity": 2, "unit_price": 25,   "total_price": 50   }
  ]
}
```

---

## 🔗 Connecting to the Frontend

In your `index.html`, replace `localStorage` calls with `fetch` API calls:

```javascript
const API = 'http://localhost:5000/api';
const TOKEN = localStorage.getItem('medicore_token');

// Example: Load patients
const res  = await fetch(`${API}/patients`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const data = await res.json();
// data.data → array of patients

// Example: Add patient
await fetch(`${API}/patients`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`
  },
  body: JSON.stringify({ name, age, blood_group, contact, disease, address, admission_date })
});
```

---

## 🛡️ Default Admin Credentials
```
Email:    admin@medicore.in
Password: admin123
```
> Change this immediately in production!
