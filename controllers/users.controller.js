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
