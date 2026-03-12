# bankruptn't 💚

> Tu banco digital — simple, seguro y moderno.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL (Neon) |
| ORM | Prisma |
| API | REST (Next.js API Routes) |
| Auth | JWT + bcrypt + face-api.js |

## Colores
- **Mint Neon** `#3DF5B0` — primario
- **Night Blue** `#0F0F1A` — fondo

---

## Setup paso a paso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear proyecto en Neon
1. Ve a [console.neon.tech](https://console.neon.tech)
2. Crea un nuevo proyecto → nombre: `bankruptnt`
3. Copia la **Connection string** (pooled) y la **Direct URL**

### 3. Configurar variables de entorno
```bash
cp .env.local.example .env.local
# Edita .env.local con tus valores de Neon
```

### 4. Crear tablas en la base de datos
```bash
npm run db:push        # Crea las tablas desde el schema Prisma
npm run db:seed        # Carga datos de prueba (opcional)
```

### 5. Descargar modelos face-api.js
Ve a: https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Descarga estos archivos a `/public/models/`:
- `tiny_face_detector_model-weights_manifest.json` + shard
- `face_landmark_68_model-weights_manifest.json` + shard
- `face_recognition_model-weights_manifest.json` + shard

### 6. Correr en desarrollo
```bash
npm run dev
# → http://localhost:3000
```

---

## API Routes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login (password o facial) |
| GET | `/api/account` | Balance + stats + recientes |
| GET | `/api/transactions` | Historial paginado + filtros |
| POST | `/api/transactions/send` | Enviar dinero |
| GET | `/api/user/find?phone=` | Buscar usuario por teléfono |

---

## Credenciales demo (después del seed)
```
Teléfono: +573001234567
Contraseña: demo123
```

---

## Comandos Prisma útiles
```bash
npm run db:generate   # Regenerar Prisma Client
npm run db:push       # Sincronizar schema → DB (sin migración)
npm run db:migrate    # Crear migración formal
npm run db:studio     # Abrir Prisma Studio (UI para la DB)
```
