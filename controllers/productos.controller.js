import * as productosService from "../services/productos.service.js";

export const listar = async (req, res) => {
  try {
    const filters = {
      q: req.query.q,
      marca: req.query.marca,
      categoria: req.query.categoria,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      estado: req.query.estado,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 10
    };

    const data = await productosService.listarProductos(filters);
    return res.json({ ok: true, ...data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productosService.obtenerProductoPorId(parseInt(id, 10));
    if (!producto) return res.status(404).json({ ok: false, message: "Producto no encontrado" });
    return res.json({ ok: true, data: producto });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

export const crear = async (req, res) => {
  try {
    const payload = req.body;
    // Validaciones básicas
    if (!payload.sku || !payload.nombre || !payload.id_marca || !payload.id_categoria || payload.precio_venta == null) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos: sku, nombre, id_marca, id_categoria, precio_venta" });
    }

    const result = await productosService.crearProducto(payload);
    return res.status(201).json({ ok: true, message: "Producto creado", data: result });
  } catch (err) {
    console.error(err);
    
    if (err?.code === '23505') {
      return res.status(400).json({ ok: false, message: "SKU o campo único ya existe" });
    }
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const ok = await productosService.actualizarProducto(parseInt(id, 10), payload);
    if (!ok) return res.status(400).json({ ok: false, message: "Nada para actualizar" });
    return res.json({ ok: true, message: "Producto actualizado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};

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

export const featured = async (req, res) => {
  try {
    const limit = req.query.limit ?? 10;
    const items = await productosService.productosDestacados(limit);
    return res.json({ ok: true, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error interno" });
  }
};
