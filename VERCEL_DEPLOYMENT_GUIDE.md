# Guía de Deployment en Vercel - GlamourML API

## 📋 Pre-requisitos

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [GitHub](https://github.com) (recomendado)
- ✅ Base de datos PostgreSQL en Supabase configurada
- ✅ Proyecto con las configuraciones necesarias (ya incluidas)

## 🚀 Pasos para Deployar

### Opción 1: Deploy desde GitHub (Recomendado)

#### 1. Subir tu código a GitHub

```bash
# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - GlamourML API"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

#### 2. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Haz clic en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Autoriza a Vercel para acceder a tu GitHub
5. Selecciona el repositorio `back02` (o como lo hayas nombrado)
6. Haz clic en **"Import"**

#### 3. Configurar Variables de Entorno

En la página de configuración del proyecto:

1. Ve a la sección **"Environment Variables"**
2. Agrega las siguientes variables:

```
DATABASE_URL = postgresql://postgres.kdfwfhmvlhxipijdvwzo:1033488906b@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

JWT_SECRET = tu_secreto_super_seguro_cambiame

NODE_ENV = production
```

**⚠️ IMPORTANTE:** 
- Usa tu propia `DATABASE_URL` de Supabase
- Cambia el `JWT_SECRET` por uno seguro y único
- Asegúrate de que la URL de la BD use el **Connection Pooler** (puerto 6543)

#### 4. Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (1-2 minutos)
3. ¡Listo! Tu API estará disponible en una URL como: `https://tu-proyecto.vercel.app`

---

### Opción 2: Deploy desde CLI de Vercel

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login en Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
# Desde la carpeta del proyecto
vercel

# Seguir las instrucciones:
# - Set up and deploy? Yes
# - Which scope? (tu cuenta)
# - Link to existing project? No
# - What's your project's name? glamourml-api
# - In which directory is your code located? ./
```

#### 4. Configurar Variables de Entorno

```bash
# Agregar variables de entorno
vercel env add DATABASE_URL
# Pegar tu DATABASE_URL cuando te lo pida

vercel env add JWT_SECRET
# Pegar tu JWT_SECRET

vercel env add NODE_ENV
# Escribir: production
```

#### 5. Re-deploy con las variables

```bash
vercel --prod
```

---

## ✅ Verificar el Deployment

### 1. Probar la API

Abre tu navegador o Postman y prueba:

```
GET https://tu-proyecto.vercel.app/
```

Deberías ver:
```json
{
  "message": "GlamourML API",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. Probar la conexión a la BD

```
GET https://tu-proyecto.vercel.app/test-db
```

Deberías ver:
```json
{
  "message": "Conexión exitosa a PostgreSQL",
  "time": "2025-12-03T..."
}
```

### 3. Probar un endpoint de la API

```
GET https://tu-proyecto.vercel.app/api/products
```

---

## 🔧 Configuración de CORS para Frontend

Si vas a conectar un frontend, actualiza el archivo `index.js`:

```javascript
// Configurar CORS para tu dominio específico
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://tu-frontend.vercel.app'
    ],
    credentials: true
}));
```

Luego haz commit y push para re-deployar.

---

## 📝 Actualizaciones Futuras

### Método automático (con GitHub):

1. Haz cambios en tu código local
2. Commit y push a GitHub:
```bash
git add .
git commit -m "Descripción de cambios"
git push
```
3. Vercel detectará el push y re-deployrá automáticamente

### Método manual (con CLI):

```bash
vercel --prod
```

---

## 🐛 Troubleshooting

### Error: "Function Timeout"
- **Causa:** La función tarda más de 10 segundos (límite del plan gratuito)
- **Solución:** Optimiza las queries de BD o considera un plan pago

### Error: "Database connection failed"
- **Causa:** Variables de entorno incorrectas
- **Solución:** Verifica que `DATABASE_URL` esté correcta y use el pooler

### Error: "Module not found"
- **Causa:** Dependencia faltante en `package.json`
- **Solución:** Asegúrate de que todas las dependencias estén en `dependencies`, no en `devDependencies`

### Error: "CORS policy"
- **Causa:** Frontend no autorizado
- **Solución:** Configura CORS correctamente (ver sección anterior)

---

## 📊 Monitoreo

### Ver logs en tiempo real:

```bash
vercel logs
```

### Ver métricas:

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Haz clic en la pestaña **"Analytics"**
3. Revisa requests, errores, y tiempos de respuesta

---

## 🎯 Mejores Prácticas

1. **Usa variables de entorno** para todos los secretos
2. **Nunca** hagas commit del archivo `.env`
3. **Monitorea** los logs regularmente
4. **Configura dominios personalizados** en Vercel (opcional)
5. **Habilita HTTPS** (Vercel lo hace automáticamente)
6. **Usa el Connection Pooler** de Supabase para evitar límites de conexión

---

## 🔗 URLs Importantes

- **Dashboard de Vercel:** https://vercel.com/dashboard
- **Documentación de Vercel:** https://vercel.com/docs
- **Supabase Dashboard:** https://app.supabase.com

---

## 💡 Próximos Pasos

Después del deployment exitoso:

1. ✅ Actualiza la documentación con la URL de producción
2. ✅ Configura un dominio personalizado (opcional)
3. ✅ Conecta tu frontend a la API
4. ✅ Configura monitoring y alertas
5. ✅ Implementa CI/CD con GitHub Actions (opcional)

---

¡Tu API está lista para producción! 🎉
