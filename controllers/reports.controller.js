import * as reportsService from "../services/reports.service.js";

export const obtenerDashboard = async (req, res) => {
  try {
    const dashboard = await reportsService.obtenerDashboard();
    return res.json({ ok: true, data: dashboard });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const obtenerReporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limit } = req.query;

    const reporte = await reportsService.obtenerReporteVentas({
      fecha_inicio,
      fecha_fin,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    return res.json({ ok: true, data: reporte });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};

export const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await reportsService.obtenerDetalleVenta(id);

    if (!venta) {
      return res.status(404).json({
        ok: false,
        message: "Venta no encontrada",
      });
    }

    return res.json({ ok: true, data: venta });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error en el servidor" });
  }
};
