# Guía de Pruebas en Postman - GlamourML API

## Configuración Inicial

**Base URL:** `http://localhost:3000`

---

## PASO 1: Verificar Conexión a la Base de Datos

### GET /test-db
**Método:** GET  
**URL:** `http://localhost:3000/test-db`  
**Headers:** Ninguno  
**Body:** Ninguno

**Resultado esperado:**
```json
{
  "message": "Conexión exitosa a PostgreSQL",
  "time": "2025-12-02T22:18:00.000Z"
}
```

---

## PASO 2: Crear Datos Iniciales (Ejecutar en Supabase SQL Editor)

Antes de probar los endpoints, necesitas ejecutar estos scripts en el SQL Editor de Supabase:

```sql
-- 1. Crear roles
INSERT INTO roles (nombre, descripcion, estado) VALUES
('Admin', 'Administrador del sistema', true),
('Cliente', 'Cliente regular', true);

-- 2. Crear categorías
INSERT INTO categorias (nombre, descripcion, estado) VALUES
('Cuidado Facial', 'Productos para el rostro', true),
('Cuidado Corporal', 'Productos para el cuerpo', true),
('Maquillaje', 'Productos de maquillaje', true);

-- 3. Crear marcas
INSERT INTO marcas (nombre, descripcion, estado) VALUES
('L''Oréal', 'Marca francesa de cosméticos', true),
('Nivea', 'Marca alemana de cuidado personal', true),
('MAC', 'Marca de maquillaje profesional', true);

-- 4. Crear productos de ejemplo
INSERT INTO productos (sku, nombre, id_marca, id_categoria, descripcion, costo_promedio, precio_venta, stock_actual, stock_max, stock_min, estado) VALUES
('PROD001', 'Crema Facial Hidratante', 1, 1, 'Crema hidratante para todo tipo de piel', 15000, 25000, 50, 100, 10, true),
('PROD002', 'Loción Corporal', 2, 2, 'Loción hidratante corporal', 12000, 20000, 30, 80, 5, true),
('PROD003', 'Labial Mate', 3, 3, 'Labial de larga duración', 18000, 30000, 25, 60, 8, true),
('PROD004', 'Serum Facial', 1, 1, 'Serum anti-edad', 25000, 45000, 20, 50, 5, true),
('PROD005', 'Base de Maquillaje', 3, 3, 'Base líquida de cobertura media', 22000, 38000, 15, 40, 5, true);
```

---

## PASO 3: Pruebas de Autenticación

### 3.1. Registrar un nuevo usuario

**Método:** POST  
**URL:** `http://localhost:3000/api/auth/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "id_rol": 2,
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombres": "Juan",
  "apellidos": "Pérez García",
  "email": "juan@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "password": "password123"
}
```

**Resultado esperado:**
```json
{
  "message": "Usuario registrado correctamente"
}
```

---

### 3.2. Iniciar sesión

**Método:** POST  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Resultado esperado:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoxLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2wiOjIsImlhdCI6MTcwMTU1MDAwMCwiZXhwIjoxNzAyMTU0ODAwfQ.xxxxx"
}
```

**⚠️ IMPORTANTE:** Copia el token que recibes. Lo necesitarás para las siguientes peticiones.

---

## PASO 4: Pruebas de Perfil de Usuario

### 4.1. Obtener perfil

**Método:** GET  
**URL:** `http://localhost:3000/api/users/profile`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

**Resultado esperado:**
```json
{
  "id_usuario": 1,
  "id_rol": 2,
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombres": "Juan",
  "apellidos": "Pérez García",
  "email": "juan@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "estado": true
}
```

---

### 4.2. Actualizar perfil

**Método:** PUT  
**URL:** `http://localhost:3000/api/users/profile`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "telefono": "3009876543",
  "direccion": "Carrera 45 #12-34",
  "ciudad": "Medellín"
}
```

**Resultado esperado:**
```json
{
  "message": "Perfil actualizado correctamente"
}
```

---

## PASO 5: Pruebas de Productos

### 5.1. Listar todos los productos

**Método:** GET  
**URL:** `http://localhost:3000/api/products`  
**Headers:** Ninguno  
**Body:** Ninguno

**Resultado esperado:**
```json
{
  "ok": true,
  "total": 5,
  "page": 1,
  "limit": 10,
  "items": [...]
}
```

---

### 5.2. Buscar productos

**Método:** GET  
**URL:** `http://localhost:3000/api/products?q=crema&page=1&limit=5`  
**Headers:** Ninguno  
**Body:** Ninguno

---

### 5.3. Filtrar por categoría

**Método:** GET  
**URL:** `http://localhost:3000/api/products?categoria=1`  
**Headers:** Ninguno  
**Body:** Ninguno

---

### 5.4. Obtener producto por ID

**Método:** GET  
**URL:** `http://localhost:3000/api/products/1`  
**Headers:** Ninguno  
**Body:** Ninguno

---

### 5.5. Productos destacados

**Método:** GET  
**URL:** `http://localhost:3000/api/products/featured?limit=3`  
**Headers:** Ninguno  
**Body:** Ninguno

---

## PASO 6: Pruebas de Carrito

### 6.1. Ver carrito vacío

**Método:** GET  
**URL:** `http://localhost:3000/api/cart`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

**Resultado esperado:**
```json
{
  "ok": true,
  "data": {
    "id_pedido": 1,
    "items": [],
    "total": 0
  }
}
```

---

### 6.2. Agregar producto al carrito

**Método:** POST  
**URL:** `http://localhost:3000/api/cart/items`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "id_producto": 1,
  "cantidad": 2
}
```

**Resultado esperado:**
```json
{
  "ok": true,
  "data": {
    "id_pedido": 1,
    "items": [
      {
        "id_detalle_pedido": 1,
        "id_producto": 1,
        "cantidad": 2,
        "precio_unitario": "25000.00",
        "subtotal": "50000.00",
        "nombre": "Crema Facial Hidratante",
        "sku": "PROD001",
        "stock_actual": 50
      }
    ],
    "total": 50000
  }
}
```

---

### 6.3. Agregar otro producto

**Método:** POST  
**URL:** `http://localhost:3000/api/cart/items`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "id_producto": 3,
  "cantidad": 1
}
```

---

### 6.4. Actualizar cantidad de un producto

**Método:** PUT  
**URL:** `http://localhost:3000/api/cart/items/1`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "cantidad": 3
}
```

**Nota:** Reemplaza `1` en la URL con el `id_detalle_pedido` que obtuviste al agregar el producto.

---

### 6.5. Eliminar producto del carrito

**Método:** DELETE  
**URL:** `http://localhost:3000/api/cart/items/2`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

**Nota:** Reemplaza `2` con el ID del item que quieres eliminar.

---

## PASO 7: Pruebas de Órdenes

### 7.1. Crear orden desde el carrito

**Método:** POST  
**URL:** `http://localhost:3000/api/orders`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "metodo_pago": "tarjeta"
}
```

**Resultado esperado:**
```json
{
  "ok": true,
  "message": "Orden creada exitosamente",
  "data": {
    "id_pedido": 1,
    "id_venta": 1,
    "total": 75000,
    "estado": "pendiente"
  }
}
```

---

### 7.2. Ver historial de órdenes

**Método:** GET  
**URL:** `http://localhost:3000/api/orders`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

---

### 7.3. Ver detalle de una orden

**Método:** GET  
**URL:** `http://localhost:3000/api/orders/1`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

---

## PASO 8: Pruebas de Reportes

### 8.1. Dashboard general

**Método:** GET  
**URL:** `http://localhost:3000/api/reports/dashboard`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

**Resultado esperado:**
```json
{
  "ok": true,
  "data": {
    "resumen": {
      "total_ventas": 75000,
      "total_ordenes": 1,
      "total_productos": 5,
      "total_usuarios": 1,
      "productos_bajo_stock": 0
    },
    "ventas_por_mes": [...],
    "productos_mas_vendidos": [...]
  }
}
```

---

### 8.2. Reporte de ventas

**Método:** GET  
**URL:** `http://localhost:3000/api/reports/sales?limit=10`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

---

### 8.3. Reporte de ventas con filtro de fechas

**Método:** GET  
**URL:** `http://localhost:3000/api/reports/sales?fecha_inicio=2025-12-01&fecha_fin=2025-12-31`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** Ninguno

---

## Orden Recomendado de Pruebas

1. ✅ Verificar conexión DB (`/test-db`)
2. ✅ Ejecutar scripts SQL en Supabase
3. ✅ Registrar usuario (`POST /api/auth/register`)
4. ✅ Login (`POST /api/auth/login`) - **Guardar el token**
5. ✅ Ver perfil (`GET /api/users/profile`)
6. ✅ Listar productos (`GET /api/products`)
7. ✅ Ver carrito (`GET /api/cart`)
8. ✅ Agregar productos al carrito (`POST /api/cart/items`)
9. ✅ Crear orden (`POST /api/orders`)
10. ✅ Ver historial de órdenes (`GET /api/orders`)
11. ✅ Ver dashboard (`GET /api/reports/dashboard`)

---

## Notas Importantes

- **Token de autenticación:** Después del login, copia el token y úsalo en el header `Authorization: Bearer TOKEN` para todas las peticiones protegidas.
- **IDs dinámicos:** Los IDs en las URLs pueden variar según los datos que crees. Ajusta según sea necesario.
- **Estado del servidor:** Asegúrate de que `npm run dev` esté corriendo antes de hacer las peticiones.
- **Errores comunes:**
  - `401 Unauthorized`: Token faltante o inválido
  - `400 Bad Request`: Datos incorrectos en el body
  - `404 Not Found`: Recurso no existe (verifica el ID)
  - `500 Internal Server Error`: Error en el servidor (revisa la consola)
