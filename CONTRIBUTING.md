# Guía de Contribución ⚽

---

## 🌿 Flujo de Trabajo

Para asegurar un desarrollo ordenado, seguimos estas reglas:

1. **NO trabajar directamente en `main`**: Todas las modificaciones deben realizarse en ramas independientes.
2. **Sincronización**: Antes de empezar, asegúrate de tener la última versión de `main`.
3. **Commits Semánticos**: Usa [Conventional Commits](https://www.conventionalcommits.org/).
4. **Pull Requests**: Abre un PR hacia `main` cuando tu cambio esté listo.

---

## 🌱 Convención de Ramas

Las ramas deben seguir el formato `<tipo>/<descripcion-corta>`:

| Tipo        | Descripción                                      |
| :---------- | :----------------------------------------------- |
| `feature/`  | Nuevas funcionalidades                           |
| `fix/`      | Corrección de errores                            |
| `refactor/` | Reestructuración de código sin cambios de lógica |
| `chore/`    | Tareas de mantenimiento o configuración          |
| `docs/`     | Cambios en la documentación                      |
| `test/`     | Adición o modificación de pruebas                |

**Ejemplos:**

- `feature/login-page`
- `fix/button-alignment`
- `docs/update-readme`

---

## 📝 Convención de Commits

Usamos **Conventional Commits** para mantener un historial de cambios legible y facilitar la automatización de versiones.

**Formato:** `<tipo>(<alcance>): <descripcion>`

**Tipos permitidos:**

- `feat`: Nueva funcionalidad.
- `fix`: Corrección de un error.
- `refactor`: Cambio de código que no corrige un error ni añade funcionalidad.
- `docs`: Solo cambios en la documentación.
- `style`: Cambios que no afectan el significado del código (espaciado, formato, etc).
- `test`: Añadir o corregir pruebas.
- `chore`: Cambios en el proceso de construcción o herramientas auxiliares.

**Ejemplo:** `feat(auth): add password visibility toggle`

---

## ⚙️ Configuración del Entorno local

1. **Instalar dependencias**: `npm install`
2. **Variables de entorno**: Si existen, copia `.env.example` a `.env` y configura los valores (actualmente solo se requiere conexión al API).
3. **Ejecutar en desarrollo**: `npm run dev`

---

## ✅ Checklist antes de enviar un PR

Antes de abrir un Pull Request, asegúrate de cumplir con lo siguiente:

- [ ] El código compila correctamente (`npm run build`).
- [ ] Has ejecutado el linter y no hay errores (`npm run lint`).
- [ ] No hay `console.log` innecesarios o código comentado.
- [ ] Tu rama está actualizada con `main`.
- [ ] El commit sigue la convención establecida.

---

¡Tu ayuda es fundamental para hacer de este proyecto algo increíble! 🚀
