# MiniLedger

Track money lent to friends. Phone login uses a mock OTP printed in the backend server log.

## Stack

- Backend: Node.js, TypeScript, Express, Sequelize, PostgreSQL, JWT, Zod, Multer (ESM)
- Mobile: React Native, Expo, TypeScript, Axios, AsyncStorage, expo-image-picker

## Backend

```bash
cd backend
copy .env.example .env   # Windows
# fill DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
npm install
createdb miniledger      # or create the database in pgAdmin / Supabase
npm run test
npm run dev
```

API: `http://localhost:4000/api`

### Database

Use either local Postgres or Supabase. In `backend/.env`:

```env
# Option A: Supabase Connection Pooler
# DB_HOST=
# DB_PORT=5432
# DB_USER=
# DB_PASSWORD=
# DB_NAME=postgres
# DB_SSL=true

# Option B: Local PostgreSQL Server
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=false
```

You can also set `DATABASE_URL` to override the individual fields.

### Auth

1. `POST /api/auth/send-otp` with `{ "phoneNumber": "9876543210" }`
2. Read the 4-digit code from the server console: `🔑 [MOCK OTP] For 9876543210: 1234`
3. `POST /api/auth/verify-otp` with `{ "phoneNumber": "9876543210", "otp": "1234" }`
4. Send `Authorization: Bearer <token>` on loan routes

## Mobile

```bash
cd mobile
npm install
npx expo start
```

On a physical device, set `EXPO_PUBLIC_API_ORIGIN` to your computer's LAN IP, for example `http://192.168.1.10:4000`. Android emulator defaults to `http://10.0.2.2:4000`.
