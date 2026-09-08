# Plan de Trabajo — MVP Consulta de Riesgo Financiero

> Desafío técnico (YOL1 / ProntoPaga). Este documento define el alcance, las
> decisiones técnicas y el desglose en issues. Cada issue se trabaja en su propia
> rama con un Pull Request que la cierra.

---

## 1. Objetivo

Construir un MVP seguro de **Consulta de Riesgo Financiero**:

- **Backend**: API REST en Node.js + TypeScript con autenticación JWT y
  autorización por roles (`admin` / `user`).
- **Frontend**: SPA en React + TypeScript para login y consulta de score por RUT.

### Endpoints

| Método | Ruta            | Auth        | Descripción                                                        |
| ------ | --------------- | ----------- | ------------------------------------------------------------------ |
| `POST` | `/login`        | Pública     | Credenciales mock → JWT firmado (`sub`, `role`, `rut` si `user`).  |
| `GET`  | `/score/:rut`   | JWT + rol   | Score determinista 0–100 del RUT. `user` solo su RUT; `admin` todo. |
| `GET`  | `/health`       | Pública     | Healthcheck para Docker / CI.                                      |

Respuesta de `/score/:rut`:

```json
{ "rut": "12.345.678-5", "score": 73, "fecha": "2025-06-27T14:35:00Z" }
```

---

## 2. Decisiones técnicas

| Área              | Decisión                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Backend framework | **Express** con arquitectura por capas (`routes → controllers → services → middlewares`).   |
| Frontend          | **Vite + React + TypeScript + Tailwind CSS**.                                                |
| Estructura repo   | Carpetas **independientes** `backend/` y `frontend/`, cada una con su `package.json`.        |
| Runner raíz       | `package.json` delgado en la raíz con `concurrently` → `npm install` + `npm run dev`.        |
| Auth              | JWT `HS256`, secreto en `JWT_SECRET`, expiración en `JWT_EXPIRES_IN` (def. `15m`).           |
| Persistencia      | Ninguna. Usuarios mock en memoria/config.                                                    |
| Validación RUT    | Normalización + dígito verificador **módulo 11**.                                            |
| Tests             | **Vitest** (unit) + **Supertest** (integración) en el backend.                               |
| Contenedores      | `Dockerfile` por servicio + `docker-compose.yml` (camino **secundario**; npm es el primario). |
| CI                | **GitHub Actions**: lint + typecheck + test + build. Último issue, recortable.               |

### Sin persistencia

El enunciado lo pide explícitamente: *"no requiere persistencia en base de datos"*.
No hay base de datos, ORM, migraciones ni string de conexión.

- **Usuarios**: hardcodeados en `config/users.ts`, se leen de una constante en memoria.
- **Score**: no se almacena; se **recalcula** en cada request con el algoritmo
  determinista. El score determinista es, precisamente, la alternativa a persistir:
  en vez de buscar el valor en una tabla, se deriva del RUT.
- **Sesión**: vive en el propio JWT; el servidor no consulta ningún store.

Consecuencias asumidas (a documentar como trade-off en el README):

- No se pueden crear/editar usuarios en runtime; cambiar credenciales implica tocar código.
- No hay revocación de tokens: un JWT es válido hasta expirar. Mitigación: expiración
  corta (`15m`).
- Un producto real añadiría tabla de usuarios con passwords hasheadas, posible cache
  de scores o llamada a un buró externo, y log de auditoría de consultas por RUT.

### Algoritmo de score (determinista)

1. Normalizar el RUT: quitar puntos y guion, `K` en mayúscula → p. ej. `123456785`.
2. Hash **FNV-1a 32-bit** sobre esa cadena.
3. `score = hash % 101` → entero en `[0, 100]`.

Mismo RUT ⇒ mismo score siempre; RUTs distintos ⇒ scores distintos. Sin fechas ni
aleatoriedad en el cálculo. El campo `fecha` de la respuesta es el instante de la
consulta (`new Date().toISOString()`, truncado a segundos).

### Usuarios mock

| Email             | Password    | `sub`       | `role`  | `rut`          |
| ----------------- | ----------- | ----------- | ------- | -------------- |
| `admin@riesgo.cl` | `Admin123!` | `usr-admin` | `admin` | —              |
| `ana@riesgo.cl`   | `Ana123!`   | `usr-001`   | `user`  | `12.345.678-5` |
| `bruno@riesgo.cl` | `Bruno123!` | `usr-002`   | `user`  | `15.834.966-3` |

> Nota: el enunciado usa `12.345.678-9` como ejemplo, pero su dígito verificador no
> es válido (módulo 11 → `5`). Como implementamos validación de RUT, los usuarios
> mock usan RUTs válidos.

### Forma de los errores

Respuesta JSON uniforme y códigos HTTP consistentes:

```json
{ "error": { "code": "FORBIDDEN_RUT", "message": "No puedes consultar un RUT distinto al tuyo." } }
```

| Código HTTP | `error.code`         | Situación                                            |
| ----------- | -------------------- | --------------------------------------------------- |
| 400         | `INVALID_RUT`        | RUT con formato o dígito verificador inválido.       |
| 400         | `VALIDATION_ERROR`   | Body de `/login` inválido.                           |
| 401         | `INVALID_CREDENTIALS`| Email/password incorrectos.                          |
| 401         | `UNAUTHENTICATED`    | Falta el token, o firma/expiración inválida.         |
| 403         | `FORBIDDEN_RUT`      | `user` consultando un RUT que no es el suyo.         |
| 404         | `NOT_FOUND`          | Ruta inexistente.                                    |

---

## 3. Convenciones de trabajo

- **Ramas**: `feat/<n>-<slug>` · `chore/<n>-<slug>` · `docs/<n>-<slug>` (n = nº de issue).
- **Commits**: prefijo Conventional Commits en inglés (`feat:`, `fix:`, `docs:`…) y
  descripción en español. Completos pero breves. Sin trailer de co-autor.
- **Issues**: títulos y cuerpos en español.
- **PRs**: uno por issue, con `Closes #<n>` en la descripción. Merge a `main`.
- **Labels**: `backend`, `frontend`, `infra`, `testing`, `docs`, más `enhancement`.
- **Milestones**: `M1 Fundaciones`, `M2 Backend`, `M3 Frontend`, `M4 Entrega`.
- Un **issue épico** (`Plan de trabajo`) enlaza y trackea los 14 issues.

---

## 4. Resumen de issues

| #   | Título                                                        | Milestone       | Depende de |
| --- | ------------------------------------------------------------ | --------------- | ---------- |
| 1   | Scaffolding y estructura del repositorio                    | M1 Fundaciones  | —          |
| 2   | Tooling de calidad: ESLint, Prettier, tsconfig, EditorConfig | M1 Fundaciones  | #1         |
| 3   | App base del backend (Express, config, errores, health)     | M2 Backend      | #2         |
| 4   | Módulo de RUT: normalización y validación módulo 11         | M2 Backend      | #3         |
| 5   | Endpoint de score: `GET /score/:rut` determinista          | M2 Backend      | #4         |
| 6   | Autenticación: `POST /login` y emisión de JWT             | M2 Backend      | #3         |
| 7   | Middlewares de seguridad: autenticación JWT y autorización   | M2 Backend      | #5, #6     |
| 8   | Tests del backend (Vitest + Supertest)                      | M2 Backend      | #7         |
| 9   | App base del frontend (Vite + React + Tailwind + AuthContext) | M3 Frontend     | #2         |
| 10  | Vista de Login y gestión de sesión                          | M3 Frontend     | #9, #6     |
| 11  | Vista de Consulta de Score y manejo de errores              | M3 Frontend     | #10, #7    |
| 12  | Dockerización: Dockerfiles + docker-compose                 | M4 Entrega      | #8, #11    |
| 13  | README completo + `ai_interactions.md`                      | M4 Entrega      | #12        |
| 14  | CI con GitHub Actions (opcional / final)                    | M4 Entrega      | #8, #11    |

---

## 5. Issues detallados

### Issue 1 — Scaffolding y estructura del repositorio

- **Milestone:** M1 Fundaciones · **Labels:** infra · **Depende de:** —

**Contexto**
Establecer el esqueleto del monorepo con carpetas independientes y el runner de la
raíz que permite `npm install && npm run dev` tal como espera el enunciado.

**Tareas**
- [ ] `backend/` con `package.json` (TS, `tsx` para dev, `tsc` para build) y `src/index.ts` mínimo.
- [ ] `frontend/` con scaffold de Vite (`react-ts`).
- [ ] `package.json` en la raíz (privado, sin publicar) con `concurrently` y scripts:
  - `install:all`, `dev`, `build`, `test`, `lint`, `typecheck` (delegan a cada carpeta).
- [ ] `.nvmrc` (Node 22 LTS) y actualización de `.gitignore` si falta algo.
- [ ] `.env.example` en `backend/` (`PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`) y en `frontend/` (`VITE_API_URL`).
- [ ] `README.md` con sección "Cómo ejecutar" provisional.

**Criterios de aceptación**
- `npm install` en la raíz instala ambos paquetes.
- `npm run dev` levanta backend y frontend en paralelo sin errores.
- El repo no versiona `node_modules`, `dist`, `.env`.

**Notas técnicas**
- Puertos por defecto: backend `3000`, frontend `5173`.
- El `package.json` raíz **no** usa `workspaces`; solo orquesta con `concurrently`.

---

### Issue 2 — Tooling de calidad: ESLint, Prettier, tsconfig, EditorConfig

- **Milestone:** M1 Fundaciones · **Labels:** infra · **Depende de:** #1

**Contexto**
Homogeneizar estilo y tipado estricto en ambos paquetes antes de escribir lógica.

**Tareas**
- [ ] `tsconfig` estricto en cada paquete (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`).
- [ ] ESLint (flat config) con `@typescript-eslint`; preset de React en el frontend.
- [ ] Prettier + `.editorconfig`.
- [ ] Scripts `lint`, `lint:fix`, `format`, `typecheck` en cada `package.json`.
- [ ] (Opcional) Hook `pre-commit` con `lint-staged` si no añade fricción.

**Criterios de aceptación**
- `npm run lint` y `npm run typecheck` pasan en verde en un repo limpio.
- Formato consistente aplicado a todo el código existente.

**Notas técnicas**
- Sin reglas exóticas: presets recomendados + ajustes mínimos.

---

### Issue 3 — App base del backend (Express, config, errores, health)

- **Milestone:** M2 Backend · **Labels:** backend · **Depende de:** #2

**Contexto**
Servidor Express con la estructura de capas y la infraestructura transversal
(config tipada, logging, manejo de errores) sobre la que se montan los features.

**Tareas**
- [ ] Estructura: `src/{app.ts,server.ts,config/,routes/,controllers/,services/,middlewares/,domain/,lib/,types/}`.
- [ ] `app.ts` exporta la instancia de Express (sin `listen`) para poder testear con Supertest.
- [ ] Config tipada que lee y valida `process.env` (falla al arrancar si falta `JWT_SECRET`).
- [ ] Middlewares base: `helmet`, `cors` (origen del frontend configurable), `express.json`, logger de requests.
- [ ] `GET /health` → `{ status: "ok", uptime }`.
- [ ] Handler 404 (`NOT_FOUND`) y **error handler** central que traduce errores de dominio a la forma `{ error: { code, message } }`.
- [ ] Clase/utilidad `AppError` con `status` y `code`.

**Criterios de aceptación**
- `npm run dev` levanta el server y `GET /health` responde 200.
- Una ruta inexistente responde 404 con el body de error estándar.
- Un error lanzado en una capa interna se serializa con el formato uniforme y el status correcto.

**Notas técnicas**
- No usar `next(err)` manualmente en cada capa: usar `express-async-errors` o wrapper `asyncHandler`.

---

### Issue 4 — Módulo de RUT: normalización y validación módulo 11

- **Milestone:** M2 Backend · **Labels:** backend · **Depende de:** #3

**Contexto**
Utilidad de dominio pura y reutilizable para tratar RUTs chilenos. La usan el
endpoint de score y (en frontend) la validación del formulario.

**Tareas**
- [ ] `domain/rut.ts` con:
  - `normalizeRut(input)` → dígitos + DV sin puntos ni guion, `K` mayúscula.
  - `isValidRut(input)` → valida formato y dígito verificador (módulo 11).
  - `formatRut(input)` → canónico `12.345.678-5`.
- [ ] Manejo de entradas inválidas: vacío, sin DV, caracteres no permitidos, DV incorrecto.
- [ ] Tests unitarios con casos válidos e inválidos (incluye `K` y el ejemplo `12.345.678-9` como inválido).

**Criterios de aceptación**
- `isValidRut("12.345.678-5")` → `true`; `isValidRut("12.345.678-9")` → `false`.
- `formatRut("123456785")` → `"12.345.678-5"`.
- Funciones puras, sin dependencias de Express.

**Notas técnicas**
- Multiplicadores `2..7` cíclicos desde el dígito menos significativo; `11 - (suma % 11)` con casos `10 → K`, `11 → 0`.

---

### Issue 5 — Endpoint de score: `GET /score/:rut` determinista

- **Milestone:** M2 Backend · **Labels:** backend · **Depende de:** #4

**Contexto**
Cálculo del score y su exposición REST. Todavía **sin** middlewares de seguridad
(se añaden en #7); aquí se valida forma y determinismo.

**Tareas**
- [ ] `services/score.service.ts`: `getScore(rut)` → normaliza, valida (400 `INVALID_RUT` si falla), calcula FNV-1a `% 101`.
- [ ] `controllers/score.controller.ts` → arma `{ rut: formatRut(rut), score, fecha }`.
- [ ] `routes/score.routes.ts` → `GET /score/:rut`.
- [ ] Tests unitarios del algoritmo: determinismo (misma entrada → misma salida), rango `[0,100]`, sensibilidad (RUTs cercanos → scores distintos), equivalencia de formatos (`12.345.678-5` == `123456785`).

**Criterios de aceptación**
- Dos llamadas al mismo RUT devuelven el mismo `score`.
- `score` siempre entero en `[0, 100]`.
- RUT inválido → 400 `INVALID_RUT`.
- `fecha` en ISO 8601 UTC.

**Notas técnicas**
- Semilla FNV-1a: offset `2166136261`, prime `16777619`, aritmética `>>> 0`.

---

### Issue 6 — Autenticación: `POST /login` y emisión de JWT

- **Milestone:** M2 Backend · **Labels:** backend · **Depende de:** #3

**Contexto**
Login con credenciales mock que emite un JWT firmado con el payload requerido.

**Tareas**
- [ ] `config/users.ts` con los 3 usuarios mock (password comparado de forma simple; opcional `bcrypt` con hash pre-generado).
- [ ] `services/auth.service.ts`: `login(email, password)` → valida credenciales (401 `INVALID_CREDENTIALS`), construye payload y firma.
- [ ] `lib/jwt.ts`: `signToken(payload)` / `verifyToken(token)` envolviendo `jsonwebtoken`.
- [ ] Payload: `sub` siempre; `role`; `rut` **solo** si `role === "user"`.
- [ ] Validación del body con `zod` (400 `VALIDATION_ERROR`).
- [ ] `routes/auth.routes.ts` → `POST /login` → `{ token, user: { sub, role, rut? } }`.

**Criterios de aceptación**
- Credenciales válidas → 200 con JWT decodificable que contiene el payload correcto.
- Token de `admin` **no** incluye `rut`; token de `user` **sí**.
- Credenciales inválidas → 401 `INVALID_CREDENTIALS`.
- Body malformado → 400 `VALIDATION_ERROR`.

**Notas técnicas**
- `exp` derivado de `JWT_EXPIRES_IN`. `iat` automático. Algoritmo `HS256`.

---

### Issue 7 — Middlewares de seguridad: autenticación JWT y autorización

- **Milestone:** M2 Backend · **Labels:** backend · **Depende de:** #5, #6

**Contexto**
Proteger `/score/:rut`: primero autenticar (firma + expiración), luego autorizar
según rol y propiedad del RUT.

**Tareas**
- [ ] `middlewares/authenticate.ts`: extrae `Bearer` de `Authorization`, `verifyToken`, adjunta `req.user` tipado. Falla → 401 `UNAUTHENTICATED` (distingue token ausente / inválido / expirado en el `message`).
- [ ] `middlewares/authorizeRut.ts`: `admin` pasa siempre; `user` solo si `normalizeRut(req.params.rut) === normalizeRut(req.user.rut)`, si no 403 `FORBIDDEN_RUT`.
- [ ] Tipado global de `Express.Request` con `user?: AuthUser`.
- [ ] Encadenar en la ruta: `authenticate → authorizeRut → controller`.

**Criterios de aceptación**
- Sin token → 401. Token expirado → 401 con mensaje de expiración.
- `user` consultando su RUT → 200. `user` consultando otro RUT → 403 `FORBIDDEN_RUT`.
- `admin` consultando cualquier RUT válido → 200.
- La comparación de RUT es independiente del formato (`12.345.678-5` vs `123456785`).

**Notas técnicas**
- No filtrar en el mensaje de error si el RUT existe o no; solo permiso.

---

### Issue 8 — Tests del backend (Vitest + Supertest)

- **Milestone:** M2 Backend · **Labels:** testing · **Depende de:** #7

**Contexto**
Cerrar el backend con una suite que cubra unidad e integración de los flujos clave.

**Tareas**
- [ ] Config de Vitest (entorno node, `coverage` v8).
- [ ] Unit: `rut` (válidos/inválidos), `score` (determinismo, rango), `jwt` (sign/verify, expiración).
- [ ] Integración (Supertest sobre `app`):
  - `POST /login`: ok admin, ok user, credenciales malas, body inválido.
  - `GET /score/:rut`: sin token (401), token expirado (401), user propio RUT (200), user otro RUT (403), admin cualquiera (200), RUT inválido (400).
- [ ] Script `test` y `test:coverage`; helper para generar tokens de prueba.

**Criterios de aceptación**
- `npm test` en `backend/` pasa en verde.
- Cobertura de `services/`, `middlewares/` y `domain/` ≥ 80 %.

**Notas técnicas**
- Fijar `JWT_SECRET` de test vía `vitest.setup.ts`. Token expirado: firmar con `expiresIn: -1s`.

---

### Issue 9 — App base del frontend (Vite + React + Tailwind + AuthContext)

- **Milestone:** M3 Frontend · **Labels:** frontend · **Depende de:** #2

**Contexto**
Esqueleto de la SPA: estilos, routing, cliente HTTP y contexto de sesión.

**Tareas**
- [ ] Tailwind configurado (directivas, `content`, tema base) + reset.
- [ ] `react-router` con rutas `/login` y `/` (consulta), y un `NotFound`.
- [ ] `lib/apiClient.ts`: wrapper de `fetch` con `baseURL` (`VITE_API_URL`), inyección de `Authorization`, y normalización de errores (`ApiError` con `code`/`message`/`status`).
- [ ] `AuthContext`: `{ user, token, login(), logout(), isAuthenticated }`, persistido en `localStorage`, rehidratado al cargar.
- [ ] Layout responsive (header con estado de sesión + botón logout).
- [ ] Tipos compartidos con el backend en `src/types/` (`AuthUser`, `LoginResponse`, `ScoreResponse`, `ApiError`).

**Criterios de aceptación**
- `npm run dev` en `frontend/` levanta la SPA con Tailwind aplicado.
- Navegar a una ruta inexistente muestra `NotFound`.
- El contexto persiste sesión tras recargar.

**Notas técnicas**
- `localStorage` para el token: simple para el MVP; documentar el trade-off (XSS) frente a cookie `httpOnly` en el README.

---

### Issue 10 — Vista de Login y gestión de sesión

- **Milestone:** M3 Frontend · **Labels:** frontend · **Depende de:** #9, #6

**Contexto**
Formulario de login, guardas de ruta y manejo de expiración de sesión.

**Tareas**
- [ ] `LoginPage`: campos email/password, validación básica de cliente, estado `loading`, deshabilitar submit en curso.
- [ ] Llamada a `POST /login` → guardar sesión en el contexto → redirigir a `/`.
- [ ] Errores: 401 `INVALID_CREDENTIALS` y 400 `VALIDATION_ERROR` mostrados de forma clara (banner/inline), sin filtrar detalles técnicos.
- [ ] `RequireAuth`: componente/guard que redirige a `/login` si no hay sesión (guardando la ruta de origen).
- [ ] Manejo global de 401 desde el `apiClient`: limpiar sesión y redirigir a `/login` con mensaje "tu sesión expiró".
- [ ] Botón logout funcional.
- [ ] Credenciales de prueba visibles en la pantalla de login (ayuda al evaluador) o en el README.

**Criterios de aceptación**
- Login correcto redirige a la consulta y persiste sesión.
- Login incorrecto muestra mensaje claro y no navega.
- Acceder a `/` sin sesión redirige a `/login`.
- Un 401 en cualquier request cierra sesión y vuelve a `/login` con aviso.

---

### Issue 11 — Vista de Consulta de Score y manejo de errores

- **Milestone:** M3 Frontend · **Labels:** frontend · **Depende de:** #10, #7

**Contexto**
Pantalla principal: ingresar un RUT y ver su score, con feedback claro de todos
los casos de error del backend.

**Tareas**
- [ ] `ScorePage`: input de RUT con formateo/normalización y validación de dígito verificador en cliente (reutiliza la lógica de RUT).
- [ ] Para rol `user`: precargar su propio RUT y/o indicar que solo puede consultar el suyo.
- [ ] Llamada a `GET /score/:rut` con el token; estado `loading`.
- [ ] Resultado: tarjeta con `rut`, `score` (con indicador visual: barra o color por rango) y `fecha` formateada.
- [ ] Errores mapeados a mensajes de usuario:
  - 400 `INVALID_RUT` → "El RUT ingresado no es válido."
  - 403 `FORBIDDEN_RUT` → "Solo puedes consultar tu propio RUT."
  - 401 → gestionado por el flujo global de sesión.
- [ ] Responsive verificado en viewport móvil.

**Criterios de aceptación**
- `user` consulta su RUT y ve el score; consulta otro RUT y ve el mensaje 403.
- `admin` consulta cualquier RUT válido y ve el score.
- RUT inválido se bloquea en cliente o muestra el mensaje 400.
- Layout usable en móvil (~375px) y desktop.

---

### Issue 12 — Dockerización: Dockerfiles + docker-compose

- **Milestone:** M4 Entrega · **Labels:** infra · **Depende de:** #8, #11

**Contexto**
Camino alternativo de ejecución con un comando. **Secundario**: el README prioriza npm.

**Tareas**
- [ ] `backend/Dockerfile` multi-stage (build `tsc` → runtime `node`), usuario no root, `HEALTHCHECK` a `/health`.
- [ ] `frontend/Dockerfile`: build de Vite → servir estáticos con `nginx` (o `vite preview`), con proxy/`VITE_API_URL` al backend.
- [ ] `docker-compose.yml` en la raíz: servicios `backend` y `frontend`, red común, `env_file`, puertos publicados, `depends_on` con healthcheck.
- [ ] `.dockerignore` en cada carpeta.
- [ ] Probar `docker compose up --build` de extremo a extremo (login + consulta).

**Criterios de aceptación**
- `docker compose up --build` deja la app funcional en `http://localhost:5173` (o el puerto definido).
- Las imágenes no incluyen `node_modules` de dev innecesarios ni `.env`.

**Notas técnicas**
- Si el HMR dentro de contenedor añade complejidad, el compose sirve builds de producción; el dev con hot-reload queda por npm.

---

### Issue 13 — README completo + `ai_interactions.md`

- **Milestone:** M4 Entrega · **Labels:** docs · **Depende de:** #12

**Contexto**
Documentación de entrega: ejecución local, decisiones y transparencia de uso de IA.

**Tareas**
- [ ] README: descripción, requisitos, **ejecución con npm** (primero), ejecución con Docker (después), variables de entorno, credenciales de prueba.
- [ ] Sección de arquitectura: estructura de carpetas, capas del backend, flujo de auth, algoritmo de score, forma de errores.
- [ ] Ejemplos de `curl` para `/login` y `/score/:rut` (con y sin permiso).
- [ ] Decisiones y trade-offs (localStorage vs cookie, sin BD, etc.).
- [ ] Cómo correr tests y lint.
- [ ] `ai_interactions.md`: herramientas usadas (Claude Code), en qué partes ayudó, cómo se revisó/validó el output.

**Criterios de aceptación**
- Alguien externo puede clonar y levantar el proyecto siguiendo solo el README.
- `ai_interactions.md` presente y honesto.

---

### Issue 14 — CI con GitHub Actions (opcional / final)

- **Milestone:** M4 Entrega · **Labels:** infra · **Depende de:** #8, #11

**Contexto**
Pipeline que valida cada push/PR. Último issue; si el tiempo se acaba, se recorta
sin afectar la funcionalidad.

**Tareas**
- [ ] `.github/workflows/ci.yml` con jobs `backend` y `frontend` en paralelo.
- [ ] Backend: `npm ci` → `lint` → `typecheck` → `test`.
- [ ] Frontend: `npm ci` → `lint` → `typecheck` → `build`.
- [ ] Caché de `~/.npm` por `package-lock.json`.
- [ ] (Opcional) job que valida `docker compose build`.
- [ ] Badge de estado en el README.

**Criterios de aceptación**
- El workflow corre en verde sobre `main` y en PRs.
- Un fallo de lint/test/tsc marca el check en rojo.

---

## 6. Orden de ejecución

```
#1 ─▶ #2 ─┬─▶ #3 ─┬─▶ #4 ─▶ #5 ─┐
          │       │             ├─▶ #7 ─▶ #8 ─┐
          │       └─▶ #6 ───────┘             │
          │                                   ├─▶ #12 ─▶ #13
          └─▶ #9 ─▶ #10 ─▶ #11 ────────────────┤
                                              └─▶ #14
```

- **M1** (#1–#2): base común.
- **M2** (#3–#8): backend completo y testeado. `#4/#5` y `#6` pueden ir en paralelo tras `#3`.
- **M3** (#9–#11): frontend; `#9` puede arrancar apenas termine `#2`.
- **M4** (#12–#14): empaquetado, documentación y CI.
