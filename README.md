# Sistema de Gestión de Socios – Club / Gimnasio

Proyecto final del curso de JavaScript. Permite administrar el padrón de socios de un club o gimnasio.

## Funcionalidades

- Cargar los socios iniciales desde un archivo JSON mediante `fetch`.
- Registrar socios y asignar automáticamente la cuota según la categoría.
- Consultar el padrón y filtrar socios por categoría.
- Calcular los ingresos mensuales esperados.
- Aplicar un recargo del 10% una sola vez por socio.
- Dar de baja socios y vaciar el padrón con confirmación visual.
- Guardar los cambios en `localStorage` para conservarlos al volver a abrir la aplicación.

## Estructura

```text
proyecto/
├── index.html
├── assets/
│   └── gimnasio.svg
├── css/
│   └── style.css
├── data/
│   └── socios_iniciales.json
├── js/
│   ├── socio.js
│   └── main.js
└── README.md
```

## Cómo ejecutar

Como el proyecto utiliza `fetch` para leer un JSON local, debe abrirse mediante un servidor local y no directamente con doble clic en `index.html`.

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Iniciar la extensión **Live Server**.
3. Abrir `index.html` con Live Server.

También se puede publicar en GitHub Pages; mantener las rutas relativas de los archivos.

## Librerías externas

- [SweetAlert2](https://sweetalert2.github.io/) para las confirmaciones.
- [Toastify](https://apvarun.github.io/toastify-js/) para las notificaciones.

## Persistencia

La clave `padronSocios` de `localStorage` guarda el padrón y sus modificaciones. Para volver a cargar los datos de ejemplo, se puede borrar esa clave desde las herramientas de desarrollador del navegador.
