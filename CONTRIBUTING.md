# Contribuir

Gracias por el interés. Este repositorio es la web de un producto de código cerrado, así que el
alcance de lo que se acepta es acotado, pero las contribuciones son bienvenidas.

## Qué se acepta

- Correcciones de errores, de accesibilidad, de rendimiento y de SEO.
- Mejoras de traducción en cualquiera de los dos idiomas.
- Mejoras de las herramientas de verificación.

## Qué no se acepta

- Cambios de identidad visual o de copy de producto sin acuerdo previo en una issue.
- Dependencias nuevas sin justificación explícita: el sitio no usa frameworks de cliente ni
  librerías de componentes, y eso es una decisión, no una carencia.
- Analítica, píxeles de seguimiento o recursos de terceros.

## Antes de abrir un pull request

```bash
pnpm check:all
```

Debe pasar entero. Incluye formato, lint, tipos, los siete verificadores propios, la suite unitaria,
el build y el presupuesto. Las suites de navegador van aparte:

```bash
pnpm test:e2e && pnpm test:a11y && pnpm test:visual
```

## Reglas que sorprenden si no las conoces

1. **No se escriben comentarios.** El _qué_ lo dicen los nombres; el _porqué_ va al `README.md`. Un
   verificador lo comprueba.
2. **Ninguna palabra visible vive en el código.** Todo texto pasa por `t()` y por los dos
   diccionarios, que deben tener claves idénticas.
3. **Toda ruta existe en los dos idiomas.**
4. **Las clases siguen BEM estricto**, y el prefijo `pl-` está reservado al vocabulario compartido.
5. **Si cambias arquitectura, actualizas el `README.md` en el mismo commit.**

El detalle completo está en [AGENTS.md](AGENTS.md) y en `.agents/skills/`.

## Mensajes de commit

Conventional Commits en inglés. El formato y los ejemplos están en
[.agents/skills/commit-message/SKILL.md](.agents/skills/commit-message/SKILL.md).
