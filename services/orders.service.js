import sql from "../config/db.js";

/**
 * Crear una nueva orden desde el carrito
 */
export const crearOrden = async (id_usuario, datosEnvio) => {
  const { direccion, ciudad, metodo_pago } = datosEnvio;

  // Obtener el carrito actual
  const carrito = await sql`
    SELECT * FROM pedidos 
    WHERE id_usuario = ${id_usuario} AND estado = 'carrito'
    LIMIT 1
  `;

  if (carrito.length === 0) {
    throw new Error('No hay items en el carrito');
  }

  const id_pedido = carrito[0].id_pedido;

  // Obtener items del carrito
  const items = await sql`
    SELECT dp.*, p.stock_actual
    FROM detalle_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_pedido = ${id_pedido}
  `;

  if (items.length === 0) {
    throw new Error('El carrito está vacío');
  }

  // Verificar stock de todos los productos
  for (const item of items) {
    if (item.stock_actual < item.cantidad) {
      throw new Error(`Stock insuficiente para el producto ID ${item.id_producto}`);
    }
  }

  // Calcular total
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  // Actualizar el pedido de 'carrito' a 'pendiente'
  await sql`
    UPDATE pedidos 
    SET estado = 'pendiente',
        direccion = ${direccion},
        ciudad = ${ciudad},
        total = ${total},
        fecha_pedido = NOW()
    WHERE id_pedido = ${id_pedido}
  `;

  // Crear registro de venta
  const venta = await sql`
    INSERT INTO ventas (id_pedido, id_cliente, fecha_venta, metodo_pago, total, estado)
    VALUES (${id_pedido}, ${id_usuario}, NOW(), ${metodo_pago}, ${total}, true)
    RETURNING *
  `;

  // Copiar items del pedido a detalle_ventas
  for (const item of items) {
    await sql`
      INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario)
      VALUES (${venta[0].id_venta}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario})
    `;

    // Reducir stock
    await sql`
      UPDATE productos 
      SET stock_actual = stock_actual - ${item.cantidad}
      WHERE id_producto = ${item.id_producto}
    `;
  }

  return {
    id_pedido,
    id_venta: venta[0].id_venta,
    total,
    estado: 'pendiente'
  };
};

/**
 * Obtener historial de órdenes del usuario
 */
export const obtenerOrdenes = async (id_usuario) => {
  const ordenes = await sql`
    SELECT 
      p.id_pedido,
      p.fecha_pedido,
      p.direccion,
      p.ciudad,
      p.total,
      p.estado,
      v.id_venta,
      v.metodo_pago
    FROM pedidos p
    LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
    WHERE p.id_usuario = ${id_usuario} 
      AND p.estado != 'carrito'
    ORDER BY p.fecha_pedido DESC
  `;

  return ordenes;
};

/**
 * Obtener detalle de una orden específica
 */
export const obtenerDetalleOrden = async (id_usuario, id_pedido) => {
  // Verificar que la orden pertenece al usuario
  const orden = await sql`
    SELECT 
      p.id_pedido,
      p.fecha_pedido,
      p.direccion,
      p.ciudad,
      p.total,
      p.estado,
      v.id_venta,
      v.metodo_pago
    FROM pedidos p
    LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
    WHERE p.id_pedido = ${id_pedido} 
      AND p.id_usuario = ${id_usuario}
  `;

  if (orden.length === 0) {
    throw new Error('Orden no encontrada');
  }

  // Obtener items de la orden
  const items = await sql`
    SELECT 
      dp.id_detalle_pedido,
      dp.id_producto,
      dp.cantidad,
      dp.precio_unitario,
      dp.subtotal,
      p.nombre,
      p.sku
    FROM detalle_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_pedido = ${id_pedido}
  `;

  return {
    ...orden[0],
    items
  };
};
