import sql from "../config/db.js";

export const getProfile = async (req, res) => {
  try {
    const result = await sql`
            SELECT * FROM usuarios WHERE id_usuario = ${req.user.id_usuario}
        `;

    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { nombres, apellidos, telefono, direccion, ciudad } = req.body;

    await sql`
            UPDATE usuarios
            SET nombres = ${nombres},
                apellidos = ${apellidos},
                telefono = ${telefono},
                direccion = ${direccion},
                ciudad = ${ciudad}
            WHERE id_usuario = ${req.user.id_usuario}
        `;

    return res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

/**
 * Listar todos los usuarios (Admin)
 */
export const listarUsuarios = async (req, res) => {
  try {
    const { q, id_rol, estado, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = {};

    // Filtro de búsqueda por nombre, apellido, email o documento
    if (q) {
      whereConditions.push(sql`(
                nombres ILIKE ${"%" + q + "%"} OR 
                apellidos ILIKE ${"%" + q + "%"} OR 
                email ILIKE ${"%" + q + "%"} OR 
                documento ILIKE ${"%" + q + "%"}
            )`);
    }

    // Filtro por rol
    if (id_rol) {
      whereConditions.push(sql`id_rol = ${parseInt(id_rol)}`);
    }

    // Filtro por estado
    if (estado !== undefined) {
      const estadoBool = estado === "true" || estado === "1";
      whereConditions.push(sql`estado = ${estadoBool}`);
    }

    // Construir query base
    let query;
    if (whereConditions.length > 0) {
      query = sql`
                SELECT 
                    u.id_usuario,
                    u.id_rol,
                    r.nombre as nombre_rol,
                    u.tipo_documento,
                    u.documento,
                    u.nombres,
                    u.apellidos,
                    u.email,
                    u.telefono,
                    u.direccion,
                    u.ciudad,
                    u.estado
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                WHERE ${sql.unsafe(
                  whereConditions.map((_, i) => `condition_${i}`).join(" AND ")
                )}
                ORDER BY u.id_usuario DESC
                LIMIT ${parseInt(limit)}
                OFFSET ${offset}
            `;

      // Ejecutar con las condiciones
      const conditions = sql.join(whereConditions, sql` AND `);
      query = sql`
                SELECT 
                    u.id_usuario,
                    u.id_rol,
                    r.nombre as nombre_rol,
                    u.tipo_documento,
                    u.documento,
                    u.nombres,
                    u.apellidos,
                    u.email,
                    u.telefono,
                    u.direccion,
                    u.ciudad,
                    u.estado
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                WHERE ${conditions}
                ORDER BY u.id_usuario DESC
                LIMIT ${parseInt(limit)}
                OFFSET ${offset}
            `;
    } else {
      query = sql`
                SELECT 
                    u.id_usuario,
                    u.id_rol,
                    r.nombre as nombre_rol,
                    u.tipo_documento,
                    u.documento,
                    u.nombres,
                    u.apellidos,
                    u.email,
                    u.telefono,
                    u.direccion,
                    u.ciudad,
                    u.estado
                FROM usuarios u
                LEFT JOIN roles r ON u.id_rol = r.id_rol
                ORDER BY u.id_usuario DESC
                LIMIT ${parseInt(limit)}
                OFFSET ${offset}
            `;
    }

    const usuarios = await query;

    // Contar total de usuarios
    let countQuery;
    if (whereConditions.length > 0) {
      const conditions = sql.join(whereConditions, sql` AND `);
      countQuery = sql`
                SELECT COUNT(*) as total 
                FROM usuarios u
                WHERE ${conditions}
            `;
    } else {
      countQuery = sql`SELECT COUNT(*) as total FROM usuarios`;
    }

    const totalResult = await countQuery;
    const total = parseInt(totalResult[0].total);

    return res.json({
      ok: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: usuarios,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener usuarios",
    });
  }
};

/**
 * Obtener detalle de un usuario específico (Admin)
 */
export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await sql`
            SELECT 
                u.id_usuario,
                u.id_rol,
                r.nombre as nombre_rol,
                r.descripcion as descripcion_rol,
                u.tipo_documento,
                u.documento,
                u.nombres,
                u.apellidos,
                u.email,
                u.telefono,
                u.direccion,
                u.ciudad,
                u.estado
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = ${id}
        `;

    if (usuario.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Obtener estadísticas del usuario
    const pedidos = await sql`
            SELECT COUNT(*) as total 
            FROM pedidos 
            WHERE id_usuario = ${id} AND estado != 'carrito'
        `;

    const ventas = await sql`
            SELECT 
                COUNT(*) as total_compras,
                COALESCE(SUM(total), 0) as total_gastado
            FROM ventas 
            WHERE id_cliente = ${id} AND estado = true
        `;

    return res.json({
      ok: true,
      data: {
        ...usuario[0],
        estadisticas: {
          total_pedidos: parseInt(pedidos[0].total),
          total_compras: parseInt(ventas[0].total_compras),
          total_gastado: parseFloat(ventas[0].total_gastado),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener el usuario",
    });
  }
};

/**
 * Actualizar información de un usuario (Admin)
 */
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_rol, nombres, apellidos, telefono, direccion, ciudad, estado } =
      req.body;

    // Verificar que el usuario existe
    const usuarioExiste = await sql`
            SELECT * FROM usuarios WHERE id_usuario = ${id}
        `;

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Actualizar usuario
    const usuarioActualizado = await sql`
            UPDATE usuarios
            SET 
                id_rol = ${
                  id_rol !== undefined ? id_rol : usuarioExiste[0].id_rol
                },
                nombres = ${nombres || usuarioExiste[0].nombres},
                apellidos = ${apellidos || usuarioExiste[0].apellidos},
                telefono = ${
                  telefono !== undefined ? telefono : usuarioExiste[0].telefono
                },
                direccion = ${
                  direccion !== undefined
                    ? direccion
                    : usuarioExiste[0].direccion
                },
                ciudad = ${
                  ciudad !== undefined ? ciudad : usuarioExiste[0].ciudad
                },
                estado = ${
                  estado !== undefined ? estado : usuarioExiste[0].estado
                }
            WHERE id_usuario = ${id}
            RETURNING *
        `;

    return res.json({
      ok: true,
      message: "Usuario actualizado exitosamente",
      data: usuarioActualizado[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar el usuario",
    });
  }
};

/**
 * Desactivar un usuario (Admin)
 */
export const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuarioExiste = await sql`
            SELECT * FROM usuarios WHERE id_usuario = ${id}
        `;

    if (usuarioExiste.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Desactivar usuario
    await sql`
            UPDATE usuarios
            SET estado = false
            WHERE id_usuario = ${id}
        `;

    return res.json({
      ok: true,
      message: "Usuario desactivado exitosamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al desactivar el usuario",
    });
  }
};
