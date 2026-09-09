# Uso de herramientas de IA

El enunciado permite el uso de asistentes de IA y pide transparencia sobre cómo se
integran en el flujo de trabajo. Este archivo lo documenta.

## Herramienta

**Claude Code** (Anthropic, modelo Sonnet) — asistente de línea de comandos con
acceso al repositorio, capaz de editar archivos, ejecutar comandos y usar `git`/`gh`.

No se usaron otras herramientas (Copilot, ChatGPT, etc.).

## Flujo de trabajo

Se trabajó de forma deliberada, no "pídele todo y pega":

1. **Plan.** Se leyó el enunciado y se acordó un plan de trabajo escrito
   ([`PLAN.md`](./PLAN.md)) con decisiones técnicas, algoritmo de score, forma de
   errores y usuarios mock.
2. **Issues.** El plan se bajó a 14 issues en GitHub agrupados en 4 milestones, más
   un épico de seguimiento ([#15](https://github.com/EmoMeza/desafio-tecnicov3/issues/15)).
3. **Rama + PR por issue.** Cada issue se implementó en su propia rama, con un Pull
   Request que lo cierra. Commits con prefijo Conventional Commits.
4. **Verificación antes de cada commit.** Ningún commit se hizo sin revisar el mensaje
   y que `lint` + `typecheck` + `build` + `tests` estuvieran en verde, además de
   pruebas manuales (`curl`, capturas con Playwright, `docker compose up`).

El historial de `git` refleja este proceso: commits pequeños, mensajes descriptivos,
un PR por unidad de trabajo.

## Qué generó la IA

Prácticamente todo el código de implementación: estructura del backend por capas,
middlewares de autenticación y autorización, algoritmo de score, la SPA de React con
su sistema de diseño, los tests, los Dockerfiles y esta documentación.

## Qué fue criterio y decisión humana

- **Stack y arquitectura**: Express con capas (sobre Fastify/NestJS), Tailwind (sobre
  CSS plano/librería de componentes), carpetas independientes + `docker compose`
  (sobre monorepo con workspaces).
- **Linter**: cambiar el `oxlint` que trae el scaffold de Vite por ESLint + Prettier,
  por ser lo que un evaluador espera.
- **Dominio**: mantener el campo de RUT editable para el rol `user` en el frontend, de
  modo que el error `403` que pide el enunciado sea demostrable desde la UI (en vez de
  bloquearlo).
- **Diseño**: la dirección visual (tipografías, paleta institucional, el *readout* del
  score con banda de riesgo) y ajustes concretos como centrar las vistas.
- **Alcance**: qué extras entran (validación de RUT módulo 11, Docker, CI) y en qué
  orden; qué se recorta si falta tiempo.
- Revisión y aprobación de cada commit y cada PR.

## Cómo se validó el output

- **Tests automatizados**: 70 casos en el backend (Vitest + Supertest), cobertura
  ~99%. Umbral de cobertura del 80% aplicado en CI.
- **Gates de calidad**: `eslint`, `tsc --noEmit` estricto y `prettier --check` antes
  de cada commit.
- **Pruebas manuales**: `curl` contra cada endpoint (incluidos los casos de error),
  revisión visual del frontend con capturas de Playwright en desktop y móvil, y
  `docker compose up --build` de extremo a extremo.

## Nota sobre el ejemplo del enunciado

El enunciado usa `12.345.678-9` como RUT de ejemplo, pero su dígito verificador no es
válido (módulo 11 → `5`). Como el proyecto valida RUTs, los usuarios mock usan RUTs
con dígito verificador correcto.
