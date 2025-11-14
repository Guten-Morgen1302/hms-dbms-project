# Hospital Management System (HMS)

A comprehensive hospital management system with separate frontend and backend architecture.

## Features

- Patient Management
- Doctor Management  
- Appointment Scheduling
- Prescription Management
- Lab Test Orders & Results
- Billing & Payments
- Room & Bed Management
- Health Vitals Tracking
- Vaccination Records
- Real-time Notifications

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js + JWT

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: TanStack Query
- **Routing**: Wouter

## Project Structure

```
.
├── backend/              # Backend API server
│   ├── src/
│   │   ├── shared/      # Shared database schema
│   │   ├── index.ts     # Server entry point
│   │   ├── db.ts        # Database connection
│   │   ├── routes.ts    # API routes
│   │   ├── auth.ts      # Authentication logic
│   │   ├── storage.ts   # Data access layer
│   │   └── seed.ts      # Database seeding script
│   ├── migrations/      # Database migrations
│   ├── package.json
│   └── .env            # Backend environment variables
│
├── frontend/            # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   ├── lib/        # Utilities and helpers
│   │   └── App.tsx     # App entry point
│   ├── package.json
│   └── .env            # Frontend environment variables
│
└── package.json        # Root package.json with convenience scripts

```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hospital-management-system
```

### 2. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hms_db;

# Create user (optional)
CREATE USER hms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hms_db TO hms_user;

# Exit psql
\q
```

#### Configure Database Connection

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hms_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT & Session Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Push Database Schema

```bash
cd backend
npm run db:push
```

This will create all the necessary tables in your PostgreSQL database.

#### Seed Initial Data

```bash
cd backend
npm run db:seed
```

This will create:
- Default users (admin, doctor, patient)
- Sample departments
- Sample patients and doctors
- Sample appointments, prescriptions, and more

### 4. Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
# API Backend URL
VITE_API_URL=http://localhost:5000
```

### 5. Run the Application

#### Development Mode

```bash
# Run both frontend and backend together (from root)
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 6. Default Login Credentials

After seeding the database, you can log in with:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Doctor | doctor | doctor123 |
| Patient | patient | patient123 |

## API Documentation

The backend API exposes the following endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription

### Lab Tests
- `GET /api/test-orders` - Get all test orders
- `GET /api/test-orders/:id` - Get test order by ID
- `POST /api/test-orders` - Create test order
- `PUT /api/test-orders/:id` - Update test results

### Billing
- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill

## Database Schema

The application uses the following main tables:

- **users** - User accounts (admin, doctor, patient)
- **patients** - Patient demographics and medical records
- **doctors** - Doctor profiles and specializations
- **departments** - Hospital departments
- **appointments** - Patient appointments
- **prescriptions** - Medical prescriptions
- **prescription_medications** - Medication details in prescriptions
- **medications** - Medication catalog
- **lab_tests** - Available lab tests
- **test_orders** - Lab test orders and results
- **bills** - Billing information
- **payments** - Payment records
- **rooms** - Hospital rooms
- **beds** - Hospital beds
- **health_vitals** - Patient vital signs
- **vaccinations** - Vaccination records

## Build for Production

```bash
# Build both frontend and backend
npm run build

# Or build separately
cd backend && npm run build
cd frontend && npm run build
```

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   # or on Mac
   brew services list
   ```

2. Verify DATABASE_URL in backend/.env is correct

3. Check PostgreSQL allows connections from localhost

### Port Already in Use

If ports 3000 or 5000 are in use, you can change them:
- Backend: Update `PORT` in `backend/.env`
- Frontend: Update port in `frontend/vite.config.ts`

### CORS Issues

Ensure `FRONTEND_URL` in backend/.env matches your frontend URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
