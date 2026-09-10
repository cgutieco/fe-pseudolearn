---
name: design-system
description: Tokens de diseño y convenciones de UI de fe-pseudolearn. Úsala antes de escribir cualquier bloque style de un componente, al crear algo en src/shared/ui, al elegir un color, un tamaño, un espaciado o un radio, y al nombrar una clase CSS. Cubre BEM estricto, el prefijo pl- del vocabulario global, la trampa del scope de Astro con componentes hijos, y los contrastes verificados.
---

# Sistema de diseño de `fe-pseudolearn`

Astro renderizado en servidor, **cero JavaScript de cliente por defecto**. Construye con componentes
`.astro` y CSS. No metas un framework de cliente ni una directiva `client:*`.

Las cuatro únicas excepciones de JavaScript, todas `<script>` planos y dentro del presupuesto de
`architecture.yaml`: aplicación del tema antes del primer pintado, conmutador de tema, conmutador de
idioma, y el formulario de contacto. No las tomes como precedente para añadir más.

## Nombres de clase: BEM estricto

`block__element--modifier`. Element y modifier son opcionales; sus separadores no. Palabras
compuestas dentro de un segmento con un solo guion medio.

```
product-preview__frame          ✔
download-card__title            ✔
trace-demo__cell--changed       ✔
productPreview__frame           ✘  camelCase
product-preview__frame__inner   ✘  dos niveles de elemento
```

Lo verifica Stylelint con `selector-class-pattern`.

## El prefijo `pl-` significa algo

- **Con prefijo**: vocabulario público, declarado **una sola vez** en `src/shared/styles/`.
  `pl-container`, `pl-section-title`, `pl-btn`, `pl-card`, `pl-form-control`, `pl-branch`…
- **Sin prefijo**: clase de un `<style>` de componente, que no sale de ese archivo.

Un componente **no puede declarar** una clase `pl-`, y una hoja global **no puede declarar** una sin
prefijo. Lo verifica [scripts/check-css-scope.mjs](../../../scripts/check-css-scope.mjs).

## La trampa del scope de Astro

Los estilos con scope de un componente **no alcanzan a los elementos que renderiza un componente
hijo**, aunque le pases la clase como prop. Esto no funciona:

```astro
<Icon class="sidebar__icon" />
<style>
  .sidebar__icon {
    color: var(--pl-brand);
  } /* nunca se aplica */
</style>
```

La forma correcta, y la única en que `:global()` es admisible: dar estilo a algo ya expuesto,
acotado por un ancestro propio.

```astro
<style>
  .sidebar :global(.sidebar__icon) {
    color: var(--pl-brand);
  }
</style>
```

Lo mismo vale para las primitivas globales que quieras ajustar en un contexto:
`.contact-details :global(.pl-form-field) { flex: 1; }`.

## Tokens

Todos en [src/shared/styles/tokens.css](../../../src/shared/styles/tokens.css), todos con prefijo
`--pl-`. **Ningún color literal fuera de ese archivo**: lo verifica Stylelint.

- Superficies: `--pl-canvas`, `--pl-surface`, `--pl-raised`, `--pl-sunken`.
- Texto: `--pl-ink`, `--pl-ink-2`, `--pl-ink-3`.
- Marca: `--pl-brand`, `--pl-brand-deep`, `--pl-brand-tint`, `--pl-brand-faint`.
- Sobre fondo teal: `--pl-field`, `--pl-field-deep`, `--pl-on-field*`, `--pl-on-field-ink`.
- Espaciado: `--pl-space-2xs` … `--pl-space-4xl`. Radios: `--pl-radius-control`, `--pl-radius-card`,
  `--pl-radius-pill`, `--pl-radius-sm`, `--pl-radius-tag`.

**Nunca uses un token de espaciado para una tipografía.** `font-size: var(--pl-space-md)` acierta el
píxel y miente sobre la intención; si un tamaño no tiene token, escribe el valor.

## Los dos temas

El tema claro define los valores. El oscuro los **remapea**, no los redefine: los valores en crudo
del tema oscuro viven una sola vez como `--pl-dark-*` y los dos selectores que activan el tema
(`@media (prefers-color-scheme: dark)` y `[data-theme='dark']`) solo reasignan. Si añades un color,
añade su pareja `--pl-dark-*` y remapéala en los dos bloques.

## Contraste verificado, no prometido

[src/shared/styles/contrast.test.ts](../../../src/shared/styles/contrast.test.ts) lee `tokens.css` y
comprueba cada pareja texto/superficie contra WCAG AA (4.5:1). Si añades un color de texto o una
superficie, añádelos a las listas del test. La suite de accesibilidad vuelve a comprobarlo sobre el
render real con axe, en las seis rutas y en los dos temas, exigiendo cero violaciones _serious_ o
_critical_.

## Elevación

En claro, con sombra (`--pl-shadow-1..3`). En oscuro las sombras se anulan y la elevación la da la
**luminancia de la superficie**: `--pl-canvas` → `--pl-surface` → `--pl-raised`. No añadas sombras
difusas ni resplandores.

## La imagen del hero es el elemento LCP

`ProductPreview` es el elemento LCP en escritorio **y** en móvil. Por eso lleva `fetchpriority="high"`
y `decoding="sync"`, **nunca `loading="lazy"`**, y `ProductPreviewPreload` emite un
`<link rel="preload">` por combinación de punto de ruptura y esquema de color en el `<head>`, a
través del slot `head` del layout. El `prefers-color-scheme` va dentro de `<source media>` porque es
la única forma de que el escáner de precarga elija la variante correcta sin esperar a JavaScript.

Coste asumido: quien fuerce manualmente un tema contrario al de su sistema paga una segunda descarga.

## Iconos

Inline, nunca una librería de cliente ni una fuente de iconos. Añade el trazado a
[icon-registry.ts](../../../src/shared/ui/icon/icon-registry.ts) y úsalo con `<Icon name="…" />`.
Nada de emojis como iconos de interfaz.

## Líneas rojas heredadas del pliego original

Sin degradados azules, índigo o violeta. Sin manchas de fondo ni mallas de degradado. Sin
vidriomorfo. Sin ilustración isométrica ni fotografía de archivo: solo capturas reales del producto.
Sin bordes de neón ni destellos. Sin popups de intención de salida, banners flotantes ni cuentas
regresivas. Sin testimonios ficticios ni logos inventados. Sin copys de marketing huecos.
