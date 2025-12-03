// routes/productos.routes.js
import { Router } from "express";
import {
  listar, obtener, crear, actualizar, eliminar, featured
} from "../controllers/productos.controller.js";

const router = Router();

router.get("/", listar);                 // GET /api/products?q=&marca=&categoria=&page=&limit=
router.get("/featured", featured);      // GET /api/products/featured?limit=5
router.get("/:id", obtener);            // GET /api/products/:id
router.post("/", crear);                // POST /api/products
router.put("/:id", actualizar);         // PUT /api/products/:id
router.delete("/:id", eliminar);        // DELETE /api/products/:id  (soft delete)

export default router;
