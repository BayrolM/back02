import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  obtenerDashboard,
  obtenerReporteVentas
} from "../controllers/reports.controller.js";

const router = Router();

// Todas las rutas de reportes requieren autenticación
// En producción, deberías agregar un middleware adicional para verificar rol de admin
router.get("/dashboard", authRequired, obtenerDashboard);
router.get("/sales", authRequired, obtenerReporteVentas);

export default router;
