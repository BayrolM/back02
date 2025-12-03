import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../config/db.js";

export const register = async (req, res) => {
    try {
        const {
            id_rol,
            tipo_documento,
            documento,
            nombres,
            apellidos,
            email,
            telefono,
            direccion,
            ciudad,
            password
        } = req.body;

        // Verificar si el correo ya existe
        const emailExists = await sql`SELECT * FROM usuarios WHERE email = ${email}`;

        if (emailExists.length > 0) {
            return res.status(400).json({ message: "El email ya está registrado" });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        await sql`
            INSERT INTO usuarios (
                id_rol, tipo_documento, documento, nombres, apellidos,
                email, telefono, direccion, ciudad, password_hash, estado
            )
            VALUES (
                ${id_rol}, ${tipo_documento}, ${documento}, ${nombres}, ${apellidos},
                ${email}, ${telefono}, ${direccion}, ${ciudad}, ${hashedPassword}, true
            )
        `;

        return res.json({ message: "Usuario registrado correctamente" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;

        if (result.length === 0) {
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        const user = result[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        const token = jwt.sign(
            {
                id_usuario: user.id_usuario,
                email: user.email,
                rol: user.id_rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({ token });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};
