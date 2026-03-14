# bankruptn't 💚

> Your digital bank — simple, secure and modern.

## Stack

| Layer | Technology |
|------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| API | REST (Next.js API Routes) |
| Auth | JWT + bcrypt + face-api.js |

## Colors
- **Mint Neon** `#3DF5B0` — primario
- **Night Blue** `#0F0F1A` — fondo

---

## Step-by-step setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create project in Neon
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project → name: `bankruptnt`
3. Copy the **Connection string** (pooled) and the **Direct URL**

### 3. Configure environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your Neon values
```

### 4. Create tables in the database
```bash
npm run db:push        # Create tables from Prisma schema
npm run db:seed        # Load test data (optional)
```

### 5. Download face-api.js models
Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Download these files to `/public/models/`:
- `tiny_face_detector_model-weights_manifest.json` + shard
- `face_landmark_68_model-weights_manifest.json` + shard
- `face_recognition_model-weights_manifest.json` + shard

### 6. Run in development
```bash
npm run dev
# → http://localhost:3000
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | Login (password or facial) |
| GET | `/api/account` | Balance + stats + recent |
| GET | `/api/transactions` | Paginated history + filters |
| POST | `/api/transactions/send` | Send money |
| GET | `/api/user/find?phone=` | Find user by phone |

---

## Demo credentials (after seed)
```
Phone: +573001234567
Password: demo123
```

---

## Useful Prisma commands
```bash
npm run db:generate   # Regenerate Prisma Client
npm run db:push       # Sync schema → DB (without migration)
npm run db:migrate    # Create formal migration
npm run db:studio     # Open Prisma Studio (DB UI)
```
