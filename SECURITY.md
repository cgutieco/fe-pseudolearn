# Política de seguridad

## Reportar una vulnerabilidad

Escribe a **support@pseudolearn.com** con el asunto `[security]`. No abras una issue pública.

Incluye, si puedes: qué encontraste, cómo reproducirlo, y qué impacto crees que tiene. Recibirás
acuse en cuanto sea leído, y se te dirá qué se va a hacer y cuándo, aunque la respuesta sea que no
se considera una vulnerabilidad.

## Alcance

Este repositorio cubre el sitio web. Los fallos de la aplicación nativa o del lenguaje se reportan
por el mismo buzón, pero se tratan aparte.

## Lo que ya está previsto

- El endpoint del formulario nunca devuelve texto localizado ni detalles técnicos: solo códigos.
- Los secretos de servidor viven como _secrets_ de Wrangler, jamás en el repositorio ni en variables
  de texto plano.
- El único texto con marcado que se renderiza sin escapar pasa por `RichText`, que admite tres
  etiquetas y escapa el resto. Tiene un test con una carga de inyección.
- Las cabeceras de seguridad, incluida una CSP sin `unsafe-eval`, están en `public/_headers`.
- No hay recursos de terceros salvo el widget anti-bot, que además se carga en diferido y solo
  cuando alguien interactúa con el formulario.
