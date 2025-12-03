# API Documentation - GlamourML Backend

Base URL: `http://localhost:3000`

## 1. Autenticación y Usuarios

### POST /api/auth/register
Registrar un nuevo usuario.

**Body:**
```json
{
  "id_rol": 2,
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "ciudad": "Bogotá",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Usuario registrado correctamente"
}
```

---

### POST /api/auth/login
Iniciar sesión.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### GET /api/users/profile
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id_usuario": 1,
  "id_rol": 2,
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "ciudad": "Bogotá",
  "estado": true
}
```

---

### PUT /api/users/profile
Actualizar información del perfil.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "telefono": "3009876543",
  "direccion": "Carrera 45 #12-34",
  "ciudad": "Medellín"
}
```

**Response:**
```json
{
  "message": "Perfil actualizado correctamente"
}
```

---

## 2. Productos

### GET /api/products
Listar todos los productos con filtros y paginación.

**Query Parameters:**
- `q` (opcional): Búsqueda por nombre, SKU o descripción
- `marca` (opcional): Filtrar por ID de marca
- `categoria` (opcional): Filtrar por ID de categoría
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `estado` (opcional): Estado del producto (1 = activo, 0 = inactivo)
- `page` (opcional, default: 1): Número de página
- `limit` (opcional, default: 10): Items por página

**Example:**
```
GET /api/products?q=crema&categoria=1&page=1&limit=10
```

**Response:**
```json
{
  "ok": true,
  "total": 25,
  "page": 1,
  "limit": 10,
  "items": [
    {
      "id_producto": 1,
      "sku": "PROD001",
      "nombre": "Crema Facial",
      "descripcion": "Crema hidratante",
      "id_marca": 1,
      "id_categoria": 1,
      "costo_promedio": 15000,
      "precio_venta": 25000,
      "stock_actual": 50,
      "stock_max": 100,
      "stock_min": 10,
      "estado": true
    }
  ]
}
```

---

### GET /api/products/:id
Obtener detalle de un producto específico.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id_producto": 1,
    "sku": "PROD001",
    "nombre": "Crema Facial",
    "descripcion": "Crema hidratante",
    "id_marca": 1,
    "id_categoria": 1,
    "costo_promedio": 15000,
    "precio_venta": 25000,
    "stock_actual": 50,
    "stock_max": 100,
    "stock_min": 10,
    "estado": true
  }
}
```

---

### GET /api/products/featured
Obtener productos destacados.

**Query Parameters:**
- `limit` (opcional, default: 10): Cantidad de productos

**Response:**
```json
{
  "ok": true,
  "items": [...]
}
```

---

## 3. Carrito de Compras

### GET /api/cart
Obtener carrito del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
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
        "precio_unitario": 25000,
        "subtotal": 50000,
        "nombre": "Crema Facial",
        "sku": "PROD001",
        "stock_actual": 50
      }
    ],
    "total": 50000
  }
}
```

---

### POST /api/cart/items
Agregar producto al carrito.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "id_producto": 1,
  "cantidad": 2
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id_pedido": 1,
    "items": [...],
    "total": 50000
  }
}
```

---

### PUT /api/cart/items/:id
Actualizar cantidad de producto en el carrito.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "cantidad": 3
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id_pedido": 1,
    "items": [...],
    "total": 75000
  }
}
```

---

### DELETE /api/cart/items/:id
Eliminar producto del carrito.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id_pedido": 1,
    "items": [...],
    "total": 25000
  }
}
```

---

## 4. Órdenes/Pedidos

### POST /api/orders
Crear nueva orden desde el carrito.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "metodo_pago": "tarjeta"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Orden creada exitosamente",
  "data": {
    "id_pedido": 1,
    "id_venta": 1,
    "total": 50000,
    "estado": "pendiente"
  }
}
```

---

### GET /api/orders
Obtener historial de órdenes del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id_pedido": 1,
      "fecha_pedido": "2025-12-02T20:00:00.000Z",
      "direccion": "Calle 123 #45-67",
      "ciudad": "Bogotá",
      "total": 50000,
      "estado": "pendiente",
      "id_venta": 1,
      "metodo_pago": "tarjeta"
    }
  ]
}
```

---

### GET /api/orders/:id
Obtener detalle de una orden específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id_pedido": 1,
    "fecha_pedido": "2025-12-02T20:00:00.000Z",
    "direccion": "Calle 123 #45-67",
    "ciudad": "Bogotá",
    "total": 50000,
    "estado": "pendiente",
    "id_venta": 1,
    "metodo_pago": "tarjeta",
    "items": [
      {
        "id_detalle_pedido": 1,
        "id_producto": 1,
        "cantidad": 2,
        "precio_unitario": 25000,
        "subtotal": 50000,
        "nombre": "Crema Facial",
        "sku": "PROD001"
      }
    ]
  }
}
```

---

## 5. Reportes

### GET /api/reports/dashboard
Obtener estadísticas para dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "resumen": {
      "total_ventas": 1500000,
      "total_ordenes": 45,
      "total_productos": 120,
      "total_usuarios": 35,
      "productos_bajo_stock": 8
    },
    "ventas_por_mes": [
      {
        "mes": "2025-12",
        "cantidad": 15,
        "total": 500000
      }
    ],
    "productos_mas_vendidos": [
      {
        "id_producto": 1,
        "nombre": "Crema Facial",
        "sku": "PROD001",
        "total_vendido": 50
      }
    ]
  }
}
```

---

### GET /api/reports/sales
Obtener reporte de ventas.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `fecha_inicio` (opcional): Fecha de inicio (formato: YYYY-MM-DD)
- `fecha_fin` (opcional): Fecha de fin (formato: YYYY-MM-DD)
- `limit` (opcional, default: 50): Cantidad de registros

**Example:**
```
GET /api/reports/sales?fecha_inicio=2025-12-01&fecha_fin=2025-12-31&limit=100
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "ventas": [
      {
        "id_venta": 1,
        "fecha_venta": "2025-12-02T20:00:00.000Z",
        "metodo_pago": "tarjeta",
        "total": 50000,
        "nombres": "Juan",
        "apellidos": "Pérez",
        "email": "juan@example.com",
        "id_pedido": 1,
        "estado_pedido": "pendiente"
      }
    ],
    "totales": {
      "cantidad_ventas": 45,
      "total_ventas": 1500000,
      "promedio_venta": 33333.33
    }
  }
}
```

---

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en los datos enviados
- `401 Unauthorized`: No autenticado (falta token)
- `403 Forbidden`: Token inválido
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Notas Importantes

1. Todas las rutas que requieren autenticación necesitan el header `Authorization: Bearer <token>`
2. El token se obtiene al hacer login y tiene una duración de 7 días
3. Los productos destacados se ordenan por stock y precio
4. El carrito se crea automáticamente al agregar el primer producto
5. Al crear una orden, el carrito se convierte en pedido y se reduce el stock automáticamente
