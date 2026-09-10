---
name: fsd-architecture
description: Reglas de dónde vive cada archivo y qué puede importar en fe-pseudolearn, que sigue Feature-Sliced Design. Úsala antes de crear cualquier archivo bajo src/ (ruta, vista, widget, feature, entidad o módulo compartido), al mover código entre capas, al añadir un import que cruza capas, y siempre que dudes de a qué capa pertenece algo. Las reglas las verifica CI con scripts/check-architecture.mjs, que lee architecture.yaml.
---

# Arquitectura FSD de `fe-pseudolearn`

`src/` sigue Feature-Sliced Design. Todo lo de aquí lo comprueba
[scripts/check-architecture.mjs](../../../scripts/check-architecture.mjs), que **lee las reglas de
[architecture.yaml](../../../architecture.yaml)**. Si cambias una regla, cámbiala en el YAML: el
script no tiene reglas propias, y por eso documentación y verificador no pueden desincronizarse.

## Capas, de más a menos específica

```
app > views > widgets > features > entities > shared
```

Más dos carpetas no estratificadas: `pages/` (reservada por Astro) y `assets/`.

| capa       | responsabilidad                                  |
| ---------- | ------------------------------------------------ |
| `app`      | arranque global: layout base y SEO de sitio      |
| `views`    | composición completa de una ruta                 |
| `widgets`  | bloques compuestos de una página                 |
| `features` | interacción disparada por la persona             |
| `entities` | objeto de negocio con modelo propio              |
| `shared`   | genérico y agnóstico de negocio                  |
| `pages`    | rutas de Astro, envoltorios de 14 líneas o menos |

Alias: `@app/*`, `@views/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`, `@assets/*`.

## Sentido de los imports

Una capa importa de sí misma o de una **menos específica**. `shared` no importa de `entities`;
`entities` no importa de `widgets`. La única excepción, declarada por nombre en el YAML, es
**`views` puede importar `app`**, porque el layout base es una primitiva que toda vista necesita.

Si escribes en `src/widgets/hero/`, puedes importar `@features/*`, `@entities/*` y `@shared/*`, y
nunca `@views/*` ni `@app/*`.

## Lo que CI comprueba

1. **Sentido de los imports**, con la excepción de arriba.
2. **Sin barrels de capa completa.** Nunca `src/widgets/index.ts`. Los barrels _dentro_ de un
   componente (`src/shared/ui/icon/index.ts`) son correctos y esperados. El motivo: con
   `build.inlineStylesheets: 'auto'`, importar a través de un barrel ancho arrastra el CSS de todo lo
   que reexporta y revienta el presupuesto en silencio.
3. **Sin carpetas heredadas.** Toda carpeta directa bajo `src/` es una capa, `pages` o `assets`.
4. **Aislamiento del runtime.** Un solo archivo importa `cloudflare:workers`
   ([src/shared/lib/runtime-env.ts](../../../src/shared/lib/runtime-env.ts)) y uno solo
   `cloudflare:sockets` (el adaptador SMTP). Si necesitas un secreto en otro sitio, llama a
   `getRuntimeEnv()`.
5. **Envoltorios finos.** Todo `src/pages/**/*.astro` tiene 14 líneas o menos y solo importa de
   `@views/*` y `@shared/*`.

## Dónde poner código nuevo

- Ruta nueva → envoltorio en `pages/` y contenido real en `views/`. Recuerda el par en `/en/`:
  `check:routes` falla si un idioma tiene una ruta que el otro no.
- Sección de página o bloque compuesto → `widgets/`.
- Interacción del usuario que no es una sección entera → `features/`.
- Objeto de negocio con modelo propio → `entities/`.
- Primitiva genérica sin negocio → `shared/`.

## Cuándo crear una entidad

Solo con una de estas dos justificaciones:

1. Hay una **frontera de entrada/salida externa** real.
2. Hay **dos o más consumidores independientes** del mismo modelo.

Hoy hay tres: `contact-request` (dos fronteras de I/O: anti-bot y correo), `learning-module`
(el catálogo alimenta el landing y tres desplegables del formulario) y `platform` (la matriz de
disponibilidad aparece en cinco sitios). Los niveles de donación **no** son una entidad: un solo
consumidor, ningún modelo, ninguna I/O. Convertirlos en entidad sería ceremonia.

## Inversión de dependencias, con alcance estrecho a propósito

Solo se invierte en una frontera externa real. Hay dos puertos, ambos en
`entities/contact-request/api/`:

```ts
export interface BotChallengeGateway {
  verify(token: string, remoteAddress: string | null): Promise<BotChallengeResult>;
}

export interface MailGateway {
  deliver(request: ContactRequest): Promise<MailDeliveryResult>;
}
```

Cada uno tiene su adaptador concreto y su doble en `entities/contact-request/testing/`. Depende del
puerto o del doble, nunca del adaptador.

No hay contenedor de inyección ni framework: la raíz de composición es
[src/views/contact/api/contact-dependencies.ts](../../../src/views/contact/api/contact-dependencies.ts),
que la ruta invoca. **No inviertas i18n, ni la configuración estática, ni los catálogos**: no hay
dependencia externa que invertir y una interfaz sin segunda implementación es coste sin beneficio.

## Por qué la i18n es propia y no `astro:i18n`

El sitio necesita que la clave de traducción sea un **tipo**, para que una clave inventada sea un
error de compilación y no un fallo en tiempo de ejecución. `astro:i18n` no da eso. Además el
conmutador de idioma persiste la elección y muestra un aviso condicional que su enrutado no cubre.
No migres a `astro:i18n` y no añadas un bloque `i18n` a `astro.config.mjs`.
