# ⚽ Vocalia Client

Frontend para el **sistema de gestión de torneos de fútbol**, diseñado para facilitar la administración de torneos, equipos, jugadores y el seguimiento en tiempo real de partidos y vocalías.

Este proyecto es la interfaz de usuario que interactúa con el [Vocalia API](https://github.com/KevinChiguano/vocalia-api) y forma parte de un **proyecto de tesis** y portafolio personal.

---

## 🧩 Tecnologías utilizadas

- **React 19**
- **Vite** (Build tool)
- **TypeScript**
- **Tailwind CSS 4** (Estilizado)
- **TanStack Query (React Query)** (Gestión de estado asíncrono)
- **Zustand** (Estado global)
- **React Router Dom** (Enrutamiento)
- **React Hook Form + Zod** (Formularios y validación)
- **Axios** (Peticiones HTTP)
- **Lucide React** (Iconografía)

---

## 🏗️ Arquitectura y Estructura

El proyecto está organizado por carpetas que separan las responsabilidades técnicas y los módulos de negocio:

```txt
src/
├─ api/         # Configuración de Axios y servicios de comunicación con el backend
├─ components/  # Componentes reutilizables de UI y layouts genéricos
├─ features/    # Módulos de negocio (Administración, Torneos, Equipos, Carnetización, etc.)
├─ hooks/       # Hooks personalizados para lógica compartida
├─ layouts/     # Definición de estructuras de página (AuthLayout, AppLayout)
├─ routes/      # Configuración de rutas protegidas y públicas
├─ store/       # Estado global de la aplicación (Auth, UI, Theme) con Zustand
├─ types/       # Definiciones de interfaces y tipos de TypeScript
└─ utils/       # Funciones de utilidad y helpers
```

---

## ⚙️ Requisitos previos

- Node.js **20 o superior**
- [Vocalia API](https://github.com/KevinChiguano/vocalia-api) en ejecución (opcional para desarrollo, necesario para funcionalidad completa)

---

## 🚀 Instalación y ejecución

### 1️⃣ Clonar el repositorio e instalar dependencias

```bash
npm install
```

### 2️⃣ Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example` (si existe) o añade la URL de tu API:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3️⃣ Ejecutar en desarrollo

```bash
npm run dev
```

### 4️⃣ Construir para producción

```bash
npm run build
```
