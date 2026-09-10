---
name: i18n-authoring
description: Cómo añadir, cambiar o borrar cualquier texto visible en fe-pseudolearn. Úsala siempre que vayas a escribir una cadena que va a leer una persona, al crear un componente con texto, al añadir una ruta, o cuando check:i18n o check:text fallen. Cubre la estructura de claves, el tipado, la pluralización, el texto con marcado y la paridad entre los dos diccionarios.
---

# Textos e internacionalización

Regla de partida: **ninguna palabra destinada a una persona vive en el código**. Lo comprueba
[scripts/check-hardcoded-text.mjs](../../../scripts/check-hardcoded-text.mjs), que recorre cada
plantilla `.astro` y falla ante cualquier nodo de texto con letras que no venga de una expresión.

## Los dos diccionarios

`src/shared/i18n/es.json` y `src/shared/i18n/en.json`. Claves planas en notación de puntos, agrupadas
por página o por área: `home.hero.title`, `contact.branch.error.label`, `donations.costs.storeTitle`.

El español es el diccionario canónico: de él se deriva el tipo.

```ts
export type TranslationKey = keyof typeof spanish;
```

Esto da **dos capas de defensa** donde otros proyectos tienen una:

1. Una clave inventada es un **error de compilación**, no un fallo en tiempo de ejecución.
2. `pnpm check:i18n` cubre lo que los tipos no ven: claves presentes en un diccionario y ausentes en
   el otro, claves vacías, claves invocadas que no existen y claves que ya nadie referencia.

## Cómo se usa

```astro
---
import { useTranslations } from '@shared/i18n/translator';
const { t } = useTranslations(locale);
---

<h2>{t('home.surfaces.title')}</h2>
```

Interpolación con marcadores nombrados:

```ts
t('contact.field.counter', { used: 12, total: 2000 });
```

Pluralización con `Intl.PluralRules`, declarando una clave por categoría
(`home.track.moduleCount.one`, `.other`):

```ts
plural('home.track.moduleCount', modules.length);
```

Números y fechas siempre con `formatNumber` o `Intl`, nunca a mano.

## Claves dinámicas

Una clave construida con plantilla es legítima cuando el catálogo que la alimenta es literal:

```astro
{CONTACT_REASONS.map((reason) => (
  <span>{t(`contact.reason.${reason}.title`)}</span>
))}
```

Para que TypeScript acepte el literal, el catálogo debe estar declarado `as const` (mira
`LEARNING_MODULES` en `entities/learning-module/model/curriculum.ts`). Si el catálogo expone
`string`, el tipo se pierde y el compilador rechaza la llamada: la solución es hacer literal el
catálogo, **no** castear la clave.

Cuando la clave viaja como constante (`labelKey`), tipa el campo como `TranslationKey`.

## Texto con marcado

Algunas cadenas llevan `<code>`. No las metas con `set:html` a pelo: usa el componente
`RichText`, que interpreta únicamente `<code>`, `<strong>` y `<em>` y escapa todo lo demás. Tiene su
propio test con una carga de inyección.

## Rutas

`/` es español y `/en/` es inglés. Cada archivo de `src/pages/` es un envoltorio que pasa el
`locale`. **Toda ruta debe existir en los dos idiomas**: `check:routes` falla en cuanto una falta.

La duplicación de seis envoltorios triviales es deliberada: una ruta `[...locale]` genérica los
ahorraría a cambio de oscurecer la generación estática y el `hreflang`.

## El conmutador de idioma

Dos opciones explícitas, español e inglés, con la elección persistida. **No hay redirección
automática.** Cuando el idioma del navegador es el otro y no hay preferencia guardada, aparece un
aviso de una línea, discreto y descartable. Es una desviación consciente del documento de
lineamientos original, que pedía una opción «Sistema»: implementarla exigiría redirigir en cliente
tras el primer pintado, con salto visible y confusión para los rastreadores.

## Al borrar un texto

Borra la clave de **los dos** diccionarios. Si la dejas, `check:i18n` la marcará como no referenciada
y CI fallará. Es intencionado: un diccionario con claves muertas miente sobre lo que el sitio dice.
