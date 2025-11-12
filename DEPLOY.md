# Guía de Despliegue a Producción - GranjaLab

## ✅ Estado Actual
- ✅ Código commiteado en Git
- ✅ Proyecto listo para desplegar

## Paso 1: Subir a GitHub

### Opción A: Crear Repositorio Nuevo en GitHub (Recomendado)

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repositorio: `granjalab`
3. Descripción: "Plataforma de gestión de residuos orgánicos"
4. Visibilidad: **Privado** (recomendado por las credenciales)
5. **NO marques** "Initialize this repository with a README"
6. Click "Create repository"

7. En tu terminal, ejecuta:
```bash
git remote add origin https://github.com/TU_USUARIO/granjalab.git
git branch -M main
git push -u origin main
```

### Opción B: Si ya tienes un repositorio

```bash
git remote add origin https://github.com/TU_USUARIO/tu-repo.git
git push -u origin main
```

## Paso 2: Desplegar en Netlify

### Método 1: Desde la Web (Más Fácil)

1. Ve a [app.netlify.com](https://app.netlify.com)
2. Click en **"Add new site"** → **"Import an existing project"**
3. Selecciona **GitHub**
4. Autoriza Netlify a acceder a tu repositorio
5. Selecciona el repositorio `granjalab`
6. Configuración del build:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - Netlify detectará automáticamente Next.js

7. **Configurar Variables de Entorno:**
   Antes de hacer deploy, click en **"Show advanced"** → **"New variable"**

   Agrega estas 3 variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://zayxuwfnuqhnlzpwtezj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpheXh1d2ZudXFobmx6cHd0ZXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTgyMTMsImV4cCI6MjA3ODUzNDIxM30.KQ4rhFkB0yo7fjNJZWle9LQ6iUbNdHpL94L2w3woeec
   NEXT_PUBLIC_APP_URL = https://TU-SITIO.netlify.app
   ```

   **Nota:** Actualiza `NEXT_PUBLIC_APP_URL` después del deploy con tu URL real

8. Click **"Deploy site"**

9. Espera 2-3 minutos mientras Netlify construye tu aplicación

10. Una vez completado, obtendrás una URL como: `https://wonderful-app-123456.netlify.app`

### Método 2: Desde la CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Inicializar el proyecto
netlify init

# Deploy a producción
netlify deploy --prod
```

## Paso 3: Configurar Supabase para Producción

1. Ve a tu proyecto de Supabase: https://zayxuwfnuqhnlzpwtezj.supabase.co
2. Ve a **Authentication** → **URL Configuration**
3. Agrega tu URL de Netlify:
   - **Site URL:** `https://tu-app.netlify.app`
   - **Redirect URLs:** Agrega estas URLs:
     ```
     https://tu-app.netlify.app/**
     https://tu-app.netlify.app/login
     https://tu-app.netlify.app/register
     ```

## Paso 4: Actualizar Variable de Entorno en Netlify

1. En Netlify, ve a tu sitio
2. **Site settings** → **Environment variables**
3. Edita `NEXT_PUBLIC_APP_URL` con tu URL real de Netlify
4. **Save**
5. Ve a **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## Paso 5: Probar la Aplicación

1. Visita tu URL de Netlify
2. Intenta registrarte
3. Verifica que puedas iniciar sesión
4. Prueba crear un residuo (si eres productor)

## 🎯 Checklist Final

- [ ] Código subido a GitHub
- [ ] Sitio desplegado en Netlify
- [ ] Variables de entorno configuradas
- [ ] SQL ejecutado en Supabase
- [ ] URLs configuradas en Supabase Auth
- [ ] Aplicación funcionando en producción

## 🔧 Troubleshooting

### Error: "Invalid Supabase URL"
- Verifica las variables de entorno en Netlify
- Asegúrate de haber guardado los cambios
- Redeploy el sitio

### Error: "Table does not exist"
- Ejecuta el SQL en Supabase: `supabase/migrations/001_initial_schema.sql`

### Error de Autenticación
- Verifica las Redirect URLs en Supabase
- Asegúrate de incluir `/**` al final de la URL

## 🚀 Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. En Netlify: **Domain settings** → **Add custom domain**
2. Sigue las instrucciones para configurar tu DNS
3. Netlify proveerá SSL automáticamente con Let's Encrypt

## 📱 Próximos Pasos Opcionales

- Configurar notificaciones por email (Supabase)
- Agregar Google Analytics
- Configurar CI/CD para deploys automáticos
- Agregar tests automatizados

---

**¡Tu plataforma GranjaLab estará en producción y lista para usar!** 🎉
