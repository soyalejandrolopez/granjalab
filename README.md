# GranjaLab - Plataforma de Gestión de Residuos Orgánicos

Plataforma digital que conecta productores de residuos orgánicos (plazas de mercado y restaurantes) con recicladores, gestores y emprendedores para crear un ecosistema circular y sustentable.

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage, Real-time)
- **Deployment:** Netlify
- **UI:** Diseño minimalista, compacto y moderno

## Características del MVP

✅ **Autenticación multi-rol** (Productor, Reciclador, Gestor, Admin)
✅ **Dashboard diferenciado por rol**
✅ **CRUD de residuos orgánicos**
✅ **Sistema de matching entre productores y gestores**
✅ **Gestión de solicitudes de recolección**
✅ **Métricas y estadísticas básicas**
✅ **Row Level Security (RLS) en Supabase**
✅ **Diseño responsive y minimalista**

## Roles de Usuario

### 🌱 Productor
- Registrar residuos orgánicos generados
- Ver solicitudes de recicladores/gestores
- Aceptar o rechazar solicitudes
- Métricas de residuos generados

### ♻️ Reciclador
- Buscar residuos disponibles
- Solicitar residuos a productores
- Gestionar solicitudes
- Métricas de residuos procesados

### 🚜 Gestor
- Mismas funcionalidades que Reciclador
- Enfocado en granjas y compostaje

### 👤 Administrador
- Vista general de toda la plataforma
- Gestión de usuarios
- Métricas globales
- Reportes y estadísticas

## Configuración del Proyecto

### 1. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Supabase

1. Crear una cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. En el panel de Supabase, ir a **SQL Editor**
4. Ejecutar el archivo `supabase/migrations/001_initial_schema.sql`
5. Copiar las credenciales del proyecto

### 3. Variables de Entorno

Copiar el archivo `.env.example` a `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Actualizar las variables en `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu-proyecto-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Ejecutar en Desarrollo

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

\`\`\`
granjalab/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   ├── productor/         # Dashboard de productores
│   │   ├── reciclador/        # Dashboard de recicladores
│   │   ├── gestor/            # Dashboard de gestores
│   │   └── admin/             # Panel de administración
│   ├── components/            # Componentes React
│   │   ├── dashboard/         # Componentes de dashboards
│   │   ├── layout/            # Componentes de layout
│   │   └── ui/                # Componentes UI reutilizables
│   ├── lib/                   # Utilidades
│   │   ├── supabase/         # Cliente de Supabase
│   │   └── utils/            # Funciones auxiliares
│   └── types/                 # Definiciones de TypeScript
├── supabase/                  # Migraciones SQL
└── public/                    # Archivos estáticos
\`\`\`

## Despliegue en Netlify

### Opción 1: Desde la Interfaz Web

1. Subir el código a un repositorio de GitHub
2. Ir a [Netlify](https://netlify.com) e iniciar sesión
3. Click en "Add new site" → "Import an existing project"
4. Seleccionar tu repositorio de GitHub
5. Configurar las variables de entorno:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`NEXT_PUBLIC_APP_URL\` (usar la URL de Netlify)
6. Click en "Deploy"

### Opción 2: CLI de Netlify

\`\`\`bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Inicializar el proyecto
netlify init

# Deploy
netlify deploy --prod
\`\`\`

## Configuración de Supabase en Producción

Después del despliegue:

1. En Supabase, ir a **Authentication** → **URL Configuration**
2. Agregar la URL de producción de Netlify en:
   - Site URL
   - Redirect URLs

## Scripts Disponibles

\`\`\`bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter
\`\`\`

## Base de Datos

### Tablas Principales

- **profiles**: Perfiles de usuarios con roles
- **residuos**: Registro de residuos orgánicos
- **solicitudes**: Solicitudes de recolección
- **transacciones**: Historial de entregas completadas

### Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado para garantizar que:
- Los usuarios solo vean sus propios datos
- Los productores gestionen sus residuos
- Los recicladores/gestores soliciten residuos
- Los administradores tengan acceso completo

## Crear Usuario Administrador

Para crear un usuario administrador, después de registrarte:

1. Ir al panel de Supabase
2. Ir a **Table Editor** → **profiles**
3. Encontrar tu usuario
4. Cambiar el campo \`rol\` a \`admin\`

## Soporte y Contribuciones

Para reportar problemas o solicitar funcionalidades, crear un issue en el repositorio.

## Licencia

© 2025 GranjaLab. Todos los derechos reservados.
