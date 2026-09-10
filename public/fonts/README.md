# Fuentes autohospedadas

Coloca aquí los dos archivos `woff2` con el subconjunto latino:

- `ibm-plex-sans-latin.woff2` (variable, pesos 400–700)
- `ibm-plex-mono-latin.woff2` (variable, pesos 400–600)

Los nombres los declara `src/shared/styles/fonts.css` y los precarga
`src/app/layouts/BaseLayout.astro`. Mientras falten, el navegador cae a
`IBM Plex Sans Fallback`, cuyas métricas están ajustadas para no producir CLS.
