import * as ordersService from "../services/orders.service.js";

export const crearOrden = async (req, res) => {
  try {
    const { direccion, ciudad, metodo_pago } = req.body;
    if (!direccion || !ciudad || !metodo_pago) {
      return res.status(400).json({
        ok: false,
        message: "direccion, ciudad y metodo_pago son requeridos",
      });
    }
    const orden = await ordersService.crearOrden(req.user.id_usuario, {
      direccion,
      ciudad,
      metodo_pago,
    });
    return res.status(201).json({
      ok: true,
      message: "Orden creada exitosamente",
      data: orden,
    });
  } catch (error) {
    console.error(error);
    if (error.message.includes("carrito") || error.message.includes("Stock")) {
      return res.status(400).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const obtenerOrdenes = async (req, res) => {
  try {
    const { id_usuario, rol } = req.user; // Extraer rol del JWT

    console.log(`📦 Usuario ${id_usuario} (rol: ${rol}) solicitando órdenes`);

    // Pasar tanto el id_usuario como el rol al servicio
    const ordenes = await ordersService.obtenerOrdenes(id_usuario, rol);

    console.log(`✅ Devolviendo ${ordenes.length} órdenes`);

    return res.json({ ok: true, data: ordenes });
  } catch (error) {
    console.error("❌ Error en obtener Ordenes:", error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const obtenerDetalleOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario, rol } = req.user;

    const orden = await ordersService.obtenerDetalleOrden(
      id_usuario,
      parseInt(id, 10),
      rol
    );

    return res.json({ ok: true, data: orden });
  } catch (error) {
    console.error(error);
    if (error.message === "Orden no encontrada") {
      return res.status(404).json({ ok: false, message: error.message });
    }
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};
