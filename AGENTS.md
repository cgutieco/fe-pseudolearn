# AGENTS.md — `fe-pseudolearn`

Guía para agentes de código que trabajan en este repositorio. `CLAUDE.md` es un symlink a este
archivo: una sola fuente, dos puntos de entrada.

Este paquete **endurece** las reglas del monorepo. Donde ambas hablan, manda esta.

## Reglas propias, no negociables

| ID                     | Regla                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FE-NO-COMMENTS`       | Cero comentarios en `src/`, `scripts/` y `tests/`. Cada función y cada variable se explican por su nombre y su cuerpo. Única excepción: directivas de herramienta sin prosa (`eslint-disable`, `@ts-expect-error`, `prettier-ignore`, `stylelint-disable`). Esto **endurece** `QUALITY-WHY-ONLY` del monorepo, que sí admitía un _por qué_ local |
| `FE-BEM-STRICT`        | Toda clase sigue `block__element--modifier`. Palabras compuestas dentro de un segmento con un solo guion medio: `product-preview__frame-caption--dark`                                                                                                                                                                                           |
| `FE-CSS-NAMESPACE`     | El vocabulario CSS público de `src/shared/styles/` lleva prefijo `pl-`. Las clases de un `<style>` de componente van sin prefijo. El prefijo significa «esto se reutiliza»                                                                                                                                                                       |
| `FE-NO-HARDCODED-TEXT` | Ningún texto literal para una persona en una plantilla `.astro`. Todo pasa por `t()`                                                                                                                                                                                                                                                             |
| `FE-I18N-PARITY`       | `es.json` y `en.json` tienen claves idénticas, sin huérfanas ni faltantes                                                                                                                                                                                                                                                                        |
| `FE-ROUTE-PARITY`      | Toda ruta existe en los dos idiomas                                                                                                                                                                                                                                                                                                              |
| `FE-LAYER-DIRECTION`   | Una capa importa solo de sí misma o de una menos específica. Única excepción declarada: `views → app`                                                                                                                                                                                                                                            |
| `FE-NO-LAYER-BARREL`   | Prohibido `src/<capa>/index.ts`. Los barrels de un componente concreto sí valen                                                                                                                                                                                                                                                                  |
| `FE-THIN-ROUTES`       | Los archivos de `src/pages/` tienen 14 líneas o menos e importan solo de `@views/*` y `@shared/*`                                                                                                                                                                                                                                                |
| `FE-RUNTIME-ISOLATION` | Un solo archivo importa `cloudflare:workers`, y uno solo `cloudflare:sockets`                                                                                                                                                                                                                                                                    |
| `FE-NO-RAW-COLOR`      | Ningún color literal fuera de `src/shared/styles/tokens.css`                                                                                                                                                                                                                                                                                     |
| `FE-JS-BUDGET`         | El JavaScript por ruta no supera el presupuesto de `architecture.yaml`                                                                                                                                                                                                                                                                           |
| `FE-VERIFIER-NEGATIVE` | Todo verificador lleva un fixture con una violación deliberada que debe hacerlo fallar                                                                                                                                                                                                                                                           |
| `FE-SIZE-*`            | Los límites de tamaño son los de `architecture.yaml`. Los de función, parámetros y anidación los aplica ESLint                                                                                                                                                                                                                                   |
| `LANG-EN-CODE`         | Todo el código en inglés. Los textos para la persona visitante viven en los diccionarios                                                                                                                                                                                                                                                         |
| `LANG-ES-DOCS`         | `AGENTS.md`, `README.md` y las skills en español                                                                                                                                                                                                                                                                                                 |

La consecuencia de `FE-NO-COMMENTS` hay que asumirla entera: **quitar un comentario sin escribir el
`README` es pérdida de información, no limpieza.** El _por qué_ vive en el `README.md` y en las
skills; el código responde _qué_ y _cómo_.

## Antes de tocar un archivo

1. Localiza su capa: `src/app`, `src/views`, `src/widgets`, `src/features`, `src/entities`, `src/shared`.
2. Lee `architecture.yaml`. Es la fuente que leen los verificadores, no una copia de la documentación.
3. Responde tres preguntas: en qué capa vive, qué puede importar, y si la responsabilidad que vas a
   escribir ya tiene dueño.

## Comandos

```
pnpm dev              pnpm build              pnpm preview            pnpm deploy
pnpm test             pnpm test:e2e           pnpm test:a11y          pnpm test:visual
pnpm lint             pnpm lint:css           pnpm format:check       pnpm check:types
pnpm check:static     pnpm check:budget       pnpm check:all
```

`pnpm check:static` agrupa los siete verificadores propios. `pnpm check:all` lo ejecuta todo en orden.

Para sesiones largas, el servidor de desarrollo en segundo plano: `astro dev --background`, y luego
`astro dev status`, `astro dev logs`, `astro dev stop`.

## Skills

En `.agents/skills/`, accesibles también desde `.claude/skills`:

| Skill              | Cuándo                                            |
| ------------------ | ------------------------------------------------- |
| `fsd-architecture` | Al crear un archivo nuevo o mover uno de capa     |
| `design-system`    | Al tocar tokens, primitivas o cualquier `<style>` |
| `i18n-authoring`   | Al añadir, cambiar o borrar una cadena            |
| `commit-message`   | Al escribir un mensaje de commit                  |

## Referencias

- [Astro: enrutado](https://docs.astro.build/en/guides/routing/)
- [Astro: componentes](https://docs.astro.build/en/basics/astro-components/)
- [Astro: estilos](https://docs.astro.build/en/guides/styling/)
- [Astro: imágenes](https://docs.astro.build/en/guides/images/)
- [Astro: adaptador de Cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Astro: i18n](https://docs.astro.build/en/guides/internationalization/) — este proyecto **no** lo usa; el porqué está en el `README`
