---
name: commit-message
description: Formato de los mensajes de commit de fe-pseudolearn. Úsala siempre que vayas a escribir un commit en este repositorio.
---

# Mensajes de commit

Conventional Commits, **en inglés** (`LANG-EN-CODE` alcanza también a los mensajes de commit).

```
<type>(<scope>): <resumen en imperativo, sin punto final>

<cuerpo opcional: por qué, no qué>
```

## Tipos

`feat`, `fix`, `refactor`, `perf`, `a11y`, `docs`, `test`, `build`, `ci`, `chore`.

`a11y` no es estándar de Conventional Commits y aquí sí lo es: la accesibilidad tiene puerta propia
en CI y merece ser rastreable por separado.

## Ámbitos

El nombre de la capa o del módulo: `shared/i18n`, `widgets/site-header`, `features/contact-form`,
`entities/contact-request`, `scripts`, `tokens`, `deps`.

## Ejemplos

```
feat(features/contact-form): replace file uploads with a pasted program field
fix(shared/styles): let the hidden attribute win over component display rules
a11y(widgets/synchronized-surfaces): give the scrollable code and trace regions keyboard access
refactor(entities/contact-request): split request validation into three focused passes
perf(widgets/product-preview): preload the LCP image per breakpoint and colour scheme
test(scripts): add a negative fixture for every verifier
docs(readme): record why the i18n layer is custom instead of astro:i18n
```

## Reglas

- El resumen cabe en 72 caracteres y va en imperativo: `add`, no `added` ni `adds`.
- Un commit, un cambio. Si el resumen necesita una «y», son dos commits.
- El cuerpo explica el **porqué**. El qué ya está en el diff.
- Si el cambio toca una decisión de arquitectura, el mismo commit actualiza el `README.md`
  (`DOC-README-TRUTH`). Nunca dejes una decisión viviendo solo en el mensaje del commit.
