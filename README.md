# Desafío Técnico — MVP Consulta de Riesgo Financiero

API REST segura (Node.js + TypeScript) + SPA (React + TypeScript) para consultar el
score crediticio de un RUT con autenticación JWT y autorización por roles.

> Desafío de proceso de selección (YOL1 / ProntoPaga).
> El plan de trabajo y las decisiones técnicas están en [`PLAN.md`](./PLAN.md).
> El seguimiento por issues, en el [épico #15](https://github.com/EmoMeza/desafio-tecnicov3/issues/15).

## Estructura

```
.
├── backend/      API REST (Express + TypeScript)
├── frontend/     SPA (Vite + React + TypeScript)
├── package.json  runner de la raíz (concurrently), sin workspaces
└── PLAN.md       plan de trabajo
```

## Requisitos

- Node.js >= 22 (ver [`.nvmrc`](./.nvmrc))
- npm >= 10

## Cómo ejecutar (local)

```bash
npm install    # instala la raíz y, vía postinstall, backend/ y frontend/
npm run dev     # levanta backend y frontend en paralelo
```

- Backend: <http://localhost:3000>
- Frontend: <http://localhost:5173>

Antes de arrancar, copia los archivos de entorno de ejemplo:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Scripts de la raíz

| Script                 | Efecto                                    |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Backend + frontend en paralelo            |
| `npm run build`        | Build de ambos                            |
| `npm test`             | Tests del backend                         |
| `npm run lint`         | ESLint en ambos                           |
| `npm run lint:fix`     | ESLint con `--fix` en ambos               |
| `npm run typecheck`    | `tsc` de ambos                            |
| `npm run format`       | Prettier `--write` en todo el repo        |
| `npm run format:check` | Prettier `--check` (sin escribir)         |

## Estado

En construcción. Avance por milestones e issues en el
[épico #15](https://github.com/EmoMeza/desafio-tecnicov3/issues/15).

## Uso de IA

Este proyecto se desarrolla con apoyo de herramientas de IA. El detalle se
documentará en [`ai_interactions.md`](./ai_interactions.md) (issue #13).
