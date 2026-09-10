<div align="center">

# PseudoLearn — sitio web

**Programar se entiende cuando se ve.**
Sitio oficial de [PseudoLearn](https://pseudolearn.app): landing, contacto y soporte, e historial de versiones.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.12.0-339933?logo=node.js&logoColor=white)](.nvmrc)
![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright&logoColor=white)

</div>

---

## 1. Qué es y qué no es

### Propósito

Frontend público de **PseudoLearn**, un entorno para aprender a programar en pseudocódigo con
ejecución paso a paso y diagramas trazados por el propio motor del lenguaje. Este repositorio
contiene la landing comercial, la pantalla de contacto y soporte, y el historial de versiones publicadas.

La aplicación nativa y el núcleo del lenguaje son de código cerrado. **Este sitio no lo es**, y por
eso se sostiene con un estándar de verificación más alto que el del resto del monorepo.

### Responsabilidades primarias

- Servir la landing (`/`), el contacto (`/contact`), las versiones (`/versions`), la privacidad (`/privacy`) y los
  términos (`/terms`), en español e inglés, con redirecciones de compatibilidad
  desde `/contacto`, `/versiones`, `/privacidad`, `/terminos` y `/legal`.
- Publicar qué versión de la app hay disponible, sus novedades y el registro de cambios detallado (changelog).
- Recibir y entregar los mensajes del formulario de contacto, con verificación anti-bot.
- Cumplir WCAG 2.1 AA, verificado automáticamente en las diez rutas y en los dos temas.
- Sostener el presupuesto de rendimiento: cero JavaScript de cliente salvo cuatro excepciones
  declaradas y medidas.

### Fuera de alcance a propósito (`SCOPE-YAGNI`)

- **Sin ejecución del lenguaje en el navegador.** El motor y el editor viven en la app nativa.
- **Sin adjuntos en el formulario.** Se sustituyen por un campo donde se pega el programa: cubre el
  caso real sin multipart, sin límites de tamaño, sin superficie de malware y sin almacenamiento.
- **Sin frameworks SPA** ni librerías de componentes. Todo el estilo sale de tokens propios.
- **Sin `astro:i18n`.** El porqué está en la decisión 2.
- **Sin apoyo económico ni pasarela de pago.** La app se distribuye en las tiendas de Apple, y una
  web enlazada desde su ficha que cobre por fuera es motivo de observación en revisión. Si algún día
  hay una forma de apoyar el proyecto, vivirá dentro de la app y por el canal de la tienda, no aquí.
  Por eso la pestaña que ocupaba ese sitio ahora publica las versiones.

---

## 2. Guía operativa

### Requisitos

- Node.js `>= 22.12.0` (ver [.nvmrc](.nvmrc))
- pnpm
- Cuenta de Cloudflare con Wrangler configurado, solo para desplegar

### Puesta en marcha

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Coloca además las dos fuentes `woff2` en `public/fonts/` (ver [public/fonts/README.md](public/fonts/README.md)).
Sin ellas el sitio funciona, pero cae a la familia de respaldo.

### Comandos

| Comando                                   | Qué hace                                       |
| ----------------------------------------- | ---------------------------------------------- |
| `pnpm dev`                                | Servidor de desarrollo                         |
| `pnpm build`                              | Build de producción                            |
| `pnpm preview`                            | Sirve el build sobre el runtime de Workers     |
| `pnpm deploy`                             | Compila y despliega en Cloudflare Workers      |
| `pnpm test`                               | Unidad y componentes (Vitest)                  |
| `pnpm test:e2e`                           | Extremo a extremo (Playwright sobre el build)  |
| `pnpm test:a11y`                          | Accesibilidad (axe-core)                       |
| `pnpm test:visual`                        | Regresión visual                               |
| `pnpm lint` / `lint:css` / `format:check` | ESLint, Stylelint, Prettier                    |
| `pnpm check:types`                        | `astro check`                                  |
| `pnpm check:static`                       | Los siete verificadores propios                |
| `pnpm check:budget`                       | Presupuesto de JavaScript y CSS sobre el build |
| `pnpm check:all`                          | Todo lo anterior, en orden                     |

### Secretos

`PUBLIC_TURNSTILE_SITE_KEY` es público. Los demás son secretos de servidor y en producción se cargan
como _secrets_ de Wrangler, nunca como variables en texto plano:

```bash
wrangler secret put TURNSTILE_SECRET_KEY
wrangler secret put OCI_SMTP_USERNAME
wrangler secret put OCI_SMTP_PASSWORD
```

`OCI_SMTP_HOST`, `OCI_SMTP_PORT`, `CONTACT_FROM_ADDRESS`, `CONTACT_TO_ADDRESS` y
`PUBLIC_TURNSTILE_SITE_KEY` no son secretos: están declarados como `vars` en
[wrangler.jsonc](wrangler.jsonc) y se suben con el propio deploy.

### Despliegue

```bash
pnpm deploy
```

Publica en <https://pseudolearn.app>. Verifica ahí después de cada deploy, en particular
`/contact` (usa el SMTP de OCI Email Delivery y el widget de Turnstile — ambos atados a ese
hostname, no funcionan desde `*.workers.dev`).

### Líneas base visuales

Las capturas de referencia dependen del sistema operativo. Las de `-darwin` sirven en local; para
sembrar las de CI hay que generarlas una vez dentro del contenedor de Playwright:

```bash
docker run --rm -v "$PWD":/w -w /w mcr.microsoft.com/playwright:v1.63.0-noble pnpm test:visual --update-snapshots
```

---

## 3. Arquitectura

Astro 7 híbrido sobre Cloudflare Workers: todas las páginas prerenderizadas, y una sola ruta bajo
demanda (`src/pages/api/contact.ts`, con `prerender = false`) para el formulario.

`src/` sigue Feature-Sliced Design, de más a menos específica:

```
app > views > widgets > features > entities > shared
```

```text
src/
├── app/        Layout base y SEO de sitio (canonical, Open Graph, hreflang, JSON-LD)
├── views/      Composición completa de cada ruta, y el manejador del formulario
├── widgets/    Bloques compuestos: cabecera, pie, hero, superficies, ruta, descargas…
├── features/   Interacción: conmutador de tema, conmutador de idioma, formulario
├── entities/   contact-request, learning-module, platform, release
├── shared/     i18n, estilos, ui, lib, config, dobles de prueba
├── pages/      Rutas de Astro: envoltorios de 14 líneas o menos
└── assets/     Capturas del producto
```

Las reglas de capas, los imports permitidos, los imports exclusivos y los límites de tamaño están
declarados en [architecture.yaml](architecture.yaml) y los **leen** los verificadores. No hay una
segunda copia de las reglas dentro de los scripts.

---

## 4. Decisiones de diseño

### Decisión 1: `architecture.yaml` como fuente única de las reglas

- **Problema.** Cuando las reglas de arquitectura viven dentro del script que las comprueba, la
  documentación las repite y las dos copias divergen en cuanto alguien cambia una.
- **Elección.** Declararlas en `architecture.yaml` y hacer que los siete verificadores lo lean. Es
  además la convención que ya usan los paquetes del monorepo.
- **Descartado.** _Reglas incrustadas en el script_, como en el proyecto que sirvió de referencia:
  más simple de escribir una vez, imposible de mantener sincronizado con el README.

### Decisión 2: i18n propia con claves tipadas, no `astro:i18n`

- **Problema.** El requisito es que ninguna palabra viva en el código. Un diccionario en tiempo de
  ejecución detecta el error tarde, y solo si alguien ejecuta el script.
- **Elección.** Derivar el tipo `TranslationKey` del diccionario español. Una clave inventada es un **error de
  compilación**. `check:i18n` cubre aparte lo que los tipos no ven: paridad, claves
  vacías, claves invocadas inexistentes y claves que ya nadie referencia.
- **Descartado.** _`astro:i18n`_: no aporta tipado de claves, y su enrutado no cubre la persistencia
  de la elección ni el aviso condicional de idioma.

### Decisión 3: el prefijo `pl-` distingue vocabulario público de estilo local

- **Problema.** En un sitio con estilos con scope, no se ve de un vistazo si una clase se reutiliza
  o si muere en su archivo.
- **Elección.** Las clases del vocabulario público, declaradas en `shared/styles/`, llevan `pl-`.
  Las de un componente van sin prefijo. `check:css-scope` impide cruzar la frontera en cualquiera de
  los dos sentidos.
- **Descartado.** _Prefijar todo_: el prefijo dejaría de informar y sería ruido.

### Decisión 4: sin adjuntos en el formulario, con el programa pegado

- **Problema.** Los adjuntos exigen multipart, límites de tamaño, superficie de malware y
  almacenamiento, para un caso que casi siempre es «pego mi programa».
- **Elección.** Un `textarea` monoespaciado de hasta 4000 caracteres.
- **Descartado.** _Subida a R2_: coste e infraestructura desproporcionados para la primera versión.

### Decisión 5: dos idiomas explícitos y ninguna redirección automática

- **Problema.** El pliego original pedía una opción «Sistema» en el selector de idioma. Con rutas
  prefijadas y estáticas, eso solo se implementa redirigiendo en cliente tras el primer pintado.
- **Elección.** Dos opciones explícitas con la elección persistida en un conmutador segmentado (análogo al selector de
  tema y sin flecha de desplegable), más un aviso de una línea,
  discreto y descartable, cuando el navegador habla el otro idioma y no hay preferencia guardada.
- **Descartado.** _Redirección automática_: salto visible, y rastreadores confundidos sobre cuál es
  la versión canónica. Es una desviación consciente de la letra del pliego.

### Decisión 6: la imagen del hero se trata como el elemento LCP que es

- **Problema.** La vista previa del producto se solapa con el hero mediante un margen negativo, y
  resulta visible en el primer pliegue en escritorio **y** en móvil. Llevaba `loading="lazy"`, que la
  excluye del escáner de precarga. Además, el producto debe reflejar el idioma de la página activa (español o inglés) y
  no solo el esquema de color.
- **Elección.** `fetchpriority="high"`, `decoding="sync"`, y un `<link rel="preload">` por
  combinación de punto de ruptura y esquema de color para el idioma de la ruta activa (`es` o `en`),
  emitido en el `<head>` por el slot `head` del layout vía `ProductPreviewPreload`. Las capturas
  residen organizadas por idioma en `src/assets/product/{es,en}/` y se resuelven tipadas mediante
  `previewSources(locale)`. El `prefers-color-scheme` se mantiene dentro de `<source media>` porque es
  lo único que el escáner de precarga entiende sin esperar a JavaScript, sincronizándose además en cliente
  ante conmutaciones dinámicas de tema.
- **Coste asumido.** Quien fuerce manualmente un tema contrario al de su sistema paga una segunda
  descarga de imagen. Es minoría, no afecta a la medición, y la alternativa era duplicar el
  `<picture>` o renderizar la página entera en servidor.

### Decisión 7: la tipografía conserva sus saltos por media query

- **Problema.** Migrar la escala tipográfica a `clamp()` es la práctica moderna, pero cambia todos
  los tamaños intermedios entre 375 px y 900 px.
- **Elección.** Conservar la escala actual con sus media queries. La instrucción era preservar la
  maquetación, y la regresión visual lo demuestra.
- **Descartado.** _Tipografía fluida_: mejor en abstracto, pero habría hecho imposible probar que la
  reestructuración no cambió nada.

### Decisión 8: inversión de dependencias solo donde hay I/O externa

Dos puertos, `BotChallengeGateway` y `MailGateway`, cada uno con su adaptador y su doble. **No** se
invierten i18n, configuración ni catálogos: no hay dependencia externa que invertir, y una interfaz
sin segunda implementación es coste sin beneficio.

---

### Decisión 9: el catálogo de publicaciones es una entidad centrada en la aplicación y su registro de cambios

- **Problema.** El mismo número de versión lo necesitan dos widgets —la tarjeta de lo publicado y la
  entrada del historial— y la página entera existe para prometer que ese número no se contradice
  consigo mismo. Escribirlo dos veces es exactamente el fallo que la página dice no cometer.
- **Elección.** `entities/release/model/release-catalog.ts`, con `RELEASES` declarado `as const` de
  la publicación más reciente a la más antigua. Cada entrada lleva `id`, `version` y
  la lista de `highlights`; el texto vive en el diccionario bajo `versions.release.<id>.*`, igual que
  los módulos de la ruta de aprendizaje. La web presenta exclusivamente la versión de la aplicación y
  su changelog de cara al usuario, sin exponer ni sobreexplicar el versionado técnico interno del motor.
  El `as const` no es decoración: es lo que convierte
  `versions.release.${release.id}.${highlight}Text` en una clave tipada en vez de un `string`.
  Se gana la condición de entidad por la segunda razón que admite `fsd-architecture`: dos
  consumidores independientes del mismo modelo.
- **Descartado.** _Leer la versión de `package.json`_: la del sitio no es la del producto, y una
  errata corregida en la web no publica una versión de la app.
- **Descartado.** _Un campo `channel`_: hoy tendría un solo valor, y una enumeración de un caso es
  ceremonia (`SCOPE-YAGNI`). La etiqueta sale de una clave fija; el campo se añade el día que exista
  un segundo canal.
- **Coste asumido.** La fecha es el marcador `[FECHA]` hasta que 1.0.0 se publique. Cuando exista,
  entra en el modelo como fecha ISO y se formatea con `Intl`, nunca a mano.

---

### Decisión 10: el umbral responsivo de navegación es local al encabezado (1100px) con densidad adaptativa

- **Problema.** La cabecera reúne marca, cinco enlaces, dos selectores segmentados y un botón de
  acción (~1200 px en escritorio completo). Al compartir el umbral global de 900 px, la cabecera
  intentaba embutirse en los 812 px útiles del contenedor, provocando saltos de línea antiestéticos
  en los enlaces, falta de espacio respecto al logo y el desborde del botón CTA. Además, a 1100 px el
  padding normativo de `.pl-container` salta a 96 px por lado (dejando 908 px útiles), impidiendo
  desplegar la versión expandida sin adaptaciones.
- **Elección.** Mantener el menú móvil colapsado (`MobileMenu`) hasta `< 1100px` desacoplándolo de
  las clases globales `.pl-only-wide`. Desplegar la navegación a partir de 1100 px incorporando
  separación generosa a la izquierda del menú (`margin-left`), prohibición de quiebre de texto (`white-space: nowrap`),
  y controles de densidad adaptativa: selectores compactos de idioma (`ES`/`EN`) y tema (iconos) entre 1100 px y 1279
  px, pasando al estado expandido completo a partir
  de 1280 px.
- **Descartado.** _Mover el breakpoint global `.pl-only-wide` a 1100 px_: habría alterado secciones
  de contenido (`BrandTrack`, `ProductPreview`, `PlatformAvailability`) cuya composición a 900 px
  es adecuada y no adolece de congestión horizontal.
- **Descartado.** _Modificar el padding normativo de `.pl-container`_: habría roto la alineación
  reticular de la marca y la acción con el hero y los títulos de la página.

---

### Decisión 11: desplegables de selección progresivamente mejorados con menú flotante de marca

- **Problema.** Los controles `<select>` nativos del navegador abren un menú emergente dependiente
  del sistema operativo que rompe la identidad visual y no aplica los tokens de diseño (colores,
  bordes, tipografía y tema claro/oscuro) de PseudoLearn.
- **Elección.** Renderizado progresivo en `SelectField.astro`: el `<select>` nativo se emite siempre
  en el HTML para accesibilidad y envío de formularios estándar; en SSR se genera además la estructura
  accesible del activador (`button[aria-haspopup="listbox"]`) y la lista flotante de opciones (`div[role="listbox"]`).
  Al montar el cliente en `contact-form-client.ts`, `attachCustomSelects`
  activa la clase `.pl-select--enhanced`, oculta el select nativo de forma accesible e intercepta la
  interacción sincronizando el valor seleccionado con el control nativo, con soporte íntegro de teclado (`ArrowDown`,
  `ArrowUp`, `Enter`, `Space`, `Escape`), cierre en clic exterior y compatibilidad con
  agrupaciones (`optgroup` / `role="group"`).
- **Descartado.** _Librerías externas de select o menús headless_: habrían desbordado el presupuesto
  estricto de JavaScript de cliente (`FE-JS-BUDGET`).
- **Descartado.** _Eliminar el `<select>` nativo_: habría roto la resiliencia sin JavaScript y la
  validación de formularios del navegador.

---

### Decisión 12: Las páginas legales se estructuran en dos columnas y sus enlaces residen únicamente en el pie de página

- **Problema.** Añadir enlaces de «Privacidad» y «Términos» a la cabecera rompería el umbral responsivo
  adaptativo de 1100 px (Decisión 10) saturando el espacio disponible en escritorio. Por otro lado, volcar
  el contenido de los borradores Markdown en bruto generaría muros de texto difíciles de escanear,
  acoplamiento a plugins de parseo y rotura de la política de tipado estricto de i18n (`FE-I18N-PARITY`).
- **Elección.** Mantener la cabecera intacta y enlazar las páginas legales exclusivamente desde la columna
  «Proyecto» del pie de página (`SiteFooter`). El contenido se modela como entidades tipadas en
  `src/entities/legal/` consumiendo diccionarios estructurados en `src/shared/i18n/`, renderizados en una
  retícula responsiva (`LegalLayout`) de dos columnas en escritorio: barra lateral interactiva (`LegalSidebar`) con
  índice de anclajes, compromisos clave y enlace de soporte, junto a una columna de
  lectura con tarjetas de casos y cajas de compromiso destacadas (`LegalCallout`), con cero JavaScript
  adicional.
- **Descartado.** _Enlaces en el header_: habría saturado la barra de navegación obligando a subir el
  breakpoint a anchos excesivos.
- **Descartado.** _Renderizado directo de Markdown en SSR/cliente_: habría introducido dependencias pesadas
  violando el presupuesto de scripts y eludiendo las comprobaciones de paridad de traducción.

---

## 5. Reglas de código

Están en [AGENTS.md](AGENTS.md) con identificador estable y verificador asociado. Las tres que más
condicionan el día a día:

- **Cero comentarios** en `src/`, `scripts/` y `tests/`. El _qué_ lo dicen los nombres; el _porqué_
  vive en este README y en las skills. Quitar un comentario sin escribir el README es pérdida de
  información, no limpieza.
- **BEM estricto** `block__element--modifier`, con `pl-` solo en el vocabulario público.
- **Código en inglés**, textos de la interfaz en los diccionarios, documentación en español.

---

## 6. Decisiones de producto que condicionan el código

- **El contacto lo lee una persona.** No hay clasificadores automáticos ni respuestas enlatadas. El
  endpoint nunca devuelve texto localizado: solo códigos que el cliente traduce con el diccionario
  del idioma activo, para que el servidor no tenga que elegir idioma por nadie.
- **La preferencia de tema se respeta y se recuerda**, y se aplica antes del primer pintado para que
  no haya parpadeo ni salto de contenido.
- **La web presenta la versión de la aplicación y su registro de cambios.** Al usuario final de la landing
  le interesa la app: qué versión instala desde la tienda, qué novedades trae y el changelog de cada
  actualización. El versionado interno del motor del lenguaje y sus contratos técnicos pertenecen al desarrollo del
  núcleo y la app, no a la superficie pública de la web comercial.
- **Nada de métricas de terceros.** No hay analítica, ni píxeles, ni fuentes remotas: las fuentes se
  autohospedan, lo que además evita transferir la IP de cada visitante a un tercero.

---

## 7. Verificación

Pirámide de cinco niveles, toda en CI:

| Nivel             | Herramienta               | Alcance                                                                      |
| ----------------- | ------------------------- | ---------------------------------------------------------------------------- |
| Unidad            | Vitest, co-localizado     | traductor, validación, protocolo SMTP, contraste de tokens, cada verificador |
| Componente        | Astro Container API       | render de widgets y del formulario, en los dos idiomas                       |
| Extremo a extremo | Playwright sobre el build | rutas, redirecciones, tema, idioma, formulario                               |
| Accesibilidad     | `@axe-core/playwright`    | 10 rutas × 2 temas, cero violaciones _serious_ o _critical_                  |
| Regresión visual  | Playwright screenshots    | 3 páginas × 2 anchos                                                         |

Y siete verificadores propios: arquitectura, i18n, texto incrustado, paridad de rutas, comentarios,
ámbito del CSS y tamaño. **Cada uno tiene un fixture con una violación deliberada** en
`scripts/__fixtures__/`, y un test que exige que ese fixture lo haga fallar: un verificador que nunca
falla no verifica nada.

Los verificadores mecánicos comprueban lo que un humano no debería tener que revisar. La revisión
humana queda para lo que ninguna regla puede juzgar.

---

## 8. Fuentes consultadas

- **Catálogo pedagógico**: los 15 módulos y los 11 documentos de especificación provienen del
  manifiesto de conocimiento de la app nativa.
- **Identidad visual**: los tonos de marca y la tipografía anclan en los fundamentos visuales de la
  app, adaptados para lectura editorial en web. La web no calca ese documento: la app es una
  herramienta de trabajo y esto es una portada.
- **Estructura FSD**: se tomó la separación en capas y la disciplina de envoltorios finos de un
  proyecto hermano. Se **rechazó** su patrón de reglas incrustadas en el script de verificación, a
  favor de `architecture.yaml` como fuente única.

## Licencia

Código bajo [MIT](LICENSE). Los activos de marca y las capturas del producto están bajo
[reserva expresa de derechos](LICENSE-BRAND): el repositorio es abierto, la identidad del producto no
se cede.
