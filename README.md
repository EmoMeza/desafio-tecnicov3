# Consulta de Riesgo Financiero

MVP de consulta de riesgo crediticio: una **API REST** (Node.js + TypeScript) con
autenticación JWT y autorización por roles, y una **SPA** (React + TypeScript) para
iniciar sesión y consultar el score financiero de un RUT.

> Desafío técnico para un proceso de selección (YOL1 / ProntoPaga).
> El plan de trabajo está en [`PLAN.md`](./PLAN.md); el seguimiento por issues, en el
> [épico #15](https://github.com/EmoMeza/desafio-tecnicov3/issues/15).
> El uso de herramientas de IA está documentado en [`ai_interactions.md`](./ai_interactions.md).

## Stack

| Capa      | Tecnología                                                                    |
| --------- | ---------------------------------------------------------------------------- |
| Backend   | Express 5, TypeScript, `jsonwebtoken`, `bcryptjs`, `zod`, `pino`             |
| Frontend  | Vite, React 19, TypeScript, Tailwind CSS v4, React Router                    |
| Tests     | Vitest + Supertest (backend, 70 casos, cobertura ~99%)                       |
| Calidad   | ESLint (flat config) + Prettier + `tsc` estricto                            |
| Contenedores | Docker multi-stage + `docker compose` (camino secundario)                |

## Estructura

```
.
├── backend/            API REST (Express, arquitectura por capas)
│   └── src/
│       ├── routes/         define los endpoints
│       ├── controllers/    traduce HTTP ↔ dominio
│       ├── services/       lógica de negocio (auth, score)
│       ├── middlewares/    autenticación, autorización, errores, 404
│       ├── domain/         funciones puras (RUT módulo 11, algoritmo de score)
│       ├── lib/            AppError, wrapper de JWT, logger
│       ├── config/         entorno tipado (zod) y usuarios mock
│       ├── app.ts          crea la instancia de Express (sin listen)
│       └── server.ts       arranque + apagado ordenado
├── frontend/          SPA (Vite + React)
│   └── src/
│       ├── pages/         Login, Score, NotFound
│       ├── components/    Layout, RequireAuth, ScoreResult
│       ├── auth/          contexto de sesión (localStorage)
│       ├── lib/           cliente HTTP, RUT, storage
│       └── types/         tipos espejo del backend
├── docker-compose.yml
├── package.json       runner de la raíz (concurrently), sin workspaces
└── PLAN.md
```

## Requisitos

- **Node.js ≥ 22** (ver [`.nvmrc`](./.nvmrc)) y **npm ≥ 10**
- Opcional: Docker + Docker Compose

## Ejecución con npm (recomendado)

```bash
git clone https://github.com/EmoMeza/desafio-tecnicov3.git
cd desafio-tecnicov3

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

npm install     # instala la raíz y, vía postinstall, backend/ y frontend/
npm run dev      # levanta ambos en paralelo
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3000> (healthcheck en `/health`)

### Variables de entorno

**`backend/.env`** (ver `backend/.env.example`)

| Variable         | Por defecto              | Descripción                                  |
| ---------------- | ------------------------ | -------------------------------------------- |
| `PORT`           | `3000`                   | Puerto del servidor                          |
| `JWT_SECRET`     | —                        | **Obligatoria.** Secreto para firmar los JWT |
| `JWT_EXPIRES_IN` | `15m`                    | Expiración de los tokens                     |
| `CORS_ORIGIN`    | `http://localhost:5173`  | Origen permitido para CORS                   |

**`frontend/.env`** (ver `frontend/.env.example`)

| Variable       | Por defecto             | Descripción              |
| -------------- | ----------------------- | ------------------------ |
| `VITE_API_URL` | `http://localhost:3000` | URL base de la API       |

### Scripts de la raíz

| Script                 | Efecto                                    |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Backend + frontend en paralelo            |
| `npm run build`        | Build de producción de ambos              |
| `npm test`             | Tests del backend (Vitest)                |
| `npm run lint`         | ESLint en ambos paquetes                  |
| `npm run typecheck`    | `tsc` de ambos                            |
| `npm run format`       | Prettier `--write` en todo el repo        |
| `npm run format:check` | Prettier `--check` (no escribe)           |

En `backend/` además: `npm run test:coverage` y `npm run test:watch`.

## Ejecución con Docker (alternativa)

```bash
docker compose up --build
```

Mismas URLs (`5173` / `3000`). Los valores de entorno tienen defaults para la demo;
se pueden sobreescribir con un `.env` en la raíz o exportando variables. Detalles en
[`docker-compose.yml`](./docker-compose.yml).

## Credenciales de prueba

Usuarios mock en memoria (sin base de datos). Contraseñas hasheadas con bcrypt.

| Correo             | Contraseña   | Rol     | Puede consultar   |
| ------------------ | ------------ | ------- | ----------------- |
| `admin@riesgo.cl`  | `Admin123!`  | `admin` | cualquier RUT     |
| `ana@riesgo.cl`    | `Ana123!`    | `user`  | `12.345.678-5`    |
| `bruno@riesgo.cl`  | `Bruno123!`  | `user`  | `15.834.966-3`    |

## API

### `POST /login`

```bash
curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@riesgo.cl","password":"Ana123!"}'
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiI...",
  "user": { "sub": "usr-001", "role": "user", "rut": "12.345.678-5" }
}
```

El JWT (`HS256`) lleva en el payload `sub`, `role` y `rut` (este último **solo** si el
rol es `user`).

### `GET /score/:rut`

Requiere `Authorization: Bearer <token>`. El middleware **autoriza antes de validar**
el RUT: primero comprueba el permiso, luego el dígito verificador.

```bash
USER=$(curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@riesgo.cl","password":"Ana123!"}' | jq -r .token)

ADMIN=$(curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@riesgo.cl","password":"Admin123!"}' | jq -r .token)

# user consultando su propio RUT → 200
curl -s http://localhost:3000/score/12.345.678-5 -H "Authorization: Bearer $USER"
# { "rut": "12.345.678-5", "score": 8, "fecha": "2025-06-27T14:35:00Z" }

# user consultando otro RUT → 403 FORBIDDEN_RUT
curl -s http://localhost:3000/score/15.834.966-3 -H "Authorization: Bearer $USER"

# sin token → 401 UNAUTHENTICATED
curl -s http://localhost:3000/score/12.345.678-5

# admin consultando cualquier RUT válido → 200
curl -s http://localhost:3000/score/15.834.966-3 -H "Authorization: Bearer $ADMIN"

# admin con RUT de dígito verificador inválido → 400 INVALID_RUT
curl -s http://localhost:3000/score/12.345.678-9 -H "Authorization: Bearer $ADMIN"
```

### Forma de los errores

Respuesta JSON uniforme: `{ "error": { "code": "...", "message": "..." } }`

| HTTP | `code`                | Situación                                       |
| ---- | --------------------- | ---------------------------------------------- |
| 400  | `INVALID_RUT`         | RUT con formato o dígito verificador inválido   |
| 400  | `VALIDATION_ERROR`    | Body de `/login` inválido                       |
| 401  | `INVALID_CREDENTIALS` | Email o contraseña incorrectos                  |
| 401  | `UNAUTHENTICATED`     | Falta el token, o firma/expiración inválida     |
| 403  | `FORBIDDEN_RUT`       | `user` consultando un RUT que no es el suyo     |
| 404  | `NOT_FOUND`           | Ruta inexistente                                |

## Arquitectura

### Flujo de autenticación y autorización

```
POST /login ─▶ auth.service (valida credenciales) ─▶ lib/jwt.signToken ─▶ { token, user }

GET /score/:rut
  └─▶ authenticate      valida Bearer + firma + expiración   → 401 si falla
  └─▶ authorizeRut      admin: pasa · user: RUT propio       → 403 si no
  └─▶ score.controller ─▶ score.service ─▶ domain/score + domain/rut
```

`app.ts` exporta la instancia de Express **sin** `listen`, de modo que los tests de
integración la usan directamente con Supertest.

### Algoritmo de score

Determinista, sin persistencia: se **recalcula** en cada consulta.

1. Normalizar el RUT (quitar puntos y guion, `K` en mayúscula).
2. Hash **FNV-1a de 32 bits** sobre esa cadena.
3. `score = hash % 101` → entero en `[0, 100]`.

El mismo RUT devuelve siempre el mismo score; RUTs distintos, scores distintos.
El campo `fecha` es el instante de la consulta (ISO 8601 UTC).

### Validación de RUT (módulo 11)

Se implementa en `backend/src/domain/rut.ts` y se replica en `frontend/src/lib/rut.ts`
(funciones puras, ~50 líneas). El frontend valida el dígito verificador antes de
enviar la petición.

### Frontend

- `react-router`: `/` (consulta, protegida por `RequireAuth`) y `/login`.
- `AuthContext` guarda `{ token, user }` en `localStorage` y lo rehidrata al cargar.
- El cliente HTTP normaliza los errores a `ApiError` y, ante un 401 en una petición
  autenticada, cierra la sesión y muestra "tu sesión expiró".

## Tests y calidad

```bash
npm test                       # 70 casos del backend
npm run test:coverage --prefix backend   # cobertura (umbral 80%, actual ~99%)
npm run lint && npm run typecheck
```

- **Unit**: RUT (válidos/inválidos, `K`, `0`), algoritmo de score (determinismo,
  rango, sensibilidad), JWT (firma, expiración).
- **Integración** (Supertest): `POST /login` y `GET /score/:rut` cubriendo 401 sin
  token, 401 expirado, 200 user propio, 403 user ajeno, 200 admin, 400 RUT inválido.

## Decisiones y trade-offs

- **Sin base de datos.** El enunciado lo pide. Los usuarios viven en `config/users.ts`
  y el score se deriva del RUT en vez de almacenarse. Un producto real añadiría tabla
  de usuarios, caché o buró externo, y auditoría de consultas.
- **Token en `localStorage`.** Simple para el MVP; expuesto a XSS. Una cookie
  `httpOnly` + `SameSite` sería más segura pero requiere manejo de CSRF y un backend
  que fije la cookie. Documentado como deuda consciente.
- **Sin revocación de tokens.** No hay store de sesiones, así que un JWT vale hasta
  expirar. Mitigación: expiración corta (`15m`).
- **`bcryptjs`** (JS puro) en vez de `bcrypt` (nativo) para que las imágenes de Docker
  no necesiten toolchain de compilación.
- **Lógica de RUT duplicada** front/back en vez de un paquete compartido, coherente
  con la decisión de mantener las carpetas independientes.
- **Docker es el camino secundario.** El enunciado ejemplifica con `npm install && npm
  run dev`, así que ese es el flujo principal del README.

## Uso de IA

El desarrollo se apoyó en **Claude Code**. El detalle —qué generó, cómo se revisó y
qué decisiones fueron humanas— está en [`ai_interactions.md`](./ai_interactions.md).
