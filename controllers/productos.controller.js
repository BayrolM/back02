import * as productosService from "../services/productos.service.js";

// Controlador para listar productos
export const listar = async (req, res) => {
  try {
    console.log("📦 GET /api/products - Listando productos");
    const filters = {
      q: req.query.q,
      marca: req.query.marca,
      categoria: req.query.categoria,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      estado: req.query.estado,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 10,
    };

    const result = await productosService.listarProductos(filters);
    return res.json({
      ok: true,
      data: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    console.error("❌ Error en listar:", err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

// Controlador para obtener un producto por ID
export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productosService.obtenerProductoPorId(
      parseInt(id, 10)
    );
    if (!producto)
      return res
        .status(404)
        .json({ ok: false, message: "Producto no encontrado" });
    return res.json({ ok: true, data: producto });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

// Controlador para crear un nuevo producto
export const crear = async (req, res) => {
  try {
    const payload = req.body;
    // Validaciones básicas
    if (
      !payload.sku ||
      !payload.nombre ||
      !payload.id_marca ||
      !payload.id_categoria ||
      payload.precio_venta == null
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Faltan campos requeridos: sku, nombre, id_marca, id_categoria, precio_venta",
      });
    }

    const result = await productosService.crearProducto(payload);
    return res
      .status(201)
      .json({ ok: true, message: "Producto creado", data: result });
  } catch (err) {
    console.error(err);

    if (err?.code === "23505") {
      return res
        .status(400)
        .json({ ok: false, message: "SKU o campo único ya existe" });
    }
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

// Controlador para actualizar un producto
export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const ok = await productosService.actualizarProducto(
      parseInt(id, 10),
      payload
    );
    if (!ok)
      return res
        .status(400)
        .json({ ok: false, message: "Nada para actualizar" });
    return res.json({ ok: true, message: "Producto actualizado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

// Controlador para eliminar un producto
export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    await productosService.eliminarProducto(parseInt(id, 10));
    return res.json({ ok: true, message: "Producto eliminado (estado=0)" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

// Controlador para obtener productos destacados
export const featured = async (req, res) => {
  try {
    console.log("⭐ GET /api/products/featured - Productos destacados");
    const limit = parseInt(req.query.limit ?? 10, 10);
    console.log("📋 Limit:", limit);
    const items = await productosService.productosDestacados(limit);
    console.log("✅ Productos destacados obtenidos:", items.length);
    return res.json({ ok: true, data: items });
  } catch (err) {
    console.error("❌ Error en featured:", err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
