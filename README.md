# MiniLedger 💳

MiniLedger is a full-stack, production-ready ledger mobile application designed to track money lent to friends, manage due dates, detect overdue balances, upload receipts to Cloudinary, and visualize financial trajectories.

---

## 🛠️ Tech Stack

- **Backend**:
  - Runtime: Node.js (Pure ESM `"type": "module"`)
  - Language: TypeScript
  - Framework: Express.js
  - ORM: Sequelize v6 with PostgreSQL (`pg`, `pg-hstore`)
  - Cache & Session: Redis Cloud with `ioredis`
  - Auth: JWT (`jsonwebtoken`) + Mock OTP with HMAC-SHA256 hashing
  - File Uploads: Multer (Memory Storage) + Cloudinary CDN
  - Validation: Joi
  - Testing: Vitest
- **Frontend (Mobile)**:
  - Framework: React Native with Expo (v52)
  - Language: TypeScript
  - State Management: **Zustand** (`authStore`, `loanStore`, `uiStore`)
  - HTTP Client: Axios with automatic JWT Bearer token interceptor
  - Persistence: `@react-native-async-storage/async-storage`
  - Camera & Media: `expo-image-picker`
  - Date Picker: `@react-native-community/datetimepicker`
  - Design Palette: Strict 5-color dark mode (`#1A1A1A`, `#222526`, `#363A3E`, `#E0E0E0`, `#BFBFBF`)

---

## 📁 Repository Structure

```text
miniledger-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize Postgres, Redis Cloud (ioredis), Cloudinary, Env
│   │   ├── controllers/     # Auth (send/verify OTP) and Loan operations
│   │   ├── middleware/      # JWT auth, Joi validation, Multer memory storage, Error handling
│   │   ├── models/          # User and Loan Sequelize models (UUID, associations)
│   │   ├── routes/          # Express route definitions (/api/auth, /api/loans)
│   │   ├── services/        # OTP lifecycle & Cloudinary buffer upload
│   │   ├── utils/           # HMAC crypto, summary calculations, analytics, errors
│   │   ├── validators/      # Joi schemas for auth and loans
│   │   └── index.ts         # Express server entry point & database sync
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
└── mobile/
    ├── src/
    │   ├── api/             # Axios instance, interceptors, API service wrappers
    │   ├── components/      # SummaryCard, LoanCard, AddLoanModal, Sidebar
    │   ├── navigation/      # RootNavigator (conditional Zustand auth flow & screen router)
    │   ├── screens/         # LoginScreen, DashboardScreen, AnalyticsScreen
    │   ├── store/           # Zustand stores (authStore, loanStore, uiStore)
    │   ├── theme.ts         # Curated 5-color dark palette & typography
    │   ├── types.ts         # TypeScript entity and analytics interfaces
    │   └── utils/           # Currency, date, and countdown formatters
    ├── App.tsx              # Root component with Zustand token hydration
    ├── app.json             # Expo config
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** v18+ or v20+
- **PostgreSQL** (Local PostgreSQL server or Supabase PostgreSQL instance)
- **Redis Cloud** account (or local Redis instance)
- **Cloudinary** account (free tier) for receipt photo hosting

---

### 2. Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd miniledger-app/backend
   ```

2. Configure environment variables:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   # Linux / macOS
   cp .env.example .env
   ```

3. Populate `.env` with your credentials:
   ```env
   PORT=4000
   NODE_ENV=development
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=7d
   OTP_HASH_SECRET=your-otp-hmac-secret
   OTP_TTL_SECONDS=300

   # Redis Cloud (ioredis)
   REDIS_URL=redis-xxxxx.cloud.redislabs.com
   REDIS_PORT=17781
   REDIS_PASSWORD=your-redis-password
   REDIS_USER=default

   # Cloudinary (free plan)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=miniledger/receipts

   # Database: Option A (Local Postgres)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=credsetu_db
   DB_SSL=false

   # Database: Option B (Supabase Pooler)
   # DB_HOST=aws-0-ap-south-1.pooler.supabase.com
   # DB_PORT=5432
   # DB_USER=postgres.your-project-ref
   # DB_PASSWORD=your-supabase-password
   # DB_NAME=postgres
   # DB_SSL=true
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run unit tests:
   ```bash
   npm test
   ```

6. Start backend development server:
   ```bash
   npm run dev
   ```
   The API will start at `http://localhost:4000/api`. On launch, Sequelize automatically synchronizes the PostgreSQL tables.

---

### 3. Mobile Frontend Setup (React Native + Expo)

1. Open a second terminal and navigate to `mobile`:
   ```bash
   cd miniledger-app/mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API host:
   - Create `.env` in `mobile/` or set `EXPO_PUBLIC_API_ORIGIN`:
     - **Web**: `http://localhost:4000` (default)
     - **Android Emulator**: `http://10.0.2.2:4000` (automatically detected)
     - **Physical Device (Expo Go)**: Set your computer's local Wi-Fi IP:
       ```env
       EXPO_PUBLIC_API_ORIGIN=http://192.168.1.15:4000
       ```

4. Launch Expo:
   ```bash
   npx expo start
   ```
   - Press **w** to open in web browser.
   - Press **a** to open on Android Emulator.
   - Scan the QR code using the **Expo Go** app on your physical device.

---

## 📡 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | Generates 4-digit mock OTP, hashes & stores in Redis Cloud (300s TTL), prints code to server console | `{ "phoneNumber": "9876543210" }` |
| `POST` | `/api/auth/resend-otp` | Overwrites previous OTP with a new 4-digit code & resets TTL | `{ "phoneNumber": "9876543210" }` |
| `GET` | `/api/auth/otp-status` | Checks remaining TTL in seconds and resend eligibility | `?phoneNumber=9876543210` |
| `POST` | `/api/auth/verify-otp` | Validates OTP against Redis hash, purges key, creates/finds User in Postgres, returns JWT token | `{ "phoneNumber": "9876543210", "otp": "1234" }` |

### Loans (`/api/loans`) - Protected (Requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/loans` | Creates loan entry. Accepts `multipart/form-data` with optional receipt image | `friendName`, `amount`, `dueDate` (ISO), `receipt` (file) |
| `GET` | `/api/loans` | Lists all loans for authenticated user, sorted by status, due date, and creation | None |
| `PATCH` | `/api/loans/:id/repay` | Marks a pending loan as `REPAID` | None |
| `GET` | `/api/loans/summary` | Aggregated metrics: `totalLent`, `totalRepaid`, and `overdueAmount` | None |
| `GET` | `/api/loans/analytics` | Deep metrics: counts, 6-month lending trends, and top outstanding friends | None |

---

## 📱 Mobile App Features & Flow

1. **Login Flow**:
   - Clean dark-mode interface requesting a 10-15 digit phone number.
   - Triggers `POST /api/auth/send-otp`.
   - The backend logs: `🔑 [MOCK OTP] For <phoneNumber>: <otp>`.
   - Countdown timer displaying real-time TTL expiration (`05:00`).
   - Disables Resend until expired or allows refreshing the OTP.
   - On verification, stores JWT in `AsyncStorage` and updates Zustand `authStore`.

2. **Dashboard Screen**:
   - **Top Summary Card**: Displays Total Lent, Total Repaid, and Overdue Amount.
   - **Loan List**: Overdue items (`status === 'PENDING'` and `dueDate < current_date`) are prominently highlighted.
   - **Mark as Repaid Action**: Tapping "Mark repaid" instantly updates the loan and recalculates the metrics.
   - **Pull-to-Refresh**: Seamlessly synchronizes with the server.

3. **Add Loan Modal**:
   - Fields: Friend's Name, Amount, Due Date (native datepicker).
   - Receipt attachment button using `expo-image-picker`.
   - Image uploads directly to Cloudinary and is saved to the loan.

4. **Analytics Screen**:
   - Accessible via the hamburger sidebar (☰).
   - Status overview grid: Total Loans, Active, Repaid, Overdue.
   - Capital allocation breakdown.
   - Visual 6-month lending and repayment history bars.
   - Top borrowers ranked by outstanding amount.

5. **Sidebar Navigation**:
   - Slides smoothly over screen with open/close state managed via Zustand `uiStore`.
   - Switch between **Loans** and **Analytics**.
   - One-tap logout clearing the stored JWT and returning to the Login screen.

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```
Vitest validates:
- Summary calculations (`totalLent`, `totalRepaid`, `overdueAmount`).
- Overdue status date detection logic.
- HMAC-SHA256 OTP hashing and constant-time comparison.
- 6-month trajectory and top-friends analytics aggregations.
- Joi validation schemas for auth and loans.
