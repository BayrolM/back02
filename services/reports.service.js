import sql from "../config/db.js";

/**
 * Obtener estadísticas para el dashboard
 */
export const obtenerDashboard = async () => {
  // Total de ventas
  const totalVentas = await sql`
    SELECT COALESCE(SUM(total), 0) as total
    FROM ventas
    WHERE estado = true
  `;

  // Total de órdenes
  const totalOrdenes = await sql`
    SELECT COUNT(*) as total
    FROM pedidos
    WHERE estado != 'carrito'
  `;

  // Total de productos
  const totalProductos = await sql`
    SELECT COUNT(*) as total
    FROM productos
    WHERE estado = true
  `;

  // Total de usuarios
  const totalUsuarios = await sql`
    SELECT COUNT(*) as total
    FROM usuarios
    WHERE estado = true
  `;

  // Productos con bajo stock
  const productosBajoStock = await sql`
    SELECT COUNT(*) as total
    FROM productos
    WHERE stock_actual <= stock_min AND estado = true
  `;

  // Ventas por mes (últimos 6 meses)
  const ventasPorMes = await sql`
    SELECT 
      TO_CHAR(fecha_venta, 'YYYY-MM') as mes,
      COUNT(*) as cantidad,
      SUM(total) as total
    FROM ventas
    WHERE fecha_venta >= NOW() - INTERVAL '6 months'
      AND estado = true
    GROUP BY TO_CHAR(fecha_venta, 'YYYY-MM')
    ORDER BY mes DESC
  `;

  // Productos más vendidos
  const productosMasVendidos = await sql`
    SELECT 
      p.id_producto,
      p.nombre,
      p.sku,
      SUM(dv.cantidad) as total_vendido
    FROM detalle_ventas dv
    INNER JOIN productos p ON dv.id_producto = p.id_producto
    INNER JOIN ventas v ON dv.id_venta = v.id_venta
    WHERE v.estado = true
    GROUP BY p.id_producto, p.nombre, p.sku
    ORDER BY total_vendido DESC
    LIMIT 10
  `;

  return {
    resumen: {
      total_ventas: parseFloat(totalVentas[0].total),
      total_ordenes: parseInt(totalOrdenes[0].total),
      total_productos: parseInt(totalProductos[0].total),
      total_usuarios: parseInt(totalUsuarios[0].total),
      productos_bajo_stock: parseInt(productosBajoStock[0].total)
    },
    ventas_por_mes: ventasPorMes,
    productos_mas_vendidos: productosMasVendidos
  };
};

/**
 * Obtener reporte de ventas con filtros
 */
export const obtenerReporteVentas = async (filtros = {}) => {
  const { fecha_inicio, fecha_fin, limit = 50 } = filtros;

  let whereConditions = sql`WHERE v.estado = true`;

  if (fecha_inicio && fecha_fin) {
    whereConditions = sql`
      WHERE v.estado = true 
        AND v.fecha_venta >= ${fecha_inicio}::timestamp
        AND v.fecha_venta <= ${fecha_fin}::timestamp
    `;
  } else if (fecha_inicio) {
    whereConditions = sql`
      WHERE v.estado = true 
        AND v.fecha_venta >= ${fecha_inicio}::timestamp
    `;
  } else if (fecha_fin) {
    whereConditions = sql`
      WHERE v.estado = true 
        AND v.fecha_venta <= ${fecha_fin}::timestamp
    `;
  }

  const ventas = await sql`
    SELECT 
      v.id_venta,
      v.fecha_venta,
      v.metodo_pago,
      v.total,
      u.nombres,
      u.apellidos,
      u.email,
      p.id_pedido,
      p.estado as estado_pedido
    FROM ventas v
    INNER JOIN usuarios u ON v.id_cliente = u.id_usuario
    LEFT JOIN pedidos p ON v.id_pedido = p.id_pedido
    ${whereConditions}
    ORDER BY v.fecha_venta DESC
    LIMIT ${limit}
  `;

  // Calcular totales
  const totales = await sql`
    SELECT 
      COUNT(*) as cantidad_ventas,
      SUM(total) as total_ventas,
      AVG(total) as promedio_venta
    FROM ventas v
    ${whereConditions}
  `;

  return {
    ventas,
    totales: {
      cantidad_ventas: parseInt(totales[0].cantidad_ventas),
      total_ventas: parseFloat(totales[0].total_ventas || 0),
      promedio_venta: parseFloat(totales[0].promedio_venta || 0)
    }
  };
};
