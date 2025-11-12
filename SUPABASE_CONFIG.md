# Configuración de Supabase para GranjaLab

## Problema de Redirección Después del Registro

Si después de registrarte no redirige automáticamente al dashboard, es probable que Supabase esté configurado para requerir confirmación de email.

## Solución: Deshabilitar Confirmación de Email (Para Desarrollo)

### Paso 1: Ve a la Configuración de Autenticación

1. Ve a tu proyecto de Supabase: https://zayxuwfnuqhnlzpwtezj.supabase.co
2. En el menú lateral, ve a **Authentication**
3. Haz clic en **Providers**
4. Busca la sección **Email**

### Paso 2: Deshabilitar "Confirm email"

1. Desmarca la opción **"Confirm email"**
2. Haz clic en **Save**

De esta forma, los usuarios podrán iniciar sesión inmediatamente después de registrarse sin tener que confirmar su correo.

**Nota**: Para producción, es recomendable volver a habilitar la confirmación de email para mayor seguridad.

---

## Configuración de URLs de Redirección (Ya Configuradas)

### Site URL
```
https://ornate-dasik-547146.netlify.app
```

### Redirect URLs
```
http://localhost:3000/**
https://ornate-dasik-547146.netlify.app/**
```

---

## Ejecutar Script SQL (CRÍTICO)

Si aún no lo has hecho, **debes ejecutar el script SQL** para crear las tablas:

1. Ve a **SQL Editor** en Supabase
2. Haz clic en **New query**
3. Copia TODO el contenido de `supabase/migrations/001_initial_schema.sql`
4. Pégalo y haz clic en **Run**

Sin esto, la aplicación no funcionará.

---

## Verificar que Todo Funciona

Después de deshabilitar "Confirm email":

1. Ve a http://localhost:3000/register (o tu URL de Netlify)
2. Regístrate con un nuevo usuario
3. Deberías ser redirigido automáticamente al dashboard según tu rol
4. Si aún no funciona, revisa la consola del navegador para ver errores

---

## Para Producción

Cuando despliegues en producción, considera:

1. **Volver a habilitar** la confirmación de email
2. Configurar un **email template personalizado** en Supabase
3. Configurar **SMTP personalizado** para enviar emails desde tu dominio
4. Agregar **restricciones de dominio** si es necesario
